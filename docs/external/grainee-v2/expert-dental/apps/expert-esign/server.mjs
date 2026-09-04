import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import archiver from 'archiver';
import { z } from 'zod';
import {
  appendAudit,
  buildSnapshot,
  canonicalHash,
  isoNow,
  maskPhone,
  nextDocumentNumber,
  randomToken,
  redactObject,
  retentionUntil,
  sessionCode,
  sha256,
  stableStringify,
  validateTemplateFields,
  verifyAuditChain,
} from './lib/core.mjs';
import { createPool, initializeDatabase } from './lib/db.mjs';
import {
  authMiddleware,
  authenticateUser,
  cookieOptions,
  createStaffUser,
  issueSession,
  requireRoles,
} from './lib/auth.mjs';
import { renderSignedPdf } from './lib/pdf.mjs';
import { createEvidenceStorage, streamToNode } from './lib/storage.mjs';
import { createCrmAdapter, createTsaAdapter, createWahaAdapter } from './lib/integrations.mjs';
import { createProviderRegistry } from './lib/providers/index.mjs';
import { sealedDocumentCallback, validateSqnsSnapshot } from './lib/crm-contract.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const env = process.env;
const port = Number(env.PORT || 8787);
const basePath = (env.BASE_PATH || '/esign').replace(/\/$/, '');
const publicOrigin = (env.PUBLIC_ORIGIN || `http://localhost:${port}${basePath}`).replace(/\/$/, '');
const maxBodyMb = Number(env.MAX_JSON_BODY_MB || 8);
const pool = createPool(env);
const storage = createEvidenceStorage(env);
const waha = createWahaAdapter(env);
const tsa = createTsaAdapter(env);
const crm = createCrmAdapter(env);
const providers = createProviderRegistry(env);
const auth = authMiddleware(env);
const clinic = {
  legalName: 'ИП Раимова Камилла Саидовна',
  license: 'лицензия № 4879 от 15.01.2026',
  address: 'Кыргызская Республика, г. Бишкек, проспект Эркиндик, 43',
};
const allowCounselGated = ['1', 'true', 'yes'].includes(String(env.ALLOW_COUNSEL_GATED_TEMPLATES || '').toLowerCase());
const applicationMode = env.EXPERT_ESIGN_MODE || 'test';
const isTestMode = applicationMode === 'test';

function requestId(req) {
  return req.headers['x-request-id'] || crypto.randomUUID();
}
function ip(req) {
  return req.ip || req.socket?.remoteAddress || null;
}
function ua(req) {
  return req.headers['user-agent'] || null;
}
function asyncRoute(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}
function apiError(res, status, error, details) {
  return res.status(status).json({ error, ...(details ? { details } : {}) });
}
function documentPrefix(row) {
  return `patients/${row.patient_id}/episodes/${row.episode_id || 'none'}/documents/${row.id}`;
}
function oneTimeFileSignature(documentId, expiresAt) {
  return crypto.createHmac('sha256', env.JWT_SECRET).update(`${documentId}|${expiresAt}`).digest('base64url');
}
function roleCanApprove(role, required) {
  if (!required) return true;
  if (required === 'doctor') return role === 'doctor' || role === 'compliance' || role === 'system_admin';
  if (required === 'clinic_authorized') return ['clinic_authorized', 'compliance', 'system_admin'].includes(role);
  return role === required || role === 'system_admin';
}
function hasSyntheticPatientPrefix(value) {
  return /^(TEST|DEMO|ТЕСТ|ДЕМО)(?:\s|[-_:])/i.test(String(value || ''));
}

const app = express();
app.set('trust proxy', Number(env.TRUST_PROXY || 1));
app.disable('x-powered-by');
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", 'data:'],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'"],
      frameAncestors: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// Provider webhooks must be verified against the exact request bytes. The
// route therefore precedes the general JSON parser. TEST mode accepts only the
// synthetic Mock provider; vendor adapters remain closed behind their gates.
app.post(`${basePath}/webhooks/:provider`, express.raw({ type: 'application/json', limit: '1mb' }), asyncRoute(async (req, res) => {
  let provider;
  try {
    provider = providers.get(req.params.provider);
  } catch (error) {
    return apiError(res, 404, 'signature_provider_unavailable', { reason: error.message });
  }
  const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from(req.body || '');
  const rawText = rawBody.toString('utf8');
  let payload;
  try { payload = JSON.parse(rawText); } catch { return apiError(res, 400, 'invalid_webhook_json'); }
  let verified = false;
  try { verified = provider.verifyWebhook({ rawBody: rawText, headers: req.headers }); } catch (error) {
    return apiError(res, 503, 'provider_webhook_gate_closed', { reason: error.message });
  }
  if (!verified) return apiError(res, 401, 'invalid_webhook_signature');
  const event = provider.normalizeWebhook(payload);
  if (!event?.id || !event?.type || !event?.occurredAt) return apiError(res, 400, 'invalid_provider_event');
  const requestTimestamp = req.headers['x-expert-timestamp']
    ? new Date(Number(req.headers['x-expert-timestamp']) * 1000)
    : new Date();
  const payloadSha256 = sha256(rawBody);
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const receipt = await client.query(
      `INSERT INTO provider_webhook_receipts
       (provider, provider_event_id, request_timestamp, payload_sha256)
       VALUES ($1,$2,$3,$4)
       ON CONFLICT (provider, provider_event_id) DO NOTHING
       RETURNING provider_event_id`,
      [provider.name, event.id, requestTimestamp, payloadSha256],
    );
    if (!receipt.rowCount) {
      await client.query('ROLLBACK');
      return res.status(200).json({ accepted: true, duplicate: true, providerEventId: event.id });
    }
    const envelope = event.envelopeId
      ? await client.query(
        'SELECT id FROM signature_envelopes WHERE provider=$1 AND provider_envelope_id=$2',
        [provider.name, event.envelopeId],
      )
      : { rows: [] };
    await client.query(
      `INSERT INTO provider_events
       (envelope_id, provider, provider_event_id, event_type, occurred_at, payload_sha256, payload)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [envelope.rows[0]?.id || null, provider.name, event.id, event.type, new Date(event.occurredAt), payloadSha256, payload],
    );
    await client.query('COMMIT');
    return res.status(202).json({ accepted: true, duplicate: false, providerEventId: event.id });
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}));
app.use(express.json({ limit: `${maxBodyMb}mb` }));
app.use(cookieParser());
app.use((req, res, next) => {
  req.requestId = requestId(req);
  res.setHeader('x-request-id', req.requestId);
  res.setHeader('cache-control', 'no-store');
  next();
});

app.get('/healthz', asyncRoute(async (_req, res) => {
  const db = await pool.query('SELECT now() AS now');
  let storageOk = true;
  try { await storage.ensureBucket(); } catch { storageOk = false; }
  res.status(storageOk ? 200 : 503).json({
    ok: storageOk,
    service: 'expert-esign',
    database: Boolean(db.rows[0]?.now),
    immutableStorage: storageOk,
    mode: env.NODE_ENV || 'development',
    applicationMode,
    testMode: isTestMode,
    deployedSha: env.DEPLOY_SHA || 'local',
    syntheticPatientPolicy: isTestMode ? 'PREFIX_REQUIRED:TEST|DEMO|ТЕСТ|ДЕМО' : 'DISABLED',
    outboundDeliveryEnabled: !isTestMode && waha.enabled,
    signatureProviders: providers.health(),
    crmContract: 'expert-esign.sqns-boundary.v1; SQNS endpoints remain vendor-gated',
    templatesMayBeCounselGated: allowCounselGated,
    tundukIntegration: 'DEFERRED_INTEGRATION_GATE',
    time: isoNow(),
  });
}));

app.get('/internal/waha-file/:documentId', asyncRoute(async (req, res) => {
  const expiresAt = Number(req.query.expires || 0);
  const sig = String(req.query.sig || '');
  if (!expiresAt || expiresAt < Date.now()) return apiError(res, 410, 'delivery_link_expired');
  const expected = oneTimeFileSignature(req.params.documentId, expiresAt);
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return apiError(res, 403, 'invalid_delivery_signature');
  const result = await pool.query('SELECT document_number, final_pdf_key FROM documents WHERE id = $1 AND final_pdf_key IS NOT NULL', [req.params.documentId]);
  const doc = result.rows[0];
  if (!doc) return apiError(res, 404, 'document_not_found');
  const object = await storage.get(doc.final_pdf_key);
  res.type('application/pdf');
  res.setHeader('content-disposition', `inline; filename="${doc.document_number}.pdf"`);
  streamToNode(object.body).pipe(res);
}));

const router = express.Router();
router.get('/healthz', (_req, res) => res.redirect('/healthz'));

router.post('/api/auth/login', asyncRoute(async (req, res) => {
  const schema = z.object({ username: z.string().min(1).max(100), password: z.string().min(8).max(300), totp: z.string().optional() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return apiError(res, 400, 'invalid_input', parsed.error.flatten());
  const user = await authenticateUser(pool, parsed.data, {
    ipAddress: ip(req), userAgent: ua(req), requestId: req.requestId,
  });
  if (!user) return apiError(res, 401, 'invalid_credentials_or_mfa');
  const token = await issueSession(user, env);
  res.cookie('expert_esign_session', token, cookieOptions(env));
  res.json({ id: user.id, username: user.username, displayName: user.display_name, role: user.role });
}));
router.post('/api/auth/logout', (req, res) => {
  res.clearCookie('expert_esign_session', cookieOptions(env));
  res.json({ ok: true });
});
router.get('/api/auth/me', auth, (req, res) => res.json({ user: req.user }));

router.post('/api/staff', auth, requireRoles('compliance', 'system_admin'), asyncRoute(async (req, res) => {
  const schema = z.object({
    username: z.string().min(3).max(100),
    displayName: z.string().min(3).max(200),
    role: z.enum(['doctor','administrator','clinic_authorized','compliance','system_admin']),
    password: z.string().min(12).max(300),
    totpSecret: z.string().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return apiError(res, 400, 'invalid_input', parsed.error.flatten());
  const user = await createStaffUser(pool, parsed.data);
  await appendAudit(pool, {
    actorType: 'staff', actorId: req.user.sub, eventType: 'STAFF_USER_CREATED',
    payload: { createdUserId: user.id, role: user.role, username: user.username },
    ipAddress: ip(req), userAgent: ua(req), requestId: req.requestId,
  });
  res.status(201).json({ user });
}));
router.get('/api/staff', auth, requireRoles('compliance','system_admin','administrator','doctor','clinic_authorized'), asyncRoute(async (_req, res) => {
  const result = await pool.query('SELECT id, username, display_name, role, active, created_at FROM staff_users ORDER BY display_name');
  res.json({ staff: result.rows });
}));

router.get('/api/templates', auth, asyncRoute(async (_req, res) => {
  const result = await pool.query(
    `SELECT id, template_code, version, title, status, category, required_approver_role,
            required_signer_types, retention_class, body_hash, effective_from, effective_until
     FROM template_versions ORDER BY category, template_code, version DESC`,
  );
  res.json({ templates: result.rows, allowCounselGated });
}));
router.get('/api/providers', auth, (_req, res) => res.json({ providers: providers.health() }));
router.get('/api/templates/:id', auth, asyncRoute(async (req, res) => {
  const result = await pool.query('SELECT * FROM template_versions WHERE id = $1', [req.params.id]);
  if (!result.rowCount) return apiError(res, 404, 'template_not_found');
  res.json({ template: result.rows[0] });
}));
router.post('/api/templates/:id/activate', auth, requireRoles('compliance','system_admin'), asyncRoute(async (req, res) => {
  return apiError(res, 409, 'version_registry_has_no_in_use_forms', {
    authority: 'docs/legal/raimov/expert-dental/VERSION_REGISTRY.md',
    rule: 'Activation is generated from an exact IN_USE registry row; API evidence strings cannot activate a form.',
  });
}));

router.post('/api/patients', auth, requireRoles('administrator','doctor','compliance','system_admin'), asyncRoute(async (req, res) => {
  const schema = z.object({
    externalCrmId: z.string().max(200).optional(),
    fullName: z.string().min(3).max(250),
    birthDate: z.string().optional(),
    phoneE164: z.string().max(40).optional(),
    identityMethod: z.string().max(100).optional(),
    identityReference: z.string().max(250).optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return apiError(res, 400, 'invalid_input', parsed.error.flatten());
  const p = parsed.data;
  if (isTestMode && !hasSyntheticPatientPrefix(p.fullName)) {
    return apiError(res, 400, 'test_mode_requires_synthetic_patient_prefix');
  }
  const result = await pool.query(
    `INSERT INTO patients (external_crm_id, full_name, birth_date, phone_e164, identity_method, identity_reference)
     VALUES ($1,$2,$3,$4,$5,$6)
     ON CONFLICT (external_crm_id) WHERE external_crm_id IS NOT NULL DO UPDATE SET
       full_name=EXCLUDED.full_name, birth_date=EXCLUDED.birth_date, phone_e164=EXCLUDED.phone_e164,
       identity_method=COALESCE(EXCLUDED.identity_method,patients.identity_method),
       identity_reference=COALESCE(EXCLUDED.identity_reference,patients.identity_reference), updated_at=now()
     RETURNING *`,
    [p.externalCrmId || null, p.fullName, p.birthDate || null, p.phoneE164 || null, p.identityMethod || null, p.identityReference || null],
  );
  await appendAudit(pool, {
    patientId: result.rows[0].id, actorType: 'staff', actorId: req.user.sub,
    eventType: 'PATIENT_UPSERTED', payload: { externalCrmId: p.externalCrmId || null },
    ipAddress: ip(req), userAgent: ua(req), requestId: req.requestId,
  });
  res.status(201).json({ patient: result.rows[0] });
}));
router.get('/api/patients', auth, asyncRoute(async (req, res) => {
  const q = String(req.query.q || '').trim();
  const result = await pool.query(
    `SELECT id, external_crm_id, full_name, birth_date, phone_e164, identity_method, created_at
     FROM patients WHERE $1='' OR full_name ILIKE '%'||$1||'%' OR phone_e164 ILIKE '%'||$1||'%'
     ORDER BY updated_at DESC LIMIT 100`, [q],
  );
  res.json({ patients: result.rows });
}));

router.post('/api/episodes', auth, requireRoles('administrator','doctor','compliance','system_admin'), asyncRoute(async (req, res) => {
  const schema = z.object({ patientId: z.string().uuid(), externalCrmId: z.string().optional(), direction: z.string().min(2), doctorId: z.string().uuid().optional(), metadata: z.record(z.any()).optional() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return apiError(res, 400, 'invalid_input', parsed.error.flatten());
  const e = parsed.data;
  const result = await pool.query(
    `INSERT INTO episodes (external_crm_id, patient_id, direction, doctor_id, metadata)
     VALUES ($1,$2,$3,$4,$5)
     ON CONFLICT (external_crm_id) WHERE external_crm_id IS NOT NULL DO UPDATE SET
       patient_id=EXCLUDED.patient_id, direction=EXCLUDED.direction, doctor_id=EXCLUDED.doctor_id,
       metadata=EXCLUDED.metadata
     RETURNING *`,
    [e.externalCrmId || null, e.patientId, e.direction, e.doctorId || (req.user.role === 'doctor' ? req.user.sub : null), e.metadata || {}],
  );
  await appendAudit(pool, {
    patientId: e.patientId, episodeId: result.rows[0].id, actorType: 'staff', actorId: req.user.sub,
    eventType: 'EPISODE_UPSERTED', payload: { direction: e.direction },
    ipAddress: ip(req), userAgent: ua(req), requestId: req.requestId,
  });
  res.status(201).json({ episode: result.rows[0] });
}));
router.get('/api/episodes', auth, asyncRoute(async (req, res) => {
  const patientId = String(req.query.patientId || '');
  const result = await pool.query(
    `SELECT e.*, p.full_name AS patient_name, u.display_name AS doctor_name
     FROM episodes e JOIN patients p ON p.id=e.patient_id
     LEFT JOIN staff_users u ON u.id=e.doctor_id
     WHERE $1='' OR e.patient_id=$1::uuid ORDER BY e.opened_at DESC LIMIT 100`, [patientId],
  );
  res.json({ episodes: result.rows });
}));

router.post('/api/documents', auth, requireRoles('doctor','administrator','clinic_authorized','compliance','system_admin'), asyncRoute(async (req, res) => {
  const schema = z.object({
    patientId: z.string().uuid(), episodeId: z.string().uuid().optional(), templateVersionId: z.string().uuid(),
    fields: z.record(z.any()), representativeId: z.string().uuid().optional(), doctorId: z.string().uuid().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return apiError(res, 400, 'invalid_input', parsed.error.flatten());
  const input = parsed.data;
  const [templateResult, patientResult, episodeResult, representativeResult] = await Promise.all([
    pool.query('SELECT * FROM template_versions WHERE id=$1', [input.templateVersionId]),
    pool.query('SELECT * FROM patients WHERE id=$1', [input.patientId]),
    input.episodeId ? pool.query('SELECT * FROM episodes WHERE id=$1 AND patient_id=$2', [input.episodeId, input.patientId]) : Promise.resolve({ rows: [] }),
    input.representativeId ? pool.query('SELECT * FROM representatives WHERE id=$1 AND patient_id=$2', [input.representativeId, input.patientId]) : Promise.resolve({ rows: [] }),
  ]);
  const templateRow = templateResult.rows[0];
  const patient = patientResult.rows[0];
  const episode = episodeResult.rows[0] || null;
  const representative = representativeResult.rows[0] || null;
  if (!templateRow || !patient) return apiError(res, 404, 'template_or_patient_not_found');
  if (templateRow.status !== 'ACTIVE' && !(isTestMode && allowCounselGated && templateRow.body?.testEligible)) {
    return apiError(res, 409, 'template_not_effective_or_test_eligible', { status: templateRow.status });
  }
  const template = templateRow.body;
  const fieldErrors = validateTemplateFields(template, input.fields);
  if (fieldErrors.length) return apiError(res, 400, 'missing_required_fields', fieldErrors);
  const doctorId = input.doctorId || episode?.doctor_id || (req.user.role === 'doctor' ? req.user.sub : null);
  let doctor = null;
  if (doctorId) doctor = (await pool.query('SELECT id, display_name, role FROM staff_users WHERE id=$1', [doctorId])).rows[0] || null;
  const seq = Number((await pool.query("SELECT nextval(pg_get_serial_sequence('audit_events','id')) AS seq")).rows[0].seq);
  const documentNumber = nextDocumentNumber(seq);
  const generatedAt = isoNow();
  const snapshot = buildSnapshot(template, {
    patient: { id: patient.id, fullName: patient.full_name, birthDate: patient.birth_date, phoneE164: patient.phone_e164 },
    representative: representative ? { id: representative.id, fullName: representative.full_name, authorityBasis: representative.authority_basis } : null,
    episode: episode ? { id: episode.id, direction: episode.direction, externalCrmId: episode.external_crm_id } : null,
    doctor: doctor ? { id: doctor.id, displayName: doctor.display_name } : null,
    clinic,
    fields: input.fields,
    system: { generated_at: generatedAt, document_number: documentNumber },
  });
  const snapshotHash = canonicalHash(snapshot);
  const readyWithoutApproval = !template.requiredApproverRole;
  const result = await pool.query(
    `INSERT INTO documents
     (document_number, patient_id, episode_id, template_version_id, status, field_values,
      rendered_snapshot, snapshot_hash, created_by, doctor_id)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
    [documentNumber, input.patientId, input.episodeId || null, input.templateVersionId,
      readyWithoutApproval ? 'READY_FOR_PATIENT_SIGNATURE' : 'DOCTOR_REVIEW', input.fields,
      snapshot, snapshotHash, req.user.sub, doctorId],
  );
  const row = result.rows[0];
  await appendAudit(pool, {
    documentId: row.id, patientId: row.patient_id, episodeId: row.episode_id,
    actorType: 'staff', actorId: req.user.sub, eventType: 'DOCUMENT_CREATED',
    payload: { documentNumber, templateCode: template.code, templateVersion: template.version, snapshotHash, status: row.status },
    ipAddress: ip(req), userAgent: ua(req), requestId: req.requestId,
  });
  res.status(201).json({ document: row });
}));

router.get('/api/documents', auth, asyncRoute(async (req, res) => {
  const status = String(req.query.status || '');
  const patientId = String(req.query.patientId || '');
  const result = await pool.query(
    `SELECT d.*, p.full_name AS patient_name, p.phone_e164, tv.template_code, tv.version AS template_version,
            tv.title AS template_title, tv.required_approver_role, u.display_name AS doctor_name
     FROM documents d JOIN patients p ON p.id=d.patient_id
     JOIN template_versions tv ON tv.id=d.template_version_id
     LEFT JOIN staff_users u ON u.id=d.doctor_id
     WHERE ($1='' OR d.status=$1) AND ($2='' OR d.patient_id=$2::uuid)
     ORDER BY d.created_at DESC LIMIT 200`, [status, patientId],
  );
  res.json({ documents: result.rows });
}));
router.get('/api/documents/:id', auth, asyncRoute(async (req, res) => {
  const result = await pool.query(
    `SELECT d.*, p.full_name AS patient_name, p.phone_e164, tv.body AS template_body,
            tv.template_code, tv.version AS template_version, tv.title AS template_title,
            tv.required_approver_role, u.display_name AS doctor_name
     FROM documents d JOIN patients p ON p.id=d.patient_id
     JOIN template_versions tv ON tv.id=d.template_version_id
     LEFT JOIN staff_users u ON u.id=d.doctor_id WHERE d.id=$1`, [req.params.id],
  );
  if (!result.rowCount) return apiError(res, 404, 'document_not_found');
  res.json({ document: result.rows[0] });
}));

router.post('/api/documents/:id/approve', auth, asyncRoute(async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await client.query(
      `SELECT d.*, tv.required_approver_role, tv.template_code, tv.version AS template_version
       FROM documents d JOIN template_versions tv ON tv.id=d.template_version_id
       WHERE d.id=$1 FOR UPDATE`, [req.params.id],
    );
    const document = result.rows[0];
    if (!document) return apiError(res, 404, 'document_not_found');
    if (!['DRAFT','DOCTOR_REVIEW'].includes(document.status)) return apiError(res, 409, 'document_not_approvable', { status: document.status });
    if (!roleCanApprove(req.user.role, document.required_approver_role)) return apiError(res, 403, 'approver_role_mismatch', { required: document.required_approver_role });
    const approvalHash = sha256(`${document.snapshot_hash}|${req.user.sub}|${isoNow()}`);
    const approvedAt = isoNow();
    await client.query(
      `UPDATE documents SET status='READY_FOR_PATIENT_SIGNATURE', approved_by=$2, approved_at=$3, approval_hash=$4
       WHERE id=$1`, [document.id, req.user.sub, approvedAt, approvalHash],
    );
    await client.query(
      `INSERT INTO document_approvals (document_id, approver_id, approval_type, approved_hash, approved_at, ip_address, user_agent)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [document.id, req.user.sub, document.required_approver_role || 'not_required', approvalHash, approvedAt, ip(req), ua(req)],
    );
    await client.query('COMMIT');
    await appendAudit(pool, {
      documentId: document.id, patientId: document.patient_id, episodeId: document.episode_id,
      actorType: 'staff', actorId: req.user.sub, eventType: 'DOCUMENT_APPROVED_AND_LOCKED',
      payload: { approvalHash, snapshotHash: document.snapshot_hash, approverRole: req.user.role, requiredRole: document.required_approver_role },
      ipAddress: ip(req), userAgent: ua(req), requestId: req.requestId,
    });
    res.json({ ok: true, status: 'READY_FOR_PATIENT_SIGNATURE', approvalHash, approvedAt });
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}));

router.post('/api/documents/:id/signing-session', auth, requireRoles('administrator','compliance','system_admin'), asyncRoute(async (req, res) => {
  const schema = z.object({
    signerType: z.enum(['patient','legal_representative']), representativeId: z.string().uuid().optional(),
    identityMethod: z.string().min(2).max(100), identityReference: z.string().max(250).optional(),
    deviceCode: z.string().min(1).max(100),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return apiError(res, 400, 'invalid_input', parsed.error.flatten());
  const docResult = await pool.query(
    `SELECT d.*, p.full_name AS patient_name FROM documents d JOIN patients p ON p.id=d.patient_id WHERE d.id=$1`,
    [req.params.id],
  );
  const document = docResult.rows[0];
  if (!document) return apiError(res, 404, 'document_not_found');
  if (document.status !== 'READY_FOR_PATIENT_SIGNATURE') return apiError(res, 409, 'document_not_ready', { status: document.status });
  if (parsed.data.signerType === 'legal_representative' && !parsed.data.representativeId) return apiError(res, 400, 'representative_required');
  if (parsed.data.representativeId) {
    const representative = await pool.query('SELECT id FROM representatives WHERE id=$1 AND patient_id=$2', [parsed.data.representativeId, document.patient_id]);
    if (!representative.rowCount) return apiError(res, 400, 'representative_not_valid_for_patient');
  }
  const code = sessionCode();
  const codeHash = sha256(code);
  const expiresAt = new Date(Date.now() + Number(env.SIGNING_SESSION_TTL_MINUTES || 15) * 60000);
  const deviceId = (await pool.query(
    'SELECT id FROM signing_devices WHERE device_code=$1 AND active=true',
    [parsed.data.deviceCode],
  )).rows[0]?.id || null;
  if (!deviceId) return apiError(res, 403, 'managed_signing_device_required');
  const result = await pool.query(
    `INSERT INTO signing_sessions
     (document_id, session_code_hash, created_by, device_id, signer_type, representative_id,
      identity_method, identity_reference, identity_verified_by, identity_verified_at,
      expires_at, status, ip_address, user_agent)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$3,now(),$9,'CREATED',$10,$11) RETURNING id, expires_at`,
    [document.id, codeHash, req.user.sub, deviceId, parsed.data.signerType, parsed.data.representativeId || null,
      parsed.data.identityMethod, parsed.data.identityReference || null, expiresAt, ip(req), ua(req)],
  );
  await pool.query("UPDATE documents SET status='ADMIN_SESSION_STARTED' WHERE id=$1", [document.id]);
  await appendAudit(pool, {
    documentId: document.id, patientId: document.patient_id, episodeId: document.episode_id,
    actorType: 'staff', actorId: req.user.sub, eventType: 'SIGNING_SESSION_CREATED',
    payload: { sessionId: result.rows[0].id, signerType: parsed.data.signerType, identityMethod: parsed.data.identityMethod, deviceCode: parsed.data.deviceCode, expiresAt: result.rows[0].expires_at },
    ipAddress: ip(req), userAgent: ua(req), requestId: req.requestId,
  });
  res.status(201).json({
    sessionId: result.rows[0].id,
    code,
    expiresAt: result.rows[0].expires_at,
    signingUrl: `${publicOrigin}/?sign=${encodeURIComponent(code)}`,
  });
}));

router.get('/api/sign/:code', asyncRoute(async (req, res) => {
  const codeHash = sha256(String(req.params.code || ''));
  const result = await pool.query(
    `SELECT ss.*, d.document_number, d.rendered_snapshot, d.snapshot_hash, d.approval_hash,
            d.patient_id, d.episode_id, d.status AS document_status,
            p.full_name AS patient_name, r.full_name AS representative_name,
            a.display_name AS admin_name, sd.device_code
     FROM signing_sessions ss JOIN documents d ON d.id=ss.document_id
     JOIN patients p ON p.id=d.patient_id
     JOIN staff_users a ON a.id=ss.created_by
     LEFT JOIN representatives r ON r.id=ss.representative_id
     LEFT JOIN signing_devices sd ON sd.id=ss.device_id
     WHERE ss.session_code_hash=$1`, [codeHash],
  );
  const session = result.rows[0];
  if (!session) return apiError(res, 404, 'signing_session_not_found');
  if (new Date(session.expires_at).getTime() < Date.now()) {
    await pool.query("UPDATE signing_sessions SET status='EXPIRED' WHERE id=$1 AND status NOT IN ('SIGNED','CANCELLED')", [session.id]);
    return apiError(res, 410, 'signing_session_expired');
  }
  if (session.status === 'SIGNED') return apiError(res, 409, 'document_already_signed');
  if (!['ADMIN_SESSION_STARTED','IDENTITY_VERIFIED','DOCUMENT_PRESENTED'].includes(session.document_status)) return apiError(res, 409, 'document_not_signable', { status: session.document_status });
  await pool.query("UPDATE signing_sessions SET status='OPENED', started_at=COALESCE(started_at,now()) WHERE id=$1", [session.id]);
  await pool.query("UPDATE documents SET status='IDENTITY_VERIFIED' WHERE id=$1 AND status='ADMIN_SESSION_STARTED'", [session.document_id]);
  await appendAudit(pool, {
    documentId: session.document_id, patientId: session.patient_id, episodeId: session.episode_id,
    actorType: 'patient_session', actorId: session.id, eventType: 'DOCUMENT_OPENED_ON_TABLET',
    payload: { deviceCode: session.device_code || null }, ipAddress: ip(req), userAgent: ua(req), requestId: req.requestId,
  });
  res.json({
    sessionId: session.id,
    expiresAt: session.expires_at,
    signerType: session.signer_type,
    signerName: session.signer_type === 'legal_representative' ? session.representative_name : session.patient_name,
    patientName: session.patient_name,
    documentNumber: session.document_number,
    snapshot: session.rendered_snapshot,
  });
}));

router.post('/api/sign/:code/presented', asyncRoute(async (req, res) => {
  const codeHash = sha256(String(req.params.code || ''));
  const result = await pool.query(
    `UPDATE signing_sessions SET status='PRESENTED', presented_at=now()
     WHERE session_code_hash=$1 AND status IN ('CREATED','OPENED') AND expires_at>now()
     RETURNING document_id`, [codeHash],
  );
  if (!result.rowCount) return apiError(res, 409, 'session_not_presentable');
  await pool.query("UPDATE documents SET status='DOCUMENT_PRESENTED' WHERE id=$1", [result.rows[0].document_id]);
  res.json({ ok: true });
}));

const signSchema = z.object({
  scrollCompleted: z.literal(true),
  acknowledgements: z.record(z.boolean()),
  signature: z.object({
    pngDataUrl: z.string().regex(/^data:image\/png;base64,/),
    strokes: z.array(z.object({
      x: z.number().finite(), y: z.number().finite(), t: z.number().finite().optional(),
    })).min(2),
  }),
  delivery: z.object({ whatsapp: z.boolean().default(true), phoneE164: z.string().optional() }).optional(),
});

router.post('/api/sign/:code', asyncRoute(async (req, res) => {
  const parsed = signSchema.safeParse(req.body);
  if (!parsed.success) return apiError(res, 400, 'invalid_signature_payload', parsed.error.flatten());
  if (parsed.data.signature.strokes.length > Number(env.MAX_SIGNATURE_POINTS || 25000)) return apiError(res, 413, 'signature_too_large');
  const codeHash = sha256(String(req.params.code || ''));
  const sessionResult = await pool.query(
    `SELECT ss.*, d.*, p.full_name AS patient_name, p.phone_e164,
            r.full_name AS representative_name, a.display_name AS admin_name, sd.device_code,
            tv.retention_class
     FROM signing_sessions ss JOIN documents d ON d.id=ss.document_id
     JOIN patients p ON p.id=d.patient_id
     JOIN staff_users a ON a.id=ss.created_by
     JOIN template_versions tv ON tv.id=d.template_version_id
     LEFT JOIN representatives r ON r.id=ss.representative_id
     LEFT JOIN signing_devices sd ON sd.id=ss.device_id
     WHERE ss.session_code_hash=$1`, [codeHash],
  );
  const session = sessionResult.rows[0];
  if (!session) return apiError(res, 404, 'signing_session_not_found');
  if (new Date(session.expires_at).getTime() < Date.now()) return apiError(res, 410, 'signing_session_expired');
  if (!['OPENED','PRESENTED'].includes(session.status)) return apiError(res, 409, 'session_not_signable', { status: session.status });
  if (!['IDENTITY_VERIFIED','DOCUMENT_PRESENTED'].includes(session.status === 'PRESENTED' ? session.status : session.document_status || 'DOCUMENT_PRESENTED')) {
    // Database document status is selected as d.status and may collide with session status; the hard checks below remain decisive.
  }
  const snapshot = session.rendered_snapshot;
  const requiredAcks = snapshot.acknowledgements ?? [];
  const ackValues = parsed.data.acknowledgements;
  if (requiredAcks.some((_, index) => ackValues[String(index)] !== true)) return apiError(res, 400, 'all_acknowledgements_required');
  const signerName = session.signer_type === 'legal_representative' ? session.representative_name : session.patient_name;
  if (!signerName) return apiError(res, 409, 'signer_identity_missing');
  const signedAt = isoNow();
  const vectors = parsed.data.signature.strokes;
  const vectorHash = canonicalHash(vectors);
  const pngBuffer = Buffer.from(parsed.data.signature.pngDataUrl.replace(/^data:image\/png;base64,/, ''), 'base64');
  const pngHash = sha256(pngBuffer);

  await appendAudit(pool, {
    documentId: session.document_id, patientId: session.patient_id, episodeId: session.episode_id,
    actorType: session.signer_type, actorId: session.id, eventType: 'PATIENT_SIGNATURE_CAPTURED',
    payload: { signerType: session.signer_type, signerName, vectorHash, pngHash, scrollCompleted: true, acknowledgements: ackValues, signedAt },
    ipAddress: ip(req), userAgent: ua(req), requestId: req.requestId,
  });
  const auditBeforePdf = await pool.query('SELECT event_hash FROM audit_events WHERE document_id=$1 ORDER BY id DESC LIMIT 1', [session.document_id]);
  const pdfBuffer = await renderSignedPdf({
    document: session,
    snapshot,
    signature: { signerName, signerType: session.signer_type, signedAt, vectorHash, pngHash, pngDataUrl: parsed.data.signature.pngDataUrl },
    signingSession: { identityMethod: session.identity_method, adminName: session.admin_name, deviceCode: session.device_code },
    auditHead: auditBeforePdf.rows[0]?.event_hash ?? null,
  });
  const finalPdfHash = sha256(pdfBuffer);
  const retainUntil = retentionUntil(session.retention_class, new Date(signedAt), env);
  const prefix = documentPrefix(session);
  const pdfKey = `${prefix}/signed.pdf`;
  const signatureKey = `${prefix}/signature-evidence.json`;
  const signatureEvidence = {
    schema: 'expert-esign.signature-evidence.v1',
    documentId: session.document_id,
    documentNumber: session.document_number,
    signingSessionId: session.id,
    signerType: session.signer_type,
    signerName,
    identityMethod: session.identity_method,
    identityReference: session.identity_reference || null,
    identityVerifiedBy: session.identity_verified_by,
    identityVerifiedAt: session.identity_verified_at,
    administeredBy: session.created_by,
    administratorName: session.admin_name,
    deviceCode: session.device_code || null,
    signedAt,
    scrollCompleted: true,
    acknowledgements: ackValues,
    vectorHash,
    pngHash,
    vectors,
    pngDataUrl: parsed.data.signature.pngDataUrl,
    snapshotHash: session.snapshot_hash,
    approvalHash: session.approval_hash,
    finalPdfHash,
  };
  const [pdfStored, signatureStored] = await Promise.all([
    storage.putLocked({ key: pdfKey, body: pdfBuffer, contentType: 'application/pdf', retainUntil, metadata: { documentid: session.document_id, documentnumber: session.document_number, sha256: finalPdfHash } }),
    storage.putLocked({ key: signatureKey, body: Buffer.from(JSON.stringify(signatureEvidence, null, 2)), contentType: 'application/json', retainUntil, metadata: { documentid: session.document_id, sha256: canonicalHash(signatureEvidence) } }),
  ]);
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const locked = await client.query('SELECT status FROM documents WHERE id=$1 FOR UPDATE', [session.document_id]);
    if (!locked.rowCount || !['IDENTITY_VERIFIED','DOCUMENT_PRESENTED','ADMIN_SESSION_STARTED'].includes(locked.rows[0].status)) throw new Error('document_state_changed_during_signing');
    await client.query(
      `INSERT INTO patient_signatures
       (document_id, signing_session_id, signer_type, signer_name, vector_hash, png_hash, signed_at, ip_address, user_agent)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [session.document_id, session.id, session.signer_type, signerName, vectorHash, pngHash, signedAt, ip(req), ua(req)],
    );
    await client.query(
      `UPDATE signing_sessions SET status='SIGNED', acknowledgements=$2, scroll_completed=true, completed_at=$3 WHERE id=$1`,
      [session.id, ackValues, signedAt],
    );
    await client.query(
      `UPDATE documents SET status='SYSTEM_SEALED', final_pdf_key=$2, final_pdf_hash=$3,
       signature_key=$4, retention_until=$5, sealed_at=$6 WHERE id=$1`,
      [session.document_id, pdfKey, finalPdfHash, signatureKey, retainUntil, signedAt],
    );
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
  await appendAudit(pool, {
    documentId: session.document_id, patientId: session.patient_id, episodeId: session.episode_id,
    actorType: 'system', actorId: 'expert-esign', eventType: 'DOCUMENT_SYSTEM_SEALED',
    payload: { finalPdfHash, pdfKey, pdfVersionId: pdfStored.versionId, signatureKey, signatureVersionId: signatureStored.versionId, retentionUntil: retainUntil.toISOString() },
    ipAddress: ip(req), userAgent: ua(req), requestId: req.requestId,
  });

  let timestampResult;
  try {
    timestampResult = await tsa.timestamp(pdfBuffer);
    if (timestampResult.status === 'RECEIVED') {
      const timestampKey = `${prefix}/timestamp-rfc3161.tsr`;
      const tsStored = await storage.putLocked({
        key: timestampKey, body: timestampResult.token, contentType: 'application/timestamp-reply', retainUntil,
        metadata: { documentid: session.document_id, provider: timestampResult.provider, sha256: timestampResult.tokenHash },
      });
      await pool.query(
        `INSERT INTO timestamp_receipts
         (document_id, provider, tsa_url, request_hash, token_key, token_hash, status,
          gen_time, serial_number, policy_oid, verification_status)
         VALUES ($1,$2,$3,$4,$5,$6,'RECEIVED',$7,$8,$9,$10)`,
        [session.document_id, timestampResult.provider, timestampResult.tsaUrl, timestampResult.requestHash,
          timestampKey, timestampResult.tokenHash, timestampResult.genTime ? new Date(timestampResult.genTime) : null,
          timestampResult.serialNumber, timestampResult.policyOid, timestampResult.verificationStatus],
      );
      await pool.query("UPDATE documents SET timestamp_key=$2, timestamp_status='RECEIVED' WHERE id=$1", [session.document_id, timestampKey]);
      await appendAudit(pool, {
        documentId: session.document_id, patientId: session.patient_id, episodeId: session.episode_id,
        actorType: 'external_tsa', actorId: timestampResult.provider, eventType: 'RFC3161_TIMESTAMP_RECEIVED',
        payload: { provider: timestampResult.provider, tsaUrl: timestampResult.tsaUrl, tokenHash: timestampResult.tokenHash, versionId: tsStored.versionId, genTime: timestampResult.genTime, verificationStatus: timestampResult.verificationStatus },
        requestId: req.requestId,
      });
    }
  } catch (error) {
    timestampResult = { status: 'FAILED', error: error.message, required: tsa.required };
    await pool.query(
      `INSERT INTO timestamp_receipts (document_id, provider, tsa_url, request_hash, status, verification_status, error_detail)
       VALUES ($1,$2,$3,$4,'FAILED','FAILED',$5)`,
      [session.document_id, tsa.provider, tsa.tsaUrl, finalPdfHash, error.message.slice(0, 1000)],
    );
    await pool.query("UPDATE documents SET timestamp_status='FAILED', status=CASE WHEN $2 THEN 'TIMESTAMP_PENDING' ELSE status END WHERE id=$1", [session.document_id, tsa.required]);
    await appendAudit(pool, {
      documentId: session.document_id, patientId: session.patient_id, episodeId: session.episode_id,
      actorType: 'system', actorId: 'expert-esign', eventType: 'RFC3161_TIMESTAMP_FAILED',
      payload: { provider: tsa.provider, required: tsa.required, error: error.message }, requestId: req.requestId,
    });
  }

  const auditEvents = await pool.query('SELECT * FROM audit_events WHERE document_id=$1 ORDER BY id', [session.document_id]);
  const auditVerification = verifyAuditChain(auditEvents.rows);
  const manifest = {
    schema: 'expert-esign.evidence-manifest.v1',
    documentId: session.document_id,
    documentNumber: session.document_number,
    patientId: session.patient_id,
    episodeId: session.episode_id,
    template: snapshot.template,
    snapshotHash: session.snapshot_hash,
    approvalHash: session.approval_hash,
    finalPdf: { key: pdfKey, sha256: finalPdfHash, versionId: pdfStored.versionId },
    signatureEvidence: { key: signatureKey, sha256: canonicalHash(signatureEvidence), versionId: signatureStored.versionId },
    timestamp: timestampResult ? redactObject({ ...timestampResult, token: undefined }) : null,
    audit: auditVerification,
    retentionUntil: retainUntil.toISOString(),
    automaticDeletionEnabled: false,
    sealedAt: signedAt,
  };
  const manifestKey = `${prefix}/manifest.json`;
  const manifestStored = await storage.putLocked({
    key: manifestKey, body: Buffer.from(JSON.stringify(manifest, null, 2)), contentType: 'application/json', retainUntil,
    metadata: { documentid: session.document_id, sha256: canonicalHash(manifest) },
  });
  await pool.query('UPDATE documents SET manifest_key=$2 WHERE id=$1', [session.document_id, manifestKey]);
  await appendAudit(pool, {
    documentId: session.document_id, patientId: session.patient_id, episodeId: session.episode_id,
    actorType: 'system', actorId: 'expert-esign', eventType: 'EVIDENCE_MANIFEST_STORED',
    payload: { manifestKey, manifestHash: canonicalHash(manifest), versionId: manifestStored.versionId, auditVerification },
    requestId: req.requestId,
  });

  const deliveryPhone = parsed.data.delivery?.phoneE164 || session.phone_e164;
  let delivery = { status: 'SKIPPED' };
  const timestampAllowsDelivery = !tsa.required || timestampResult?.status === 'RECEIVED';
  if (!isTestMode && parsed.data.delivery?.whatsapp !== false
      && String(env.WAHA_AUTO_SEND_SIGNED_COPY || 'true').toLowerCase() !== 'false'
      && deliveryPhone && timestampAllowsDelivery) {
    try {
      const expiresAt = Date.now() + Number(env.EVIDENCE_EXPORT_TTL_MINUTES || 10) * 60000;
      const sig = oneTimeFileSignature(session.document_id, expiresAt);
      const internalBase = env.WAHA_INTERNAL_FILE_BASE || `http://api:${port}/internal/waha-file`;
      const fileUrl = `${internalBase}/${session.document_id}?expires=${expiresAt}&sig=${encodeURIComponent(sig)}`;
      const sent = await waha.sendFile({
        phone: deliveryPhone,
        fileUrl,
        filename: `${session.document_number}.pdf`,
        caption: `Подписанный документ ${session.document_number}. Сохраните эту копию.`,
      });
      delivery = { status: 'SENT', providerMessageId: sent.providerMessageId };
      await pool.query(
        `INSERT INTO delivery_events (document_id, channel, destination_masked, provider, provider_message_id, status, delivered_at)
         VALUES ($1,'whatsapp',$2,'WAHA',$3,'SENT',now())`,
        [session.document_id, maskPhone(deliveryPhone), sent.providerMessageId],
      );
      await pool.query("UPDATE documents SET status='COPY_DELIVERED', copy_delivered_at=now() WHERE id=$1", [session.document_id]);
      await appendAudit(pool, {
        documentId: session.document_id, patientId: session.patient_id, episodeId: session.episode_id,
        actorType: 'delivery_provider', actorId: 'WAHA', eventType: 'SIGNED_COPY_SENT_TO_PATIENT',
        payload: { channel: 'whatsapp', destinationMasked: maskPhone(deliveryPhone), providerMessageId: sent.providerMessageId },
        requestId: req.requestId,
      });
    } catch (error) {
      delivery = { status: 'FAILED', error: error.message };
      await pool.query(
        `INSERT INTO delivery_events (document_id, channel, destination_masked, provider, status, error_code, error_detail)
         VALUES ($1,'whatsapp',$2,'WAHA','FAILED',$3,$4)`,
        [session.document_id, maskPhone(deliveryPhone), error.message.slice(0, 100), error.message.slice(0, 1000)],
      );
      await appendAudit(pool, {
        documentId: session.document_id, patientId: session.patient_id, episodeId: session.episode_id,
        actorType: 'system', actorId: 'expert-esign', eventType: 'SIGNED_COPY_DELIVERY_FAILED',
        payload: { channel: 'whatsapp', destinationMasked: maskPhone(deliveryPhone), error: error.message }, requestId: req.requestId,
      });
    }
  }
  const sealedCallback = sealedDocumentCallback({
    envelopeId: session.document_id,
    providerEnvelopeId: `internal:${session.document_id}`,
    patientRef: snapshot.patient.externalCrmId || `internal:${session.patient_id}`,
    visitRef: snapshot.episode?.externalCrmId || `internal:${session.episode_id || 'none'}`,
    documentId: snapshot.template.code,
    documentVersion: snapshot.template.version,
    artifactSha256: finalPdfHash,
    sealedAt: signedAt,
  });
  crm.notify({ ...sealedCallback, idempotencyKey: `sealed-${session.document_id}-${finalPdfHash}` }).catch(async (error) => {
    await appendAudit(pool, {
      documentId: session.document_id, patientId: session.patient_id, episodeId: session.episode_id,
      actorType: 'system', actorId: 'expert-esign', eventType: 'CRM_CALLBACK_FAILED', payload: { error: error.message },
    });
  });
  res.status(201).json({
    ok: true,
    documentId: session.document_id,
    documentNumber: session.document_number,
    status: delivery.status === 'SENT' ? 'COPY_DELIVERED' : (tsa.required && timestampResult?.status !== 'RECEIVED' ? 'TIMESTAMP_PENDING' : 'SYSTEM_SEALED'),
    finalPdfHash,
    timestamp: redactObject({ ...timestampResult, token: undefined }),
    delivery,
  });
}));

router.get('/api/documents/:id/pdf', auth, asyncRoute(async (req, res) => {
  const result = await pool.query('SELECT document_number, final_pdf_key FROM documents WHERE id=$1', [req.params.id]);
  const document = result.rows[0];
  if (!document?.final_pdf_key) return apiError(res, 404, 'sealed_pdf_not_found');
  const object = await storage.get(document.final_pdf_key);
  await appendAudit(pool, {
    documentId: req.params.id, actorType: 'staff', actorId: req.user.sub, eventType: 'SEALED_PDF_VIEWED',
    payload: {}, ipAddress: ip(req), userAgent: ua(req), requestId: req.requestId,
  });
  res.type('application/pdf');
  res.setHeader('content-disposition', `inline; filename="${document.document_number}.pdf"`);
  streamToNode(object.body).pipe(res);
}));

router.post('/api/documents/:id/deliver/whatsapp', auth, requireRoles('administrator','compliance','system_admin'), asyncRoute(async (req, res) => {
  if (isTestMode) return apiError(res, 409, 'outbound_delivery_disabled_in_test_mode');
  const schema = z.object({ phoneE164: z.string().min(7).optional() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return apiError(res, 400, 'invalid_input');
  const result = await pool.query(
    `SELECT d.*, p.phone_e164 FROM documents d JOIN patients p ON p.id=d.patient_id WHERE d.id=$1`, [req.params.id],
  );
  const document = result.rows[0];
  if (!document?.final_pdf_key) return apiError(res, 409, 'document_not_sealed');
  if (tsa.required && document.timestamp_status !== 'RECEIVED') return apiError(res, 409, 'trusted_timestamp_required_before_delivery');
  const phone = parsed.data.phoneE164 || document.phone_e164;
  if (!phone) return apiError(res, 400, 'patient_phone_missing');
  const expiresAt = Date.now() + Number(env.EVIDENCE_EXPORT_TTL_MINUTES || 10) * 60000;
  const sig = oneTimeFileSignature(document.id, expiresAt);
  const internalBase = env.WAHA_INTERNAL_FILE_BASE || `http://api:${port}/internal/waha-file`;
  const sent = await waha.sendFile({
    phone,
    fileUrl: `${internalBase}/${document.id}?expires=${expiresAt}&sig=${encodeURIComponent(sig)}`,
    filename: `${document.document_number}.pdf`,
    caption: `Подписанный документ ${document.document_number}. Сохраните эту копию.`,
  });
  await pool.query(
    `INSERT INTO delivery_events (document_id, channel, destination_masked, provider, provider_message_id, status, delivered_at)
     VALUES ($1,'whatsapp',$2,'WAHA',$3,'SENT',now())`,
    [document.id, maskPhone(phone), sent.providerMessageId],
  );
  await pool.query("UPDATE documents SET status='COPY_DELIVERED', copy_delivered_at=now() WHERE id=$1", [document.id]);
  await appendAudit(pool, {
    documentId: document.id, patientId: document.patient_id, episodeId: document.episode_id,
    actorType: 'staff', actorId: req.user.sub, eventType: 'SIGNED_COPY_SENT_TO_PATIENT',
    payload: { channel: 'whatsapp', destinationMasked: maskPhone(phone), providerMessageId: sent.providerMessageId, manualRetry: true },
    ipAddress: ip(req), userAgent: ua(req), requestId: req.requestId,
  });
  res.json({ ok: true, providerMessageId: sent.providerMessageId });
}));

router.post('/api/documents/:id/legal-hold', auth, requireRoles('compliance','system_admin'), asyncRoute(async (req, res) => {
  const schema = z.object({ reason: z.string().min(5).max(2000) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return apiError(res, 400, 'reason_required');
  const result = await pool.query('SELECT * FROM documents WHERE id=$1', [req.params.id]);
  const document = result.rows[0];
  if (!document) return apiError(res, 404, 'document_not_found');
  await pool.query(
    `INSERT INTO legal_holds (patient_id, episode_id, document_id, reason, placed_by)
     VALUES ($1,$2,$3,$4,$5)`,
    [document.patient_id, document.episode_id, document.id, parsed.data.reason, req.user.sub],
  );
  await pool.query("UPDATE documents SET legal_hold=true, status='LEGAL_HOLD' WHERE id=$1", [document.id]);
  for (const key of [document.final_pdf_key, document.signature_key, document.manifest_key, document.timestamp_key].filter(Boolean)) {
    const versions = await storage.listVersions(key);
    for (const version of versions.filter((item) => !item.deleteMarker)) await storage.placeLegalHold(key, version.versionId);
  }
  await appendAudit(pool, {
    documentId: document.id, patientId: document.patient_id, episodeId: document.episode_id,
    actorType: 'staff', actorId: req.user.sub, eventType: 'LEGAL_HOLD_PLACED',
    payload: { reason: parsed.data.reason }, ipAddress: ip(req), userAgent: ua(req), requestId: req.requestId,
  });
  res.json({ ok: true, status: 'LEGAL_HOLD' });
}));

router.get('/api/documents/:id/evidence.zip', auth, requireRoles('compliance','system_admin'), asyncRoute(async (req, res) => {
  const result = await pool.query(
    `SELECT d.*, p.full_name AS patient_name, tv.template_code, tv.version AS template_version
     FROM documents d JOIN patients p ON p.id=d.patient_id
     JOIN template_versions tv ON tv.id=d.template_version_id WHERE d.id=$1`, [req.params.id],
  );
  const document = result.rows[0];
  if (!document) return apiError(res, 404, 'document_not_found');
  const [events, approvals, deliveries, timestamps] = await Promise.all([
    pool.query('SELECT * FROM audit_events WHERE document_id=$1 ORDER BY id', [document.id]),
    pool.query('SELECT * FROM document_approvals WHERE document_id=$1 ORDER BY approved_at', [document.id]),
    pool.query('SELECT * FROM delivery_events WHERE document_id=$1 ORDER BY attempted_at', [document.id]),
    pool.query('SELECT * FROM timestamp_receipts WHERE document_id=$1 ORDER BY created_at', [document.id]),
  ]);
  const chain = verifyAuditChain(events.rows);
  await appendAudit(pool, {
    documentId: document.id, patientId: document.patient_id, episodeId: document.episode_id,
    actorType: 'staff', actorId: req.user.sub, eventType: 'EVIDENCE_EXPORT_REQUESTED', payload: { auditChainBeforeExport: chain },
    ipAddress: ip(req), userAgent: ua(req), requestId: req.requestId,
  });
  res.type('application/zip');
  res.setHeader('content-disposition', `attachment; filename="evidence-${document.document_number}.zip"`);
  const archive = archiver('zip', { zlib: { level: 9 } });
  archive.on('error', (error) => res.destroy(error));
  archive.pipe(res);
  const files = [
    ['01-signed-document.pdf', document.final_pdf_key],
    ['02-signature-evidence.json', document.signature_key],
    ['03-manifest.json', document.manifest_key],
    ['04-timestamp-rfc3161.tsr', document.timestamp_key],
  ];
  for (const [name, key] of files) {
    if (!key) continue;
    try { archive.append(await storage.getBuffer(key), { name }); } catch (error) { archive.append(`Unavailable: ${error.message}\n`, { name: `${name}.ERROR.txt` }); }
  }
  const index = {
    exportedAt: isoNow(), exportedBy: req.user.sub, requestId: req.requestId,
    document: { id: document.id, number: document.document_number, patientId: document.patient_id, patientName: document.patient_name, episodeId: document.episode_id, templateCode: document.template_code, templateVersion: document.template_version, status: document.status, finalPdfHash: document.final_pdf_hash, snapshotHash: document.snapshot_hash, approvalHash: document.approval_hash, retentionUntil: document.retention_until, legalHold: document.legal_hold },
    auditVerification: chain,
  };
  archive.append(JSON.stringify(index, null, 2), { name: '00-index.json' });
  archive.append(JSON.stringify(events.rows, null, 2), { name: '05-audit-events.json' });
  archive.append(JSON.stringify(approvals.rows, null, 2), { name: '06-approvals.json' });
  archive.append(JSON.stringify(deliveries.rows, null, 2), { name: '07-deliveries.json' });
  archive.append(JSON.stringify(timestamps.rows, null, 2), { name: '08-timestamp-receipts.json' });
  await archive.finalize();
}));

router.get('/api/audit/:documentId', auth, requireRoles('compliance','system_admin'), asyncRoute(async (req, res) => {
  const result = await pool.query('SELECT * FROM audit_events WHERE document_id=$1 ORDER BY id', [req.params.documentId]);
  res.json({ events: result.rows, verification: verifyAuditChain(result.rows) });
}));
router.get('/api/integrations/status', auth, requireRoles('administrator','compliance','system_admin'), asyncRoute(async (_req, res) => {
  res.json({ waha: await waha.health(), tsa: { enabled: tsa.enabled, required: tsa.required, provider: tsa.provider, urlConfigured: Boolean(tsa.tsaUrl) }, crm: { configured: crm.configured }, tunduk: { status: 'DEFERRED_INTEGRATION_GATE' } });
}));

router.post('/api/integration/crm/patients/upsert', asyncRoute(async (req, res) => {
  const authHeader = String(req.headers.authorization || '');
  if (!env.CRM_API_KEY || authHeader !== `Bearer ${env.CRM_API_KEY}`) return apiError(res, 401, 'invalid_crm_api_key');
  const schema = z.object({ externalCrmId: z.string().min(1), fullName: z.string().min(3), birthDate: z.string().optional(), phoneE164: z.string().optional() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return apiError(res, 400, 'invalid_input', parsed.error.flatten());
  const p = parsed.data;
  if (isTestMode && !hasSyntheticPatientPrefix(p.fullName)) {
    return apiError(res, 400, 'test_mode_requires_synthetic_patient_prefix');
  }
  const result = await pool.query(
    `INSERT INTO patients (external_crm_id, full_name, birth_date, phone_e164)
     VALUES ($1,$2,$3,$4) ON CONFLICT (external_crm_id) DO UPDATE SET
     full_name=EXCLUDED.full_name,birth_date=EXCLUDED.birth_date,phone_e164=EXCLUDED.phone_e164,updated_at=now()
     RETURNING id, external_crm_id`, [p.externalCrmId, p.fullName, p.birthDate || null, p.phoneE164 || null],
  );
  res.json({ patient: result.rows[0] });
}));
router.post('/api/integration/crm/snapshot', asyncRoute(async (req, res) => {
  const authHeader = String(req.headers.authorization || '');
  if (!env.CRM_API_KEY || authHeader !== `Bearer ${env.CRM_API_KEY}`) return apiError(res, 401, 'invalid_crm_api_key');
  let snapshot;
  try { snapshot = validateSqnsSnapshot(req.body); } catch (error) {
    return apiError(res, 400, 'invalid_sqns_snapshot_contract', { reason: error.message });
  }
  if (isTestMode && !hasSyntheticPatientPrefix(snapshot.displayName)) {
    return apiError(res, 400, 'test_mode_requires_synthetic_patient_prefix');
  }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const patient = await client.query(
      `INSERT INTO patients (external_crm_id, full_name, phone_e164)
       VALUES ($1,$2,$3)
       ON CONFLICT (external_crm_id) DO UPDATE SET
         full_name=EXCLUDED.full_name, phone_e164=EXCLUDED.phone_e164, updated_at=now()
       RETURNING id, external_crm_id`,
      [snapshot.patientRef, snapshot.displayName, snapshot.phoneE164 || null],
    );
    const episode = await client.query(
      `INSERT INTO episodes (external_crm_id, patient_id, direction, metadata)
       VALUES ($1,$2,'SQNS_SYNC',$3)
       ON CONFLICT (external_crm_id) DO UPDATE SET
         patient_id=EXCLUDED.patient_id, metadata=EXCLUDED.metadata
       RETURNING id, external_crm_id`,
      [snapshot.visitRef, patient.rows[0].id, {
        sqnsContractVersion: snapshot.contractVersion,
        doctorRef: snapshot.doctorRef,
        serviceRefs: snapshot.serviceRefs || [],
      }],
    );
    await client.query('COMMIT');
    return res.json({
      contractVersion: snapshot.contractVersion,
      patient: patient.rows[0],
      visit: episode.rows[0],
      doctorRef: snapshot.doctorRef,
      serviceRefs: snapshot.serviceRefs || [],
    });
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}));
router.get('/api/integration/crm/episodes/:id/compliance', asyncRoute(async (req, res) => {
  const authHeader = String(req.headers.authorization || '');
  if (!env.CRM_API_KEY || authHeader !== `Bearer ${env.CRM_API_KEY}`) return apiError(res, 401, 'invalid_crm_api_key');
  const result = await pool.query(
    `SELECT e.id, e.external_crm_id, e.direction,
       json_agg(json_build_object('documentId',d.id,'templateCode',tv.template_code,'status',d.status,'sealedAt',d.sealed_at)) FILTER (WHERE d.id IS NOT NULL) AS documents
     FROM episodes e LEFT JOIN documents d ON d.episode_id=e.id
     LEFT JOIN template_versions tv ON tv.id=d.template_version_id
     WHERE e.external_crm_id=$1 GROUP BY e.id`, [req.params.id],
  );
  if (!result.rowCount) return apiError(res, 404, 'episode_not_found');
  const episode = result.rows[0];
  const docs = episode.documents || [];
  res.json({ episode, hardGate: { pass: docs.some((item) => ['SYSTEM_SEALED','COPY_DELIVERED','ARCHIVED','LEGAL_HOLD'].includes(item.status)), reason: docs.length ? 'At least one sealed patient document is present; procedure-specific rules must be configured in CRM.' : 'No sealed patient documents.' } });
}));

app.use(basePath, router);
app.use(basePath, express.static(path.join(HERE, 'public'), {
  index: 'index.html', etag: true, maxAge: env.NODE_ENV === 'production' ? '10m' : 0,
  setHeaders(res, file) {
    if (file.endsWith('index.html') || file.endsWith('service-worker.js')) res.setHeader('cache-control', 'no-store');
  },
}));
app.get('/', (_req, res) => res.redirect(`${basePath}/`));

app.use((error, req, res, _next) => {
  const status = Number(error.status || 500);
  const safe = status >= 500 ? 'internal_error' : error.message;
  console.error(JSON.stringify({ level: 'error', requestId: req.requestId, error: error.message, stack: error.stack }));
  if (!res.headersSent) res.status(status).json({ error: safe, requestId: req.requestId });
});

async function start() {
  const init = await initializeDatabase(pool, env);
  await storage.ensureBucket();
  const server = app.listen(port, '0.0.0.0', () => {
    console.log(JSON.stringify({
      level: 'info', event: 'expert_esign_started', port, basePath, publicOrigin,
      templateRegistry: init.registry.registryVersion, bootstrapAdminCreated: init.bootstrap.created,
      allowCounselGated, wahaEnabled: waha.enabled, tsaEnabled: tsa.enabled, tsaRequired: tsa.required,
    }));
  });
  const shutdown = async (signal) => {
    console.log(JSON.stringify({ level: 'info', event: 'shutdown', signal }));
    server.close(async () => {
      await pool.end();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 15000).unref();
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

start().catch((error) => {
  console.error(JSON.stringify({ level: 'fatal', event: 'startup_failed', error: error.message, stack: error.stack }));
  process.exit(1);
});
