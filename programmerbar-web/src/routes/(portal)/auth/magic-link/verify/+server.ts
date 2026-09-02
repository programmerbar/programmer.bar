import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals, cookies, url }) => {
	const token = url.searchParams.get('token');
	if (!token) redirect(303, '/logg-inn?magicLink=invalid');

	const userId = await locals.magicLinkService.consume(token);
	if (!userId) redirect(303, '/logg-inn?magicLink=invalid');

	const user = await locals.userService.findById(userId);
	if (!user) redirect(303, '/logg-inn?magicLink=invalid');

	const session = await locals.auth.createSession(user.id, {});
	const sessionCookie = locals.auth.createSessionCookie(session.id);
	cookies.set(sessionCookie.name, sessionCookie.value, {
		...sessionCookie.attributes,
		path: '/'
	});

	redirect(303, '/portal');
};
