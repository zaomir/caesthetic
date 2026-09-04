import {
  S3Client,
  CreateBucketCommand,
  HeadBucketCommand,
  PutBucketVersioningCommand,
  PutObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectLegalHoldCommand,
  ListObjectVersionsCommand,
} from '@aws-sdk/client-s3';
import { Readable } from 'node:stream';

function asBool(value, fallback = false) {
  if (value === undefined || value === null || value === '') return fallback;
  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());
}

export function createEvidenceStorage(env = process.env) {
  const bucket = env.S3_BUCKET || 'expert-esign-evidence';
  const client = new S3Client({
    region: env.S3_REGION || 'us-east-1',
    endpoint: env.S3_ENDPOINT,
    forcePathStyle: asBool(env.S3_FORCE_PATH_STYLE, true),
    credentials: {
      accessKeyId: env.S3_ACCESS_KEY,
      secretAccessKey: env.S3_SECRET_KEY,
    },
  });

  async function ensureBucket() {
    try {
      await client.send(new HeadBucketCommand({ Bucket: bucket }));
    } catch {
      await client.send(new CreateBucketCommand({ Bucket: bucket, ObjectLockEnabledForBucket: true }));
    }
    await client.send(new PutBucketVersioningCommand({
      Bucket: bucket,
      VersioningConfiguration: { Status: 'Enabled' },
    }));
  }

  async function putLocked({ key, body, contentType, metadata = {}, retainUntil, legalHold = false }) {
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
      Metadata: Object.fromEntries(Object.entries(metadata).map(([k, v]) => [k, String(v)])),
      ObjectLockMode: 'GOVERNANCE',
      ObjectLockRetainUntilDate: retainUntil,
      ObjectLockLegalHoldStatus: legalHold ? 'ON' : 'OFF',
      ServerSideEncryption: 'AES256',
    });
    const result = await client.send(command);
    return { key, versionId: result.VersionId ?? null, etag: result.ETag ?? null };
  }

  async function putMutable({ key, body, contentType, metadata = {} }) {
    const result = await client.send(new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
      Metadata: Object.fromEntries(Object.entries(metadata).map(([k, v]) => [k, String(v)])),
      ServerSideEncryption: 'AES256',
    }));
    return { key, versionId: result.VersionId ?? null, etag: result.ETag ?? null };
  }

  async function get(key, versionId) {
    const result = await client.send(new GetObjectCommand({ Bucket: bucket, Key: key, VersionId: versionId }));
    return {
      body: result.Body,
      contentType: result.ContentType,
      contentLength: result.ContentLength,
      metadata: result.Metadata ?? {},
      versionId: result.VersionId ?? versionId ?? null,
      lastModified: result.LastModified ?? null,
    };
  }

  async function getBuffer(key, versionId) {
    const object = await get(key, versionId);
    const chunks = [];
    for await (const chunk of object.body) chunks.push(Buffer.from(chunk));
    return Buffer.concat(chunks);
  }

  async function head(key, versionId) {
    return client.send(new HeadObjectCommand({ Bucket: bucket, Key: key, VersionId: versionId }));
  }

  async function placeLegalHold(key, versionId) {
    await client.send(new PutObjectLegalHoldCommand({
      Bucket: bucket,
      Key: key,
      VersionId: versionId,
      LegalHold: { Status: 'ON' },
    }));
  }

  async function listVersions(prefix) {
    const result = await client.send(new ListObjectVersionsCommand({ Bucket: bucket, Prefix: prefix }));
    return [
      ...(result.Versions ?? []).map((version) => ({
        key: version.Key,
        versionId: version.VersionId,
        isLatest: version.IsLatest,
        size: version.Size,
        lastModified: version.LastModified,
      })),
      ...(result.DeleteMarkers ?? []).map((marker) => ({
        key: marker.Key,
        versionId: marker.VersionId,
        deleteMarker: true,
        isLatest: marker.IsLatest,
        lastModified: marker.LastModified,
      })),
    ];
  }

  return {
    bucket,
    client,
    ensureBucket,
    putLocked,
    putMutable,
    get,
    getBuffer,
    head,
    placeLegalHold,
    listVersions,
  };
}

export function streamToNode(readable) {
  if (readable instanceof Readable) return readable;
  return Readable.fromWeb(readable);
}
