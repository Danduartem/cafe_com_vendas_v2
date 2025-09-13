/**
 * Netlify Function: CSP Report endpoint
 * Receives Content-Security-Policy violation reports to help diagnose CSP issues in production
 */

export default async (request: Request): Promise<Response> => {
  if (request.method === 'OPTIONS') {
    return new Response('', { status: 200 });
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('application/csp-report') || contentType.includes('application/json')) {
      // Some browsers send {"csp-report": {...}}, others use "body": {...}
      const json = (await request.json().catch(() => ({}))) as unknown;
      // Log compactly to Netlify functions logs
      console.warn('[CSP-Report]', JSON.stringify(json));
    } else {
      const text = await request.text();
      console.warn('[CSP-Report] Non-JSON report:', text);
    }
    return new Response('', { status: 204 });
  } catch {
    return new Response('', { status: 204 });
  }
};
