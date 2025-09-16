/**
 * PII hashing utilities (CSP-safe, WebCrypto-based)
 * - Hash email (em) and phone (ph) per Meta spec (SHA-256, lowercase/trim)
 */

function normalizeEmail(email?: string): string | undefined {
  if (!email) return undefined;
  const e = email.trim().toLowerCase();
  return e || undefined;
}

function normalizePhone(phone?: string): string | undefined {
  if (!phone) return undefined;
  // Keep digits only; assume caller includes country code when available
  const digits = phone.replace(/\D+/g, '');
  return digits || undefined;
}

async function sha256(input: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(input);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function hashEmail(email?: string): Promise<string | undefined> {
  const normalized = normalizeEmail(email);
  if (!normalized) return undefined;
  return sha256(normalized);
}

export async function hashPhone(phone?: string): Promise<string | undefined> {
  const normalized = normalizePhone(phone);
  if (!normalized) return undefined;
  return sha256(normalized);
}

export async function buildHashedUserData(email?: string, phone?: string): Promise<{ em?: string; ph?: string }> {
  const [em, ph] = await Promise.all([hashEmail(email), hashPhone(phone)]);
  const out: { em?: string; ph?: string } = {};
  if (em) out.em = em;
  if (ph) out.ph = ph;
  return out;
}

export default { hashEmail, hashPhone, buildHashedUserData };

