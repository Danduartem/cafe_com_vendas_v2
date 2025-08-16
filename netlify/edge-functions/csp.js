export default async function handler(request, context) {
	const res = await context.next();
	const contentType = res.headers.get('content-type') || '';

	const csp = [
		"default-src 'self'",
		"script-src 'self' https://js.stripe.com https://www.googletagmanager.com https://www.google-analytics.com https://plausible.io",
		"style-src 'self' 'unsafe-inline'",
		"img-src 'self' data: https: blob:",
		"font-src 'self' data:",
		"connect-src 'self' https://api.stripe.com https://formspree.io https://connect.mailerlite.com https://www.google-analytics.com https://plausible.io",
		"frame-src https://js.stripe.com https://hooks.stripe.com",
		"form-action 'self' https://formspree.io",
		"base-uri 'self'",
		"object-src 'none'"
	].join('; ');

	const newHeaders = new Headers(res.headers);
	newHeaders.set('Content-Security-Policy', csp);

	return new Response(res.body, {
		status: res.status,
		statusText: res.statusText,
		headers: newHeaders
	});
}

export const config = {
	path: '/*'
};


