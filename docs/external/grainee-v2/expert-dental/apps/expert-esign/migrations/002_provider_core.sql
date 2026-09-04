BEGIN;

ALTER TABLE template_versions DROP CONSTRAINT IF EXISTS template_versions_status_check;
-- VERSION_REGISTRY currently contains no IN_USE form. Fail closed even when an
-- older test deployment previously marked a template ACTIVE.
UPDATE template_versions SET status = 'NOT_EFFECTIVE'
  WHERE status <> 'RETIRED';
ALTER TABLE template_versions ADD CONSTRAINT template_versions_status_check
  CHECK (status IN ('DRAFT','NOT_EFFECTIVE','ACTIVE','RETIRED'));

CREATE TABLE IF NOT EXISTS signature_envelopes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL,
  provider_envelope_id text,
  document_id uuid REFERENCES documents(id),
  patient_external_ref text NOT NULL,
  visit_external_ref text NOT NULL,
  doctor_external_ref text NOT NULL,
  template_code text NOT NULL,
  template_version text NOT NULL,
  source_sha256 text NOT NULL,
  status text NOT NULL,
  doctor_approved_by uuid REFERENCES staff_users(id),
  doctor_approved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(provider, provider_envelope_id)
);

CREATE TABLE IF NOT EXISTS envelope_signers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  envelope_id uuid NOT NULL REFERENCES signature_envelopes(id),
  signer_type text NOT NULL CHECK (signer_type IN ('patient','representative','doctor')),
  external_ref text,
  signing_order integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'PENDING',
  signed_at timestamptz,
  UNIQUE(envelope_id, signer_type, signing_order)
);

CREATE TABLE IF NOT EXISTS provider_signing_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  envelope_id uuid NOT NULL REFERENCES signature_envelopes(id),
  provider_session_id text,
  created_by uuid NOT NULL REFERENCES staff_users(id),
  device_code text NOT NULL,
  expires_at timestamptz NOT NULL,
  consumed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS provider_events (
  id bigserial PRIMARY KEY,
  envelope_id uuid REFERENCES signature_envelopes(id),
  provider text NOT NULL,
  provider_event_id text NOT NULL,
  event_type text NOT NULL,
  occurred_at timestamptz NOT NULL,
  received_at timestamptz NOT NULL DEFAULT now(),
  payload_sha256 text NOT NULL,
  payload jsonb NOT NULL,
  UNIQUE(provider, provider_event_id)
);

CREATE TABLE IF NOT EXISTS provider_webhook_receipts (
  provider text NOT NULL,
  provider_event_id text NOT NULL,
  request_timestamp timestamptz NOT NULL,
  payload_sha256 text NOT NULL,
  processed_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(provider, provider_event_id)
);

CREATE TABLE IF NOT EXISTS envelope_artifacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  envelope_id uuid NOT NULL REFERENCES signature_envelopes(id),
  kind text NOT NULL,
  object_key text NOT NULL,
  object_version_id text,
  content_type text NOT NULL,
  sha256 text NOT NULL,
  retain_until timestamptz NOT NULL,
  legal_hold boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(envelope_id, kind, sha256)
);

CREATE INDEX IF NOT EXISTS idx_signature_envelopes_status ON signature_envelopes(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_provider_events_envelope ON provider_events(envelope_id, id);

COMMIT;
