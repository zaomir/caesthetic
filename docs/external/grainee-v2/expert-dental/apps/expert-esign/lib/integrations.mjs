import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { spawn } from 'node:child_process';
import { randomToken, sha256, toWahaChatId } from './core.mjs';

function bool(value, fallback = false) {
  if (value === undefined || value === null || value === '') return fallback;
  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());
}

async function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { ...options, stdio: ['ignore', 'pipe', 'pipe'] });
    const stdout = [];
    const stderr = [];
    child.stdout.on('data', (chunk) => stdout.push(Buffer.from(chunk)));
    child.stderr.on('data', (chunk) => stderr.push(Buffer.from(chunk)));
    child.on('error', reject);
    child.on('close', (code) => resolve({
      code,
      stdout: Buffer.concat(stdout),
      stderr: Buffer.concat(stderr),
    }));
  });
}

export function createWahaAdapter(env = process.env) {
  const enabled = bool(env.WAHA_ENABLED, false);
  const baseUrl = String(env.WAHA_URL || '').replace(/\/$/, '');
  const apiKey = env.WAHA_API_KEY || '';
  const session = env.WAHA_SESSION || 'default';

  async function request(route, options = {}) {
    if (!enabled) throw new Error('waha_disabled');
    if (!baseUrl || !apiKey) throw new Error('waha_not_configured');
    const response = await fetch(`${baseUrl}${route}`, {
      ...options,
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        ...(options.headers ?? {}),
      },
      signal: AbortSignal.timeout(30000),
    });
    const text = await response.text();
    let body;
    try { body = text ? JSON.parse(text) : {}; } catch { body = { raw: text }; }
    if (!response.ok) {
      const error = new Error(`waha_http_${response.status}`);
      error.status = response.status;
      error.body = body;
      throw error;
    }
    return body;
  }

  async function sendFile({ phone, fileUrl, filename, caption }) {
    const chatId = toWahaChatId(phone);
    if (!chatId) throw new Error('invalid_phone');
    const payload = {
      session,
      chatId,
      file: {
        url: fileUrl,
        filename,
        mimetype: 'application/pdf',
      },
      caption,
    };
    const result = await request('/api/sendFile', { method: 'POST', body: JSON.stringify(payload) });
    return {
      providerMessageId: result.id ?? result._data?.id?.id ?? result.key?.id ?? null,
      raw: result,
    };
  }

  async function sendText({ phone, text }) {
    const chatId = toWahaChatId(phone);
    if (!chatId) throw new Error('invalid_phone');
    return request('/api/sendText', {
      method: 'POST',
      body: JSON.stringify({ session, chatId, text }),
    });
  }

  async function health() {
    if (!enabled) return { ok: false, enabled: false };
    try {
      const result = await request(`/api/sessions/${encodeURIComponent(session)}`, { method: 'GET' });
      return { ok: true, enabled: true, session, status: result.status ?? result.engine?.state ?? 'unknown' };
    } catch (error) {
      return { ok: false, enabled: true, session, error: error.message };
    }
  }

  return { enabled, session, sendFile, sendText, health };
}

export function createTsaAdapter(env = process.env) {
  const enabled = bool(env.TSA_ENABLED, false);
  const required = bool(env.TSA_REQUIRED, false);
  const provider = env.TSA_PROVIDER_NAME || 'RFC3161 TSA';
  const tsaUrl = env.TSA_URL || '';
  const caFile = env.TSA_CA_FILE || '';
  const timeoutMs = Number(env.TSA_TIMEOUT_MS || 20000);

  async function timestamp(pdfBuffer) {
    if (!enabled) return { status: 'DISABLED', required, provider, tsaUrl };
    if (!tsaUrl) throw new Error('tsa_url_missing');
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'expert-esign-tsa-'));
    const pdfPath = path.join(dir, 'document.pdf');
    const queryPath = path.join(dir, 'request.tsq');
    const responsePath = path.join(dir, 'response.tsr');
    try {
      await fs.writeFile(pdfPath, pdfBuffer, { mode: 0o600 });
      const queryResult = await run('openssl', ['ts', '-query', '-data', pdfPath, '-sha256', '-cert', '-out', queryPath]);
      if (queryResult.code !== 0) throw new Error(`tsa_query_failed:${queryResult.stderr.toString('utf8').slice(-400)}`);
      const query = await fs.readFile(queryPath);
      const response = await fetch(tsaUrl, {
        method: 'POST',
        headers: {
          'content-type': 'application/timestamp-query',
          accept: 'application/timestamp-reply',
        },
        body: query,
        signal: AbortSignal.timeout(timeoutMs),
      });
      const token = Buffer.from(await response.arrayBuffer());
      if (!response.ok || token.length < 32) throw new Error(`tsa_http_${response.status}`);
      await fs.writeFile(responsePath, token, { mode: 0o600 });
      const inspect = await run('openssl', ['ts', '-reply', '-in', responsePath, '-text']);
      if (inspect.code !== 0) throw new Error(`tsa_reply_invalid:${inspect.stderr.toString('utf8').slice(-400)}`);
      const text = inspect.stdout.toString('utf8');
      const genTime = text.match(/Time stamp:\s*(.+)/i)?.[1]?.trim() ?? null;
      const serialNumber = text.match(/Serial number:\s*(.+)/i)?.[1]?.trim() ?? null;
      const policyOid = text.match(/Policy OID:\s*(.+)/i)?.[1]?.trim() ?? null;
      let verificationStatus = 'TOKEN_PARSED_CERT_CHAIN_NOT_CONFIGURED';
      let verificationDetail = null;
      if (caFile) {
        const verify = await run('openssl', ['ts', '-verify', '-data', pdfPath, '-in', responsePath, '-CAfile', caFile]);
        verificationStatus = verify.code === 0 ? 'VERIFIED' : 'FAILED';
        verificationDetail = (verify.code === 0 ? verify.stdout : verify.stderr).toString('utf8').slice(-800);
      }
      return {
        status: 'RECEIVED',
        required,
        provider,
        tsaUrl,
        token,
        tokenHash: sha256(token),
        requestHash: sha256(query),
        genTime,
        serialNumber,
        policyOid,
        verificationStatus,
        verificationDetail,
        evidenceNote: 'Detached RFC 3161 timestamp; legal qualification in Kyrgyzstan remains counsel/provider gated.',
      };
    } finally {
      await fs.rm(dir, { recursive: true, force: true });
    }
  }

  return { enabled, required, provider, tsaUrl, timestamp };
}

export function createCrmAdapter(env = process.env) {
  const callbackUrl = env.CRM_CALLBACK_URL || '';
  const callbackApiKey = env.CRM_CALLBACK_API_KEY || '';
  const enabled = env.EXPERT_ESIGN_MODE !== 'test' && Boolean(callbackUrl);

  async function notify(event) {
    if (!enabled) return { status: env.EXPERT_ESIGN_MODE === 'test' ? 'SKIPPED_TEST_MODE' : 'SKIPPED_NOT_CONFIGURED' };
    const response = await fetch(callbackUrl, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...(callbackApiKey ? { authorization: `Bearer ${callbackApiKey}` } : {}),
        'idempotency-key': event.idempotencyKey || randomToken(18),
      },
      body: JSON.stringify(event),
      signal: AbortSignal.timeout(15000),
    });
    const text = await response.text();
    if (!response.ok) throw new Error(`crm_callback_${response.status}:${text.slice(0, 300)}`);
    return { status: 'DELIVERED', httpStatus: response.status };
  }

  return { configured: enabled, notify };
}
