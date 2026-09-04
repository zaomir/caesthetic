import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
import argon2 from 'argon2';
import { canonicalHash } from './core.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const APP_ROOT = path.join(HERE, '..');

function bool(value, fallback = false) {
  if (value === undefined || value === null || value === '') return fallback;
  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());
}

export function createPool(env = process.env) {
  if (!env.DATABASE_URL) throw new Error('DATABASE_URL is required');
  return new pg.Pool({
    connectionString: env.DATABASE_URL,
    ssl: bool(env.DB_SSL, false) ? { rejectUnauthorized: true } : false,
    max: Number(env.DB_POOL_MAX || 12),
    idleTimeoutMillis: 30000,
    statement_timeout: 30000,
  });
}

export async function migrate(pool) {
  const migrationRoot = path.join(APP_ROOT, 'migrations');
  const files = (await fs.readdir(migrationRoot)).filter((name) => /^\d+.*\.sql$/.test(name)).sort();
  for (const file of files) {
    const sql = await fs.readFile(path.join(migrationRoot, file), 'utf8');
    await pool.query(sql);
  }
}

export async function seedTemplates(pool) {
  const registry = JSON.parse(await fs.readFile(path.join(APP_ROOT, 'generated', 'legal-templates.json'), 'utf8'));
  for (const template of registry.templates) {
    const bodyHash = canonicalHash(template);
    await pool.query(
      `INSERT INTO template_versions
       (template_code, version, title, status, category, required_approver_role,
        required_signer_types, retention_class, body, body_hash)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       ON CONFLICT (template_code, version) DO UPDATE SET
         title = EXCLUDED.title,
         category = EXCLUDED.category,
         required_approver_role = EXCLUDED.required_approver_role,
         required_signer_types = EXCLUDED.required_signer_types,
         retention_class = EXCLUDED.retention_class,
         body = CASE
           WHEN template_versions.status IN ('ACTIVE','RETIRED') THEN template_versions.body
           ELSE EXCLUDED.body
         END,
         body_hash = CASE
           WHEN template_versions.status IN ('ACTIVE','RETIRED') THEN template_versions.body_hash
           ELSE EXCLUDED.body_hash
         END,
         status = CASE
           WHEN template_versions.status IN ('ACTIVE','RETIRED') THEN template_versions.status
           ELSE EXCLUDED.status
         END`,
      [
        template.code,
        template.version,
        template.title,
        template.status,
        template.category,
        template.requiredApproverRole,
        JSON.stringify(template.requiredSigners ?? []),
        template.retentionClass,
        JSON.stringify(template),
        bodyHash,
      ],
    );
  }
  // Keep historical rows for referential/evidence integrity, but remove stale
  // experimental templates from the current picker. Only the exact generated
  // legal registry can remain non-retired.
  await pool.query(
    `UPDATE template_versions AS existing
     SET status='RETIRED'
     WHERE status <> 'RETIRED'
       AND NOT EXISTS (
         SELECT 1
         FROM unnest($1::text[], $2::text[]) AS canonical(code, version)
         WHERE canonical.code=existing.template_code
           AND canonical.version=existing.version
       )`,
    [registry.templates.map((item) => item.code), registry.templates.map((item) => item.version)],
  );
  return registry;
}

export async function seedRetentionPolicies(pool, env = process.env) {
  const policies = [
    ['CLINICAL_25Y_PROVISIONAL', 'Клинические документы и ИДС', Number(env.RETENTION_CLINICAL_DAYS || 9125), 'До письменного подтверждения юриста КР автоматическое удаление запрещено. Отсчёт и событие начала срока требуют утверждения.'],
    ['CONTRACT_10Y_PROVISIONAL', 'Рамочные договоры и финансовые согласования', Number(env.RETENTION_CONTRACT_DAYS || 3650), 'Технический консервативный срок; налоговые/потребительские правила подтвердить у юриста и бухгалтера.'],
    ['MARKETING_WITHDRAWAL_PLUS_3Y_PROVISIONAL', 'Маркетинговые согласия', Number(env.RETENTION_MARKETING_DAYS || 1095), 'Отзыв прекращает новые публикации; доказательство согласия хранится после отзыва в утверждённый срок.'],
    ['SECURITY_5Y_PROVISIONAL', 'Журналы доступа и безопасности', Number(env.RETENTION_SECURITY_LOG_DAYS || 1825), 'Хранить не меньше срока связанного evidence, если журнал нужен для доказывания.'],
  ];
  for (const [code, title, days, notes] of policies) {
    await pool.query(
      `INSERT INTO retention_policies
       (class_code, title, provisional_days, automatic_deletion_allowed, legal_status, notes)
       VALUES ($1,$2,$3,false,'COUNSEL_REVIEW_REQUIRED',$4)
       ON CONFLICT (class_code) DO UPDATE SET
         title = EXCLUDED.title,
         provisional_days = EXCLUDED.provisional_days,
         automatic_deletion_allowed = false,
         legal_status = 'COUNSEL_REVIEW_REQUIRED',
         notes = EXCLUDED.notes,
         updated_at = now()`,
      [code, title, days, notes],
    );
  }
}

export async function bootstrapAdmin(pool, env = process.env) {
  const username = env.BOOTSTRAP_ADMIN_USER || 'esign-admin';
  const password = env.BOOTSTRAP_ADMIN_PASSWORD;
  if (!password) throw new Error('BOOTSTRAP_ADMIN_PASSWORD is required');
  const existing = await pool.query('SELECT id FROM staff_users LIMIT 1');
  if (existing.rowCount) return { created: false };
  const hash = await argon2.hash(password, { type: argon2.argon2id });
  const created = await pool.query(
    `INSERT INTO staff_users (username, display_name, role, password_hash)
     VALUES ($1,$2,'compliance',$3)
     RETURNING id, username`,
    [username, env.BOOTSTRAP_ADMIN_NAME || 'Expert Dental Compliance Admin', hash],
  );
  return { created: true, user: created.rows[0] };
}

export async function initializeDatabase(pool, env = process.env) {
  await migrate(pool);
  const registry = await seedTemplates(pool);
  await seedRetentionPolicies(pool, env);
  const bootstrap = await bootstrapAdmin(pool, env);
  return { registry, bootstrap };
}
