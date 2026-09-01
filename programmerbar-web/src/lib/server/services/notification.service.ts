import type { Database } from '$lib/server/db/drizzle';
import * as table from '$lib/server/db/schemas';
import { and, eq, isNull, desc } from 'drizzle-orm';
import type { PushNotificationService } from './push-notification.service';

type NotificationPayload = {
	title: string;
	message: string;
};

export class NotificationService {
	#db: Database;
	#pushNotificationService?: PushNotificationService;

	constructor(db: Database, pushNotificationService?: PushNotificationService) {
		this.#db = db;
		this.#pushNotificationService = pushNotificationService;
	}

	async getUnarchived(userId: string) {
		const notifications = await this.#db
			.select()
			.from(table.notifications)
			.where(and(eq(table.notifications.userId, userId), isNull(table.notifications.archivedAt)))
			.orderBy(desc(table.notifications.createdAt));

		return notifications;
	}

	async archive(notificationId: string) {
		const notification = await this.#db
			.update(table.notifications)
			.set({ archivedAt: new Date() })
			.where(eq(table.notifications.id, notificationId))
			.returning();

		return notification[0];
	}

	async archiveAll(userId: string) {
		return this.#db
			.update(table.notifications)
			.set({ archivedAt: new Date() })
			.where(and(eq(table.notifications.userId, userId), isNull(table.notifications.archivedAt)))
			.returning();
	}

	async find(notificationId: string) {
		const notification = await this.#db
			.select()
			.from(table.notifications)
			.where(eq(table.notifications.id, notificationId))
			.limit(1);

		return notification[0];
	}

	async create(userId: string, title: string, body: string) {
		const notification = await this.#db
			.insert(table.notifications)
			.values({
				userId,
				title,
				body
			})
			.returning();

		// Send push notification if service is available
		if (this.#pushNotificationService) {
			await this.#pushNotificationService
				.sendToUser(userId, {
					title,
					body: body || ''
				})
				.catch((error) => {
					console.error(`[NotificationService] ❌ Failed to send push notification:`, error);
				});
		}

		return notification[0];
	}

	async sendNotifications(userIds: Array<string>, payload: NotificationPayload) {
		const notifications = userIds.map((userId) => ({
			userId,
			title: payload.title,
			body: payload.message
		}));

		await this.#db.insert(table.notifications).values(notifications);

		// Send push notifications if service is available
		if (this.#pushNotificationService) {
			await this.#pushNotificationService
				.sendToUsers(userIds, {
					title: payload.title,
					body: payload.message
				})
				.catch((error) => {
					console.error(`[NotificationService] ❌ Failed to send push notifications:`, error);
				});
		}
	}
}
