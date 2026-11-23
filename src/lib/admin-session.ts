
import "server-only";

import {
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";

export const ADMIN_SESSION_COOKIE =
  "ember_olive_admin_session";

export const SESSION_DURATION_SECONDS =
  60 * 60 * 8; // 8 hours

function getSessionSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error(
      "ADMIN_SESSION_SECRET is missing or too short."
    );
  }

  return secret;
}

// CREATE SIGNED SESSION TOKEN
export function createAdminSession(): string {
  const expiresAt =
    Date.now() + SESSION_DURATION_SECONDS * 1000;

  const nonce = randomBytes(16).toString("hex");

  const payload = `v1.${expiresAt}.${nonce}`;

  const signature = createHmac(
    "sha256",
    getSessionSecret()
  )
    .update(payload)
    .digest("hex");

  return `${payload}.${signature}`;
}

// VERIFY SIGNATURE AND EXPIRATION
export function verifyAdminSession(
  token: string | undefined
): boolean {
  if (!token) return false;

  const parts = token.split(".");

  if (parts.length !== 4) return false;

  const [version, expiration, nonce, signature] =
    parts;

  if (
    version !== "v1" ||
    !/^\d{13}$/.test(expiration) ||
    !/^[a-f0-9]{32}$/.test(nonce) ||
    !/^[a-f0-9]{64}$/.test(signature)
  ) {
    return false;
  }

  const expiresAt = Number(expiration);

  if (
    !Number.isSafeInteger(expiresAt) ||
    expiresAt <= Date.now() ||
    expiresAt >
      Date.now() + SESSION_DURATION_SECONDS * 1000
  ) {
    return false;
  }

  const payload = `v1.${expiration}.${nonce}`;

  const expectedSignature = createHmac(
    "sha256",
    getSessionSecret()
  )
    .update(payload)
    .digest();

  const providedSignature = Buffer.from(
    signature,
    "hex"
  );

  return (
    providedSignature.length ===
      expectedSignature.length &&
    timingSafeEqual(
      providedSignature,
      expectedSignature
    )
  );
}
