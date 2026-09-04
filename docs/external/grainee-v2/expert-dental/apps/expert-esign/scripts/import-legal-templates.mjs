import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = path.resolve(appRoot, '../..');
const legalRoot = path.join(repoRoot, 'docs/legal/raimov/expert-dental');
const tabletManifestPath = path.join(legalRoot, 'package/tablet/manifest.json');
const versionRegistryPath = path.join(legalRoot, 'VERSION_REGISTRY.md');
const approvalRecordPath = path.join(legalRoot, 'package/APPROVAL_RECORD_2026-08-30.md');
const outputPath = path.join(appRoot, 'generated/legal-templates.json');
const check = process.argv.includes('--check');

const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex');
const read = (p) => fs.readFileSync(p);
const manifest = JSON.parse(read(tabletManifestPath));
const versionRegistry = read(versionRegistryPath);
const approvalRecord = read(approvalRecordPath);

if (!versionRegistry.toString('utf8').includes('NO IN_USE FORMS YET')) {
  throw new Error('version_registry_contract_changed_review_importer');
}
if (!approvalRecord.toString('utf8').includes('APPROVED_OWNER_CONFIRMED')) {
  throw new Error('counsel_approval_overlay_missing');
}

const templates = manifest.forms.map((form) => {
  const sourcePath = path.join(legalRoot, 'package', form.source);
  const source = read(sourcePath);
  const actualHash = sha256(source);
  if (actualHash !== form.sourceSha256) {
    throw new Error(`legal_source_hash_mismatch:${form.docId}:${actualHash}`);
  }
  const medical = Boolean(form.medicalReviewPending);
  const evidenceBlocked = Boolean(form.evidenceBlocked || form.blocked);
  const releaseBlocked = Boolean(form.releaseBlocked);
  return {
    code: form.docId,
    version: form.releaseVersion,
    title: form.title,
    category: form.docId.split('-')[1].toLowerCase(),
    status: 'NOT_EFFECTIVE',
    legalApprovalStatus: 'COUNSEL_APPROVED_OWNER_CONFIRMED',
    effective: false,
    testEligible: !releaseBlocked && !evidenceBlocked,
    releaseBlocked,
    evidenceBlocked,
    medicalReviewPending: medical,
    tabletStatus: form.tabletStatus,
    requiredApproverRole: medical ? 'doctor' : null,
    requiredSigners: ['patient'],
    retentionClass: form.docId.startsWith('ED-CON') ? 'CONTRACT_10Y_PROVISIONAL' : 'CLINICAL_25Y_PROVISIONAL',
    source: form.source,
    sourceSha256: form.sourceSha256,
    versionRegistrySha256: sha256(versionRegistry),
    approvalRecordSha256: sha256(approvalRecord),
    fields: [],
    acknowledgements: ['Документ прочитан полностью', 'Вопросы заданы до подписания'],
    sections: [{ heading: form.title, paragraphs: [source.toString('utf8')] }],
  };
});

const output = `${JSON.stringify({
  schema: 'expert-esign.legal-template-import.v1',
  authority: 'docs/legal/raimov/expert-dental/package/markdown + VERSION_REGISTRY.md',
  generatedFrom: {
    tabletManifest: path.relative(repoRoot, tabletManifestPath),
    tabletManifestSha256: sha256(read(tabletManifestPath)),
    versionRegistry: path.relative(repoRoot, versionRegistryPath),
    versionRegistrySha256: sha256(versionRegistry),
    approvalRecord: path.relative(repoRoot, approvalRecordPath),
    approvalRecordSha256: sha256(approvalRecord),
  },
  counselApproval: manifest.counselApproval,
  activationRule: 'Runtime cannot activate a template unless VERSION_REGISTRY contains an exact IN_USE row. Current registry contains none.',
  templates,
}, null, 2)}\n`;

if (check) {
  if (!fs.existsSync(outputPath) || fs.readFileSync(outputPath, 'utf8') !== output) {
    throw new Error('generated_legal_templates_drift');
  }
  console.log(`LEGAL_TEMPLATE_IMPORT_OK templates=${templates.length}`);
} else {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, output);
  console.log(`LEGAL_TEMPLATE_IMPORT_WRITTEN templates=${templates.length}`);
}
