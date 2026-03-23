// netlify/functions/s3.js
// Brokers all AWS S3 operations for the FDD upload + admin pages.
// File data never passes through here — only presigned URLs are generated.
// Credentials live in Netlify environment variables (never in client code).

const {
  S3Client,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
  ListObjectsV2Command,
  DeleteObjectCommand,
  CopyObjectCommand,
} = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

// ─── Config ───────────────────────────────────────────────────────────────────

const REGION        = process.env.FDD_AWS_REGION;
const BUCKET        = process.env.FDD_S3_BUCKET;
const ADMIN_PW      = process.env.FDD_ADMIN_PASSWORD;
const UPLOAD_PREFIX = 'uploads/';

// Allowed content types for uploads
const ALLOWED_TYPES = /^(image|video)\//;

const s3 = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId:     process.env.FDD_AWS_KEY,
    secretAccessKey: process.env.FDD_AWS_SECRET,
  },
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function ok(body, status = 200) {
  return {
    statusCode: status,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ok: true, ...body }),
  };
}

function err(message, status = 400) {
  return {
    statusCode: status,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ok: false, error: message }),
  };
}

function checkAdmin(body) {
  if (!ADMIN_PW) return err('Admin password not configured', 500);
  if (!body.adminPassword || body.adminPassword !== ADMIN_PW) {
    return err('Unauthorized', 401);
  }
  return null;
}

// Sanitize filename: lowercase, spaces → hyphens, strip unsafe chars, truncate
function sanitizeFilename(name) {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9._-]/g, '')
    .slice(0, 200) || 'upload';
}

// Generate a timestamped S3 key
function makeKey(filename) {
  const now = new Date();
  const ts = now.toISOString().replace(/[-:T]/g, '').slice(0, 14); // YYYYMMDDHHmmss
  const safe = sanitizeFilename(filename);
  return `${UPLOAD_PREFIX}${ts}-${safe}`;
}

// ─── Action Handlers ──────────────────────────────────────────────────────────

async function initiateMultipart(body) {
  const { filename, contentType } = body;
  if (!filename) return err('filename required');
  if (!contentType || !ALLOWED_TYPES.test(contentType)) {
    return err('Only image/* and video/* content types are allowed');
  }

  const key = makeKey(filename);

  const cmd = new CreateMultipartUploadCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
  });

  const result = await s3.send(cmd);
  return ok({ uploadId: result.UploadId, key });
}

async function getUploadPartUrl(body) {
  const { key, uploadId, partNumber } = body;
  if (!key || !uploadId || !partNumber) return err('key, uploadId, partNumber required');
  if (partNumber < 1 || partNumber > 10000) return err('partNumber must be 1–10000');

  // Validate key is in the uploads/ prefix (prevent path traversal)
  if (!key.startsWith(UPLOAD_PREFIX)) return err('Invalid key');

  const cmd = new UploadPartCommand({
    Bucket: BUCKET,
    Key: key,
    UploadId: uploadId,
    PartNumber: partNumber,
  });

  const url = await getSignedUrl(s3, cmd, { expiresIn: 14400 }); // 4 hours
  return ok({ url });
}

async function completeMultipart(body) {
  const { key, uploadId, parts } = body;
  if (!key || !uploadId || !Array.isArray(parts) || parts.length === 0) {
    return err('key, uploadId, parts[] required');
  }
  if (!key.startsWith(UPLOAD_PREFIX)) return err('Invalid key');

  // Sort parts ascending by PartNumber
  const sorted = [...parts].sort((a, b) => a.PartNumber - b.PartNumber);

  const cmd = new CompleteMultipartUploadCommand({
    Bucket: BUCKET,
    Key: key,
    UploadId: uploadId,
    MultipartUpload: { Parts: sorted },
  });

  await s3.send(cmd);
  return ok({ key });
}

async function abortMultipart(body) {
  const { key, uploadId } = body;
  if (!key || !uploadId) return err('key, uploadId required');
  if (!key.startsWith(UPLOAD_PREFIX)) return err('Invalid key');

  const cmd = new AbortMultipartUploadCommand({
    Bucket: BUCKET,
    Key: key,
    UploadId: uploadId,
  });

  await s3.send(cmd);
  return ok({});
}

async function saveManifest(body) {
  const { name = '', email = '', keys = [] } = body;
  if (!Array.isArray(keys) || keys.length === 0) return err('keys required');

  const { PutObjectCommand } = require('@aws-sdk/client-s3');
  const ts = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
  const key = `submissions/${ts}.json`;

  await s3.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: 'application/json',
    Body: JSON.stringify({ name, email, keys, submittedAt: new Date().toISOString() }, null, 2),
  }));

  return ok({ key });
}

async function listObjects(body) {
  const authErr = checkAdmin(body);
  if (authErr) return authErr;

  const { prefix = UPLOAD_PREFIX, continuationToken } = body;

  const cmd = new ListObjectsV2Command({
    Bucket: BUCKET,
    Prefix: prefix,
    MaxKeys: 100,
    ...(continuationToken ? { ContinuationToken: continuationToken } : {}),
  });

  const result = await s3.send(cmd);

  const files = (result.Contents || []).map(obj => ({
    key: obj.Key,
    size: obj.Size,
    lastModified: obj.LastModified,
  }));

  return ok({
    files,
    nextContinuationToken: result.NextContinuationToken || null,
    isTruncated: result.IsTruncated || false,
  });
}

async function getPresignedUrl(body) {
  const authErr = checkAdmin(body);
  if (authErr) return authErr;

  const { key, expiresIn = 3600 } = body;
  if (!key) return err('key required');

  const { GetObjectCommand } = require('@aws-sdk/client-s3');
  const cmd = new GetObjectCommand({ Bucket: BUCKET, Key: key });
  const url = await getSignedUrl(s3, cmd, { expiresIn });
  return ok({ url });
}

async function deleteObject(body) {
  const authErr = checkAdmin(body);
  if (authErr) return authErr;

  const { key } = body;
  if (!key) return err('key required');

  await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
  return ok({});
}

async function renameObject(body) {
  const authErr = checkAdmin(body);
  if (authErr) return authErr;

  const { sourceKey, destKey } = body;
  if (!sourceKey || !destKey) return err('sourceKey, destKey required');
  if (sourceKey === destKey) return err('Source and destination are the same');

  // Copy first, then delete — never delete unless copy succeeds
  await s3.send(new CopyObjectCommand({
    Bucket: BUCKET,
    CopySource: `${BUCKET}/${sourceKey}`,
    Key: destKey,
  }));

  await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: sourceKey }));
  return ok({ newKey: destKey });
}

// ─── Main Handler ─────────────────────────────────────────────────────────────

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return err('Method not allowed', 405);
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return err('Invalid JSON body');
  }

  const { action } = body;
  if (!action) return err('action required');

  try {
    switch (action) {
      // Public
      case 'initiate-multipart':   return await initiateMultipart(body);
      case 'get-upload-part-url':  return await getUploadPartUrl(body);
      case 'complete-multipart':   return await completeMultipart(body);
      case 'abort-multipart':      return await abortMultipart(body);
      case 'save-manifest':        return await saveManifest(body);
      // Admin
      case 'list-objects':         return await listObjects(body);
      case 'get-presigned-url':    return await getPresignedUrl(body);
      case 'delete-object':        return await deleteObject(body);
      case 'rename-object':        return await renameObject(body);

      default: return err(`Unknown action: ${action}`);
    }
  } catch (e) {
    console.error(`[s3 function] action=${action} error:`, e);
    return err('Internal server error', 500);
  }
};
