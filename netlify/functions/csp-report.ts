/**
 * Netlify Function: CSP Report endpoint
 * Receives Content-Security-Policy violation reports to help diagnose CSP issues in production
 */

// Modern (Functions v2, ESM) handler
export default async function cspReportV2(request: Request): Promise<Response> {
  if (request.method === 'OPTIONS') {
    return new Response('', { status: 200 });
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('application/csp-report') || contentType.includes('application/json')) {
      const json = (await request.json().catch(() => ({}))) as unknown;
      console.warn('[CSP-Report]', JSON.stringify(json));
    } else {
      const text = await request.text();
      console.warn('[CSP-Report] Non-JSON report:', text);
    }
    return new Response('', { status: 204 });
  } catch (err) {
    console.warn('[CSP-Report] Handler error (v2):', err);
    return new Response('', { status: 204 });
  }
}

// Legacy (Functions v1, CJS-style) compatibility export
// Allows this function to run even if the account is still using the v1 runtime
interface NetlifyV1Event {
  httpMethod?: string;
  headers?: Record<string, string | undefined>;
  body?: string;
  isBase64Encoded?: boolean;
}

export function handler(event: NetlifyV1Event): { statusCode: number; headers?: Record<string, string>; body?: string } {
  try {
    const method = event.httpMethod ?? '';
    if (method === 'OPTIONS') {
      return { statusCode: 200 };
    }

    if (method !== 'POST') {
      return {
        statusCode: 405,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Method not allowed' })
      };
    }

    const headers = event.headers ?? {};
    const contentType = (headers['content-type'] ?? headers['Content-Type'] ?? '');
    const rawBody = event.body ?? '';
    const isBase64 = event.isBase64Encoded === true;

    // Netlify v1 may base64-encode the body; handle both cases safely
    const bodyText = isBase64 ? Buffer.from(rawBody, 'base64').toString('utf8') : rawBody;

    if (contentType.includes('application/csp-report') || contentType.includes('application/json')) {
      try {
        const parsed: unknown = JSON.parse(bodyText || '{}');
        console.warn('[CSP-Report]', JSON.stringify(parsed));
      } catch {
        console.warn('[CSP-Report] Invalid JSON body (v1):', bodyText.slice(0, 2000));
      }
    } else {
      console.warn('[CSP-Report] Non-JSON report (v1):', bodyText.slice(0, 2000));
    }

    return { statusCode: 204 };
  } catch (err) {
    console.warn('[CSP-Report] Handler error (v1):', err);
    return { statusCode: 204 };
  }
}
