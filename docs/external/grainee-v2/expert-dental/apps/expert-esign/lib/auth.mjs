import argon2 from 'argon2';
import { SignJWT, jwtVerify } from 'jose';
import { authenticator } from 'otplib';
import { appendAudit, isoNow } from './core.mjs';

const ROLE_ORDER = {
  doctor: 10,
  administrator: 10,
  clinic_authorized: 20,
  compliance: 30,
  system_admin: 40,
};

function key(env = process.env) {
  const secret = env.JWT_SECRET;
  if (!secret || secret.length < 32) throw new Error('JWT_SECRET must contain at least 32 characters');
  return new TextEncoder().encode(secret);
}

export async function issueSession(user, env = process.env) {
  const ttl = Number(env.JWT_TTL_MINUTES || 480);
  return new SignJWT({
    sub: user.id,
    username: user.username,
    displayName: user.display_name,
    role: user.role,
    purpose: 'expert-esign-staff-session',
  })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt()
    .setExpirationTime(`${ttl}m`)
    .setIssuer('expert-esign')
    .setAudience('expert-esign-staff')
    .sign(key(env));
}

export async function verifySession(token, env = process.env) {
  const result = await jwtVerify(token, key(env), {
    issuer: 'expert-esign',
    audience: 'expert-esign-staff',
  });
  if (result.payload.purpose !== 'expert-esign-staff-session') throw new Error('invalid_session_purpose');
  return result.payload;
}

export function authMiddleware(env = process.env) {
  return async (req, res, next) => {
    const token = req.cookies?.expert_esign_session;
    if (!token) return res.status(401).json({ error: 'authentication_required' });
    try {
      req.user = await verifySession(token, env);
      next();
    } catch {
      res.clearCookie('expert_esign_session', { path: env.BASE_PATH || '/esign' });
      return res.status(401).json({ error: 'invalid_or_expired_session' });
    }
  };
}

export function requireRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) return res.status(403).json({ error: 'forbidden', requiredRoles: roles });
    next();
  };
}

export function requireAtLeast(role) {
  return (req, res, next) => {
    if (!req.user || (ROLE_ORDER[req.user.role] ?? -1) < (ROLE_ORDER[role] ?? 999)) {
      return res.status(403).json({ error: 'forbidden', minimumRole: role });
    }
    next();
  };
}

export async function authenticateUser(pool, { username, password, totp }, context = {}) {
  const result = await pool.query(
    `SELECT id, username, display_name, role, password_hash, totp_secret, active
     FROM staff_users WHERE username = $1`,
    [username],
  );
  const user = result.rows[0];
  if (!user || !user.active || !(await argon2.verify(user.password_hash, password))) {
    await appendAudit(pool, {
      actorType: 'anonymous',
      actorId: username || null,
      eventType: 'AUTH_LOGIN_FAILED',
      payload: { reason: 'invalid_credentials' },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      requestId: context.requestId,
    });
    return null;
  }
  if (user.totp_secret && !authenticator.check(String(totp || ''), user.totp_secret)) {
    await appendAudit(pool, {
      actorType: 'staff',
      actorId: user.id,
      eventType: 'AUTH_LOGIN_FAILED',
      payload: { reason: 'invalid_totp' },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      requestId: context.requestId,
    });
    return null;
  }
  await appendAudit(pool, {
    actorType: 'staff',
    actorId: user.id,
    eventType: 'AUTH_LOGIN_SUCCEEDED',
    payload: { role: user.role, username: user.username, at: isoNow() },
    ipAddress: context.ipAddress,
    userAgent: context.userAgent,
    requestId: context.requestId,
  });
  return user;
}

export async function createStaffUser(pool, input) {
  if (!ROLE_ORDER[input.role]) throw new Error('invalid_role');
  const passwordHash = await argon2.hash(input.password, { type: argon2.argon2id });
  const result = await pool.query(
    `INSERT INTO staff_users (username, display_name, role, password_hash, totp_secret)
     VALUES ($1,$2,$3,$4,$5)
     RETURNING id, username, display_name, role, active, created_at`,
    [input.username, input.displayName, input.role, passwordHash, input.totpSecret || null],
  );
  return result.rows[0];
}

export function cookieOptions(env = process.env) {
  return {
    httpOnly: true,
    secure: String(env.COOKIE_SECURE || 'true').toLowerCase() !== 'false',
    sameSite: 'strict',
    path: env.BASE_PATH || '/esign',
    maxAge: Number(env.JWT_TTL_MINUTES || 480) * 60 * 1000,
  };
}
