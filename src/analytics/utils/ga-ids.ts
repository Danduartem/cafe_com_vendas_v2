/**
 * Best-effort GA4 identifiers collector
 * - Extracts GA client id from _ga cookie: GA1.2.<cid1>.<cid2> → <cid1>.<cid2>
 * - Extracts GA4 session info from _ga_* cookie: GS1.1.<sessionId>.<sessionNum>....
 *   Note: This is heuristic; if unavailable, fields are undefined.
 */

function getCookie(name: string): string | undefined {
  // Escape regex special chars in cookie name safely
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const m = document.cookie.match(new RegExp('(?:^|; )' + escapedName + '=([^;]*)'));
  return m ? decodeURIComponent(m[1]) : undefined;
}

function parseGaClientId(): string | undefined {
  const val = getCookie('_ga');
  if (!val) return undefined;
  // Expected format: GA1.2.1234567890.1234567890
  const parts = val.split('.');
  if (parts.length >= 4) {
    const cid1 = parts[2];
    const cid2 = parts[3];
    if (cid1 && cid2) return `${cid1}.${cid2}`;
  }
  return undefined;
}

function findGa4CookieName(): string | undefined {
  const cookies = document.cookie.split(';').map(c => c.trim());
  const ga4 = cookies.find(c => c.startsWith('_ga_'));
  if (!ga4) return undefined;
  const eq = ga4.indexOf('=');
  return ga4.substring(0, eq > -1 ? eq : ga4.length);
}

function parseGaSession(cookieName: string): { ga_session_id?: string; ga_session_number?: number } {
  const val = getCookie(cookieName);
  if (!val) return {};
  // Common GA4 pattern: GS1.1.<sessionId>.<sessionNumber>....
  const parts = val.split('.');
  if (parts.length >= 4 && parts[0] === 'GS1') {
    const sessionId = parts[2];
    const sessionNum = Number(parts[3]);
    return {
      ga_session_id: sessionId && sessionId !== '0' ? sessionId : undefined,
      ga_session_number: Number.isFinite(sessionNum) ? sessionNum : undefined
    };
  }
  return {};
}

export function collectGAIds(): { ga_client_id?: string; ga_session_id?: string; ga_session_number?: number } {
  try {
    const ga_client_id = parseGaClientId();
    const ga4Cookie = findGa4CookieName();
    const { ga_session_id, ga_session_number } = ga4Cookie ? parseGaSession(ga4Cookie) : {};
    return { ga_client_id, ga_session_id, ga_session_number };
  } catch {
    return {};
  }
}

export default collectGAIds;
