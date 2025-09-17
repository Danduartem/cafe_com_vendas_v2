/**
 * Meta IDs helper (CSP-safe)
 * - Ensures `_fbc` from fbclid without inline/remote scripts
 * - Ensures `_fbp` exists (fallback if Pixel didn’t create it yet)
 * - Exposes `getMetaUserData()` to attach to GTM events
 */

function getCookie(name: string): string | undefined {
  try {
    const pairs = document.cookie ? document.cookie.split('; ') : [];
    for (const pair of pairs) {
      const eqIndex = pair.indexOf('=');
      if (eqIndex === -1) continue;
      const key = pair.slice(0, eqIndex);
      if (key === name) {
        return decodeURIComponent(pair.slice(eqIndex + 1));
      }
    }
  } catch {
    // ignore
  }
  return undefined;
}

function setCookie(name: string, value: string, maxAgeSeconds: number): void {
  try {
    const parts = [
      `${name}=${encodeURIComponent(value)}`,
      'path=/' ,
      // Host-only cookie to avoid PSL complexity; works across all paths on current host
      `max-age=${maxAgeSeconds}`,
      'samesite=Lax'
    ];
    if (location.protocol === 'https:') parts.push('secure');
    document.cookie = parts.join('; ');
  } catch {
    // noop
  }
}

function generateRandomString(length = 10): string {
  try {
    const arr = new Uint8Array(length);
    crypto.getRandomValues(arr);
    return Array.from(arr, b => (b % 36).toString(36)).join('');
  } catch {
    return Math.random().toString(36).slice(2, 2 + length);
  }
}

function ensureFbpCookie(): string | undefined {
  let fbp = getCookie('_fbp');
  if (!fbp) {
    const ts = Math.floor(Date.now() / 1000);
    const rand = generateRandomString(10);
    fbp = `fb.1.${ts}.${rand}`;
    // 2 years
    setCookie('_fbp', fbp, 2 * 365 * 24 * 60 * 60);
  }
  return fbp;
}

function ensureFbcCookie(): string | undefined {
  try {
    const current = getCookie('_fbc');
    const params = new URLSearchParams(location.search);
    const fbclid = params.get('fbclid');
    if (fbclid) {
      const ts = Math.floor(Date.now() / 1000);
      const fbc = `fb.1.${ts}.${fbclid}`;
      // 2 years
      setCookie('_fbc', fbc, 2 * 365 * 24 * 60 * 60);
      return fbc;
    }
    return current;
  } catch {
    return getCookie('_fbc');
  }
}

/**
 * Run early to maximize coverage. Safe to call multiple times.
 */
export function ensureMetaCookies(): void {
  // Don’t overwrite existing cookies; just ensure presence
  ensureFbpCookie();
  ensureFbcCookie();
}

/**
 * Build user_data payload for Meta Conversions API mapping downstream
 * Only includes non-empty values.
 */
export function getMetaUserData(): Record<string, string> {
  const out: Record<string, string> = {};
  const fbp = getCookie('_fbp');
  const fbc = getCookie('_fbc');
  if (fbp) out.fbp = fbp;
  if (fbc) out.fbc = fbc;
  return out;
}

export default {
  ensureMetaCookies,
  getMetaUserData
};
