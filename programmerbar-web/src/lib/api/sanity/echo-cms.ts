import groq from 'groq';
import imageUrlBuilder, { type SanityImageSource } from '@sanity/image-url';
import { createClient } from '@sanity/client';

export const ECHO_SANITY_PROJECT_ID = 'pgq2pd26';
export const ECHO_SANITY_DATASET = 'production';

export const echoSanityClient = createClient({
	projectId: ECHO_SANITY_PROJECT_ID,
	dataset: ECHO_SANITY_DATASET,
	apiVersion: '2021-08-31',
	useCdn: true
});

export type Happening = {
	_id: string;
	title: string;
	slug: string;
	date: string;
	_createdAt: string | null;
	registrationStart: string | null;
	body: string | null;
};

const getEventsQuery = groq`*[
	_type == "happening" &&
	!(_id in path("drafts.**")) &&
	("programmerbar" in organizers[]->slug.current ||
	"3ce656b8-40b7-4614-ae68-6acc1efa8661" == location->_id) &&
	date >= now()
] | order(date asc) {
	_id,
	title,
	"slug": slug.current,
	date,
	registrationStart,
	_createdAt,
	body
}[0...6]`;

export const getEvents = async () => {
	return await echoSanityClient.fetch<Array<Happening>>(getEventsQuery);
};

const getUpcomingEventsQuery = groq`*[
	_type == "happening" &&
	!(_id in path("drafts.**")) &&
	("programmerbar" in organizers[]->slug.current ||
	"3ce656b8-40b7-4614-ae68-6acc1efa8661" == location->_id) &&
	date > now()
] | order(date asc) {
	_id,
	title,
	"slug": slug.current,
	date,
	registrationStart,
	_createdAt,
	body
}`;

export const getUpcomingEvents = async () => {
	return await echoSanityClient.fetch<Array<Happening>>(getUpcomingEventsQuery);
};

export const getEventBySlugQuery = groq`*[
	_type == "happening" &&
	!(_id in path("drafts.**")) &&
	("programmerbar" in organizers[]->slug.current ||
	"3ce656b8-40b7-4614-ae68-6acc1efa8661" == location->_id) &&
	slug.current == $slug
] {
	_id,
	title,
	"slug": slug.current,
	date,
	registrationStart,
	_createdAt,
	body
}[0]`;

export const getEventBySlug = async (slug: string) => {
	return await echoSanityClient.fetch<Happening | null>(getEventBySlugQuery, { slug });
};

export type RepeatingEvent = {
	_id: string;
	title: string;
	dayOfWeek: number;
	startTime: string;
	endTime: string;
	startDate: string;
	endDate: string;
	ignoredDates: Array<string> | null;
	interval: 'daily' | 'weekly' | 'bi-weekly' | 'monthly';
	slug: string;
	_createdAt: string;
	body: string | null;
};

export const getRepeatingEventsQuery = groq`*[
	_type == "repeatingHappening" &&
	!(_id in path("drafts.**")) &&
	("programmerbar" in organizers[]->slug.current ||
	"3ce656b8-40b7-4614-ae68-6acc1efa8661" == location->_id)
] | order(date asc) {
	_id,
	title,
	dayOfWeek,
	startTime,
	endTime,
	startDate,
	ignoredDates,
	endDate,
	interval,
	_createdAt,
	"slug": slug.current,
	body
}`;

export const getRepeatingEvents = async () => {
	return await echoSanityClient.fetch<Array<RepeatingEvent>>(getRepeatingEventsQuery);
};

export const getRepeatingEventBySlugQuery = groq`*[
	_type == "repeatingHappening" &&
	!(_id in path("drafts.**")) &&
	("programmerbar" in organizers[]->slug.current ||
	"3ce656b8-40b7-4614-ae68-6acc1efa8661" == location->_id) &&
	slug.current == $slug
] {
	_id,
	title,
	dayOfWeek,
	startTime,
	endTime,
	startDate,
	ignoredDates,
	endDate,
	interval,
	_createdAt,
	"slug": slug.current,
	body
}[0]`;

export const getRepeatingEventBySlug = async (slug: string) => {
	return await echoSanityClient.fetch<RepeatingEvent | null>(getRepeatingEventBySlugQuery, {
		slug
	});
};

export const PROGRAMMERBAR_GROUP_QUERY = groq`*[_type == "studentGroup"
    && slug.current == $slug
    && !(_id in path('drafts.**'))] {
    _id,
    _createdAt,
    _updatedAt,
    name,
    groupType,
    "slug": slug.current,
    description,
    image,
    "members": members[] {
      role,
      "profile": profile->{
        _id,
        name,
        picture,
        socials,
      },
    },
    "socials": socials {
      facebook,
      instagram,
      linkedin,
      email,
    }
  }[0]`;

export type StudentGroup = {
	_id: string;
	_createdAt: string;
	_updatedAt: string;
	name: string;
	groupType: string;
	slug: string;
	description: string;
	image: string;
	members: Array<{
		role: string | null;
		profile: {
			_id: string;
			name: string;
			picture: string | null;
		};
	}>;
	socials: Array<{
		facebook: string;
		instagram: string;
		linkedin: string;
		email: string;
	}>;
};

type Image = SanityImageSource;

const echoBuilder = imageUrlBuilder(echoSanityClient);

export const echoUrlFor = (source: Image) => {
	return echoBuilder.image(source);
};
