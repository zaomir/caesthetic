import crypto from 'node:crypto';

export const isoNow = () => new Date().toISOString();

export function sha256(value) {
  const input = Buffer.isBuffer(value) ? value : Buffer.from(String(value), 'utf8');
  return crypto.createHash('sha256').update(input).digest('hex');
}

export function randomToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString('base64url');
}

export function stableStringify(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  const keys = Object.keys(value).sort();
  return `{${keys.map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(',')}}`;
}

export function canonicalHash(value) {
  return sha256(stableStringify(value));
}

export function maskPhone(phone = '') {
  const digits = String(phone).replace(/\D/g, '');
  if (digits.length < 5) return '***';
  return `${digits.slice(0, 3)}***${digits.slice(-3)}`;
}

export function normalizePhoneE164(phone = '') {
  const digits = String(phone).replace(/\D/g, '');
  if (!digits) return null;
  if (digits.startsWith('996')) return `+${digits}`;
  if (digits.length === 9) return `+996${digits}`;
  return `+${digits}`;
}

export function toWahaChatId(phone) {
  const e164 = normalizePhoneE164(phone);
  if (!e164) return null;
  return `${e164.slice(1)}@c.us`;
}

export function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export function renderScalar(value) {
  if (value === null || value === undefined || value === '') return 'Не указано';
  if (Array.isArray(value)) {
    return value.map((item) => typeof item === 'object' ? renderScalar(item) : String(item)).join('; ');
  }
  if (typeof value === 'object') {
    if (Array.isArray(value.items)) return value.items.map(renderScalar).join('; ');
    return Object.entries(value).map(([key, item]) => `${key}: ${renderScalar(item)}`).join('; ');
  }
  if (typeof value === 'boolean') return value ? 'Да' : 'Нет';
  return String(value);
}

export function interpolate(text, values = {}) {
  return String(text).replace(/{{\s*([a-zA-Z0-9_]+)\s*}}/g, (_, key) => renderScalar(values[key]));
}

export function buildSnapshot(template, context) {
  const values = { ...context.system, ...context.fields };
  return {
    schema: 'expert-esign.document-snapshot.v1',
    template: {
      code: template.code,
      version: template.version,
      title: template.title,
      category: template.category,
      status: template.status,
      retentionClass: template.retentionClass,
      requiredApproverRole: template.requiredApproverRole,
      requiredSigners: template.requiredSigners,
    },
    patient: context.patient,
    representative: context.representative ?? null,
    episode: context.episode ?? null,
    doctor: context.doctor ?? null,
    clinic: context.clinic,
    fields: template.fields.map((field) => ({
      ...field,
      value: context.fields[field.key] ?? null,
      displayValue: renderScalar(context.fields[field.key]),
    })),
    acknowledgements: template.acknowledgements ?? [],
    sections: template.sections.map((section) => ({
      heading: interpolate(section.heading, values),
      paragraphs: (section.paragraphs ?? []).map((paragraph) => interpolate(paragraph, values)),
    })),
    generatedAt: context.system.generated_at,
    documentNumber: context.system.document_number,
  };
}

export function validateTemplateFields(template, fields) {
  const errors = [];
  for (const field of template.fields ?? []) {
    const value = fields[field.key];
    if (field.required && (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0))) {
      errors.push({ field: field.key, message: `Обязательное поле: ${field.label}` });
    }
  }
  return errors;
}

export function nextDocumentNumber(sequence, date = new Date()) {
  const yyyy = date.getUTCFullYear();
  return `ED-${yyyy}-${String(sequence).padStart(8, '0')}`;
}

export function sessionCode() {
  return String(crypto.randomInt(100000, 1000000));
}

export function retentionDaysFor(retentionClass, env = process.env) {
  if (retentionClass.startsWith('CLINICAL_')) return Number(env.RETENTION_CLINICAL_DAYS || 9125);
  if (retentionClass.startsWith('CONTRACT_')) return Number(env.RETENTION_CONTRACT_DAYS || 3650);
  if (retentionClass.startsWith('MARKETING_')) return Number(env.RETENTION_MARKETING_DAYS || 1095);
  return Number(env.RETENTION_SECURITY_LOG_DAYS || 1825);
}

export function retentionUntil(retentionClass, from = new Date(), env = process.env) {
  const days = retentionDaysFor(retentionClass, env);
  return new Date(from.getTime() + days * 86400000);
}

export async function appendAudit(pool, event) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const previous = await client.query(
      `SELECT event_hash FROM audit_events
       WHERE document_id IS NOT DISTINCT FROM $1
       ORDER BY id DESC LIMIT 1 FOR UPDATE`,
      [event.documentId ?? null],
    );
    const previousHash = previous.rows[0]?.event_hash ?? null;
    const occurredAt = event.occurredAt ?? isoNow();
    const canonical = {
      documentId: event.documentId ?? null,
      patientId: event.patientId ?? null,
      episodeId: event.episodeId ?? null,
      actorType: event.actorType,
      actorId: event.actorId ?? null,
      eventType: event.eventType,
      payload: event.payload ?? {},
      previousHash,
      occurredAt,
      requestId: event.requestId ?? null,
    };
    const eventHash = sha256(`${previousHash ?? 'GENESIS'}|${stableStringify(canonical)}`);
    const inserted = await client.query(
      `INSERT INTO audit_events
       (document_id, patient_id, episode_id, actor_type, actor_id, event_type, event_payload,
        previous_event_hash, event_hash, occurred_at, request_id, ip_address, user_agent)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       RETURNING id, event_hash, occurred_at`,
      [
        event.documentId ?? null,
        event.patientId ?? null,
        event.episodeId ?? null,
        event.actorType,
        event.actorId ?? null,
        event.eventType,
        event.payload ?? {},
        previousHash,
        eventHash,
        occurredAt,
        event.requestId ?? null,
        event.ipAddress ?? null,
        event.userAgent ?? null,
      ],
    );
    await client.query('COMMIT');
    return inserted.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export function verifyAuditChain(events) {
  let previousHash = null;
  for (const event of events) {
    const canonical = {
      documentId: event.document_id ?? null,
      patientId: event.patient_id ?? null,
      episodeId: event.episode_id ?? null,
      actorType: event.actor_type,
      actorId: event.actor_id ?? null,
      eventType: event.event_type,
      payload: event.event_payload ?? {},
      previousHash,
      occurredAt: new Date(event.occurred_at).toISOString(),
      requestId: event.request_id ?? null,
    };
    const expected = sha256(`${previousHash ?? 'GENESIS'}|${stableStringify(canonical)}`);
    if (event.previous_event_hash !== previousHash || event.event_hash !== expected) {
      return { ok: false, failedEventId: event.id, expected, actual: event.event_hash };
    }
    previousHash = event.event_hash;
  }
  return { ok: true, head: previousHash, count: events.length };
}

export function redactObject(value, forbidden = ['password', 'secret', 'token', 'authorization']) {
  if (Array.isArray(value)) return value.map((item) => redactObject(item, forbidden));
  if (!value || typeof value !== 'object') return value;
  const out = {};
  for (const [key, item] of Object.entries(value)) {
    out[key] = forbidden.some((word) => key.toLowerCase().includes(word)) ? '[REDACTED]' : redactObject(item, forbidden);
  }
  return out;
}
