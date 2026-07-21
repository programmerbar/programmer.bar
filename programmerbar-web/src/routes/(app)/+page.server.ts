import { getEvents as getSanityEvents, getRepeatingEvents } from '$lib/api/sanity/echo-cms';
import { getProducts } from '$lib/api/sanity/queries';
import { flattenRepeatingEvents } from '$lib/utils/events';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const [products, sanityEvents, dbEvents, repeatingEvents, status] = await Promise.all([
		getProducts(),
		getSanityEvents(),
		locals.eventService.getUpcomingPublicEvents(),
		getRepeatingEvents(),
		locals.statusService.getWithMessage()
	]);

	const p = products.filter((product) => !product.isSoldOut);
	const allRepeatingEvents = flattenRepeatingEvents(repeatingEvents);
	const allEvents = [...sanityEvents, ...allRepeatingEvents, ...dbEvents]
		.filter((event) => Date.now() <= new Date(event.date).getTime())
		.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
		.slice(0, 6);

	return {
		products: p,
		events: allEvents,
		status
	};
};
