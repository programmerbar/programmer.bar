// See https://kit.svelte.dev/docs/types#app

// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			// Email client
			resend: import('resend').Resend;

			// DB client
			db: import('$lib/server/db/drizzle').Database;

			// Auth service
			auth: import('$lib/server/auth/lucia').Auth;

			// Auth
			user: import('lucia').User | null;
			session: import('lucia').Session | null;

			// Auth providers
			feideProvider: import('$lib/server/auth/feide').FeideProvider;

			// Serivces
			emailService: import('$lib/server/services/email.service').EmailService;
			statusService: import('$lib/server/services/status.service').StatusService;
			rateLimitService: import('$lib/server/services/rate-limit.service').RateLimitService;
			invitationService: import('$lib/server/services/invitation.service').InvitationService;
			eventService: import('$lib/server/services/event.service').EventService;
			userService: import('$lib/server/services/user.service').UserService;
			shiftService: import('$lib/server/services/shift.service').ShiftService;
			beerService: import('$lib/server/services/beer.service').BeerService;
			banService: import('$lib/server/services/ban.service').BanService;
			notificationService: import('$lib/server/services/notification.service').NotificationService;
			contactSubmissionService: import('$lib/server/services/contact-submission.service').ContactSubmissionService;
			producerService: import('$lib/server/services/producer.service').ProducerService;
			productTypeService: import('$lib/server/services/product-type.service').ProductTypeService;
			productService: import('$lib/server/services/product.service').ProductService;
			imageService: import('$lib/server/services/image.service').ImageService;
			referralService: import('$lib/server/services/referral.service').ReferralService;
			pendingApplicationService: import('$lib/server/services/pending-application.service').PendingApplicationService;
			pushSubscriptionService: import('$lib/server/services/push-subscription.service').PushSubscriptionService;
			pushNotificationService?: import('$lib/server/services/push-notification.service').PushNotificationService;
		}
		// interface PageData {}
		// interface PageState {}
		interface Platform {
			env: Env;
			cf: CfProperties;
			ctx: ExecutionContext;
		}
	}
}

export {};
