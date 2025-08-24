import type { Context, Config } from "@netlify/edge-functions";

export default async function handler(_request: Request, context: Context) {
	const res = await context.next();

	const csp = [
		"default-src 'self'",
		"script-src 'self' 'unsafe-inline' https://js.stripe.com https://*.googletagmanager.com https://*.google-analytics.com https://*.analytics.google.com https://*.google.com https://*.googleadservices.com",
		"style-src 'self' 'unsafe-inline' https://*.googletagmanager.com https://fonts.googleapis.com",
		"style-src-elem 'self' 'unsafe-inline' https://*.googletagmanager.com https://fonts.googleapis.com",
		"img-src 'self' data: https: blob:",
		"font-src 'self' data:",
		"connect-src 'self' https://api.stripe.com https://formspree.io https://connect.mailerlite.com https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://*.google.com https://*.doubleclick.net https://*.googleadservices.com",
		"frame-src https://js.stripe.com https://hooks.stripe.com https://www.youtube-nocookie.com https://www.youtube.com https://*.googletagmanager.com",
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

export const config: Config = {
	path: '/*'
};


