import { createAuth } from '$lib/server/auth/lucia';
import { FeideProvider } from '$lib/server/auth/feide';
import { createDatabase } from '$lib/server/db/drizzle';
import { BanService } from '$lib/server/services/ban.service';
import { BeerService } from '$lib/server/services/beer.service';
import { ContactSubmissionService } from '$lib/server/services/contact-submission.service';
import { EmailService } from '$lib/server/services/email.service';
import { EventService } from '$lib/server/services/event.service';
import { InvitationService } from '$lib/server/services/invitation.service';
import { NotificationService } from '$lib/server/services/notification.service';
import { ProducerService } from '$lib/server/services/producer.service';
import { ProductService } from '$lib/server/services/product.service';
import { ProductTypeService } from '$lib/server/services/product-type.service';
import { ShiftService } from '$lib/server/services/shift.service';
import { StatusService } from '$lib/server/services/status.service';
import { UserService } from '$lib/server/services/user.service';
import { PushSubscriptionService } from '$lib/server/services/push-subscription.service';
import { PushNotificationService } from '$lib/server/services/push-notification.service';
import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { ImageService } from '$lib/server/services/image.service';
import { ReferralService } from '$lib/server/services/referral.service';
import { PendingApplicationService } from '$lib/server/services/pending-application.service';
import { RateLimitService } from '$lib/server/services/rate-limit.service';
import { csrf } from '$lib/server/csrf';

const setup: Handle = async ({ event, resolve }) => {
	// Set up primitive services from Cloudflare environment
	const STATUS_KV = event.platform!.env.STATUS_KV;
	const R2_BUCKET = event.platform!.env.BUCKET;
	const DB = event.platform!.env.DB;

	const banService = new BanService(STATUS_KV);
	event.locals.banService = banService;

	// Check if IP is banned
	const isBanned = await banService.isBanned(event);
	if (isBanned) {
		return new Response(null, {
			status: 429,
			headers: {
				'retry-after': '3600'
			}
		});
	}

	const sendEmail = event.platform!.env.EMAIL;

	// Setup database
	const db = createDatabase(DB);
	event.locals.db = db;

	// Setup auth
	const auth = createAuth(db);
	event.locals.auth = auth;

	// Setup feide provider
	const feideProvider = new FeideProvider(
		event.platform!.env.FEIDE_CLIENT_ID,
		event.platform!.env.FEIDE_CLIENT_SECRET,
		event.platform!.env.FEIDE_REDIRECT_URI
	);
	event.locals.feideProvider = feideProvider;

	// Setup services
	event.locals.statusService = new StatusService(STATUS_KV);
	event.locals.rateLimitService = new RateLimitService(STATUS_KV);
	event.locals.emailService = new EmailService(sendEmail);
	event.locals.invitationService = new InvitationService(db);
	event.locals.userService = new UserService(db);
	event.locals.eventService = new EventService(db);
	event.locals.shiftService = new ShiftService(db);
	event.locals.contactSubmissionService = new ContactSubmissionService(db);
	event.locals.producerService = new ProducerService(db);
	event.locals.productTypeService = new ProductTypeService(db);
	event.locals.productService = new ProductService(db);
	event.locals.imageService = new ImageService(R2_BUCKET, db);
	event.locals.referralService = new ReferralService(db);
	event.locals.pendingApplicationService = new PendingApplicationService(db);
	event.locals.beerService = new BeerService(db, event.locals.shiftService);

	// Setup push notification services
	event.locals.pushSubscriptionService = new PushSubscriptionService(db);

	// Only initialize push notifications if VAPID keys are configured
	let pushNotificationService: PushNotificationService | undefined;
	const vapidPublicKey = event.platform?.env.PUBLIC_VAPID_PUBLIC_KEY;
	const vapidPrivateKey = event.platform?.env.VAPID_PRIVATE_KEY;
	const vapidSubject = event.platform?.env.VAPID_SUBJECT || 'mailto:web@programmerbar.no';

	if (vapidPublicKey && vapidPrivateKey) {
		pushNotificationService = new PushNotificationService(event.locals.pushSubscriptionService, {
			vapidPublicKey,
			vapidPrivateKey,
			vapidSubject
		});
		event.locals.pushNotificationService = pushNotificationService;
	}

	// Setup notification service with optional push support
	event.locals.notificationService = new NotificationService(db, pushNotificationService);

	// Validate auth
	const sessionId = event.cookies.get(auth.sessionCookieName);

	if (sessionId) {
		const { session, user } = await auth.validateSession(sessionId);

		event.locals.user = user;
		event.locals.session = session;
	} else {
		event.locals.user = null;
		event.locals.session = null;
	}

	// Clear cookie if no valid user
	if (!event.locals.user) {
		event.cookies.delete(auth.sessionCookieName, {
			path: '/'
		});
	}

	// Only board members have access to routes under /portal/admin
	if (event.url.pathname.startsWith('/portal/admin') && event.locals.user?.role !== 'board') {
		return new Response(null, {
			status: 307,
			headers: {
				location: '/logg-inn'
			}
		});
	}

	// Only authenticated users have access to routes under /portal
	if (event.url.pathname.startsWith('/portal') && !event.locals.user) {
		return new Response(null, {
			status: 307,
			headers: {
				location: '/logg-inn'
			}
		});
	}

	return await resolve(event);
};

// Allow Slack webhook endpoint to bypass CSRF protection
export const handle = sequence(
	csrf(['/slack-command']),
	setup
);
