import * as Sentry from '@sentry/sveltekit';
Sentry.init({
	dsn: 'https://974f3f9038ebc2dee7636f80f1eb16d4@o4510342180634624.ingest.de.sentry.io/4510342182010960',

	// https://docs.sentry.io/platforms/javascript/guides/sveltekit/configuration/options/#sendDefaultPii
	sendDefaultPii: false,

	enabled: import.meta.env.PROD
});

export const handleError = Sentry.handleErrorWithSentry();
