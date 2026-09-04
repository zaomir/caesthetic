BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS staff_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  display_name text NOT NULL,
  role text NOT NULL CHECK (role IN ('doctor','administrator','clinic_authorized','compliance','system_admin')),
  password_hash text NOT NULL,
  totp_secret text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  external_crm_id text UNIQUE,
  full_name text NOT NULL,
  birth_date date,
  phone_e164 text,
  identity_method text,
  identity_reference text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS representatives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id),
  full_name text NOT NULL,
  birth_date date,
  relationship text,
  authority_basis text NOT NULL,
  identity_method text,
  identity_reference text,
  phone_e164 text,
  valid_from date,
  valid_until date,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS episodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  external_crm_id text UNIQUE,
  patient_id uuid NOT NULL REFERENCES patients(id),
  direction text NOT NULL,
  doctor_id uuid REFERENCES staff_users(id),
  status text NOT NULL DEFAULT 'OPEN',
  opened_at timestamptz NOT NULL DEFAULT now(),
  closed_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS template_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_code text NOT NULL,
  version text NOT NULL,
  title text NOT NULL,
  status text NOT NULL CHECK (status IN ('DRAFT','COUNSEL_REVIEW_REQUIRED','APPROVED','ACTIVE','RETIRED')),
  category text NOT NULL,
  required_approver_role text,
  required_signer_types jsonb NOT NULL DEFAULT '[]'::jsonb,
  retention_class text NOT NULL,
  body jsonb NOT NULL,
  body_hash text NOT NULL,
  effective_from timestamptz,
  effective_until timestamptz,
  approved_by uuid REFERENCES staff_users(id),
  approved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(template_code, version)
);

CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_number text UNIQUE NOT NULL,
  patient_id uuid NOT NULL REFERENCES patients(id),
  episode_id uuid REFERENCES episodes(id),
  template_version_id uuid NOT NULL REFERENCES template_versions(id),
  status text NOT NULL CHECK (status IN (
    'DRAFT','DOCTOR_REVIEW','DOCTOR_APPROVED','READY_FOR_PATIENT_SIGNATURE',
    'ADMIN_SESSION_STARTED','IDENTITY_VERIFIED','DOCUMENT_PRESENTED','PATIENT_SIGNED',
    'SYSTEM_SEALED','COPY_DELIVERED','ARCHIVED','DECLINED','CANCELLED','SUPERSEDED',
    'REVOKED','LEGAL_HOLD','TIMESTAMP_PENDING'
  )),
  field_values jsonb NOT NULL DEFAULT '{}'::jsonb,
  rendered_snapshot jsonb NOT NULL,
  snapshot_hash text NOT NULL,
  created_by uuid NOT NULL REFERENCES staff_users(id),
  doctor_id uuid REFERENCES staff_users(id),
  approved_by uuid REFERENCES staff_users(id),
  approved_at timestamptz,
  approval_hash text,
  final_pdf_key text,
  final_pdf_hash text,
  manifest_key text,
  signature_key text,
  timestamp_key text,
  timestamp_status text,
  retention_until timestamptz,
  sealed_at timestamptz,
  copy_delivered_at timestamptz,
  supersedes_document_id uuid REFERENCES documents(id),
  cancellation_reason text,
  legal_hold boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS document_approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES documents(id),
  approver_id uuid NOT NULL REFERENCES staff_users(id),
  approval_type text NOT NULL,
  approved_hash text NOT NULL,
  approved_at timestamptz NOT NULL DEFAULT now(),
  ip_address inet,
  user_agent text
);

CREATE TABLE IF NOT EXISTS signing_devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_code text UNIQUE NOT NULL,
  display_name text NOT NULL,
  device_token_hash text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  last_seen_at timestamptz,
  registered_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS signing_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES documents(id),
  session_code_hash text NOT NULL,
  created_by uuid NOT NULL REFERENCES staff_users(id),
  device_id uuid REFERENCES signing_devices(id),
  signer_type text NOT NULL CHECK (signer_type IN ('patient','legal_representative')),
  representative_id uuid REFERENCES representatives(id),
  identity_method text NOT NULL,
  identity_reference text,
  identity_verified_by uuid NOT NULL REFERENCES staff_users(id),
  identity_verified_at timestamptz NOT NULL,
  expires_at timestamptz NOT NULL,
  started_at timestamptz,
  presented_at timestamptz,
  completed_at timestamptz,
  cancelled_at timestamptz,
  status text NOT NULL CHECK (status IN ('CREATED','OPENED','PRESENTED','SIGNED','EXPIRED','CANCELLED')),
  acknowledgements jsonb NOT NULL DEFAULT '{}'::jsonb,
  scroll_completed boolean NOT NULL DEFAULT false,
  ip_address inet,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS patient_signatures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid UNIQUE NOT NULL REFERENCES documents(id),
  signing_session_id uuid UNIQUE NOT NULL REFERENCES signing_sessions(id),
  signer_type text NOT NULL,
  signer_name text NOT NULL,
  vector_hash text NOT NULL,
  png_hash text NOT NULL,
  signed_at timestamptz NOT NULL,
  ip_address inet,
  user_agent text
);

CREATE TABLE IF NOT EXISTS audit_events (
  id bigserial PRIMARY KEY,
  document_id uuid REFERENCES documents(id),
  patient_id uuid REFERENCES patients(id),
  episode_id uuid REFERENCES episodes(id),
  actor_type text NOT NULL,
  actor_id text,
  event_type text NOT NULL,
  event_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  previous_event_hash text,
  event_hash text NOT NULL UNIQUE,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  request_id text,
  ip_address inet,
  user_agent text
);

CREATE TABLE IF NOT EXISTS delivery_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES documents(id),
  channel text NOT NULL,
  destination_masked text,
  provider text,
  provider_message_id text,
  status text NOT NULL,
  error_code text,
  error_detail text,
  attempted_at timestamptz NOT NULL DEFAULT now(),
  delivered_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS timestamp_receipts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES documents(id),
  provider text NOT NULL,
  tsa_url text NOT NULL,
  request_hash text NOT NULL,
  token_key text,
  token_hash text,
  status text NOT NULL,
  gen_time timestamptz,
  serial_number text,
  policy_oid text,
  verification_status text,
  error_detail text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS legal_holds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id),
  episode_id uuid REFERENCES episodes(id),
  document_id uuid REFERENCES documents(id),
  reason text NOT NULL,
  placed_by uuid NOT NULL REFERENCES staff_users(id),
  placed_at timestamptz NOT NULL DEFAULT now(),
  released_by uuid REFERENCES staff_users(id),
  released_at timestamptz,
  release_reason text
);

CREATE TABLE IF NOT EXISTS retention_policies (
  class_code text PRIMARY KEY,
  title text NOT NULL,
  provisional_days integer,
  automatic_deletion_allowed boolean NOT NULL DEFAULT false,
  legal_status text NOT NULL DEFAULT 'COUNSEL_REVIEW_REQUIRED',
  notes text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_documents_patient ON documents(patient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_documents_episode ON documents(episode_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_document ON audit_events(document_id, id);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON signing_sessions(status, expires_at);

CREATE OR REPLACE FUNCTION deny_sealed_document_mutation() RETURNS trigger AS $$
BEGIN
  IF OLD.status IN ('SYSTEM_SEALED','COPY_DELIVERED','ARCHIVED','LEGAL_HOLD','REVOKED','SUPERSEDED') THEN
    IF NEW.rendered_snapshot IS DISTINCT FROM OLD.rendered_snapshot
       OR NEW.snapshot_hash IS DISTINCT FROM OLD.snapshot_hash
       OR NEW.final_pdf_hash IS DISTINCT FROM OLD.final_pdf_hash
       OR NEW.final_pdf_key IS DISTINCT FROM OLD.final_pdf_key
       OR NEW.template_version_id IS DISTINCT FROM OLD.template_version_id
       OR NEW.patient_id IS DISTINCT FROM OLD.patient_id
       OR NEW.episode_id IS DISTINCT FROM OLD.episode_id THEN
      RAISE EXCEPTION 'sealed_document_is_immutable';
    END IF;
  END IF;
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_documents_immutable ON documents;
CREATE TRIGGER trg_documents_immutable
BEFORE UPDATE ON documents
FOR EACH ROW EXECUTE FUNCTION deny_sealed_document_mutation();

CREATE OR REPLACE FUNCTION deny_audit_mutation() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'audit_events_are_append_only';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_audit_no_update ON audit_events;
CREATE TRIGGER trg_audit_no_update
BEFORE UPDATE OR DELETE ON audit_events
FOR EACH ROW EXECUTE FUNCTION deny_audit_mutation();

COMMIT;
