export default async function handler(request, context) {
	const response = await context.next();
	const contentType = response.headers.get('content-type') || '';

	// Generate a per-request nonce (UUID is sufficient for CSP nonces)
	const nonce = crypto.randomUUID();

	const csp = [
		"default-src 'self'",
		`script-src 'self' https://js.stripe.com https://www.googletagmanager.com https://www.google-analytics.com https://plausible.io 'strict-dynamic' 'nonce-${nonce}'`,
		"style-src 'self'",
		"img-src 'self' data: https: blob:",
		"font-src 'self' data:",
		"connect-src 'self' https://api.stripe.com https://formspree.io https://connect.mailerlite.com https://www.google-analytics.com https://plausible.io",
		"frame-src https://js.stripe.com https://hooks.stripe.com",
		"form-action 'self' https://formspree.io",
		"base-uri 'self'",
		"object-src 'none'"
	].join('; ');

	const newHeaders = new Headers(response.headers);
	newHeaders.set('Content-Security-Policy', csp);

	if (!contentType.includes('text/html')) {
		return new Response(response.body, {
			status: response.status,
			headers: newHeaders
		});
	}

	// Add nonce to all script tags in HTML
	const rewriter = new HTMLRewriter().on('script', {
		element(el) {
			el.setAttribute('nonce', nonce);
		}
	});

	const transformed = rewriter.transform(response);
	return new Response(transformed.body, {
		status: response.status,
		headers: newHeaders
	});
}

export const config = {
	path: '/*'
};


