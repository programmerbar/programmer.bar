import { form, getRequestEvent } from '$app/server';
import { fail } from '@sveltejs/kit';
import { z } from 'zod';

const ArchiveBodySchema = z.object({
	notificationId: z.string().min(1, 'Missing notification ID')
});

export const archiveNotificationAction = form(ArchiveBodySchema, async ({ notificationId }) => {
	const { locals } = getRequestEvent();
	const user = locals.user;

	if (!user) {
		return fail(401, {
			message: 'Unauthorized'
		});
	}

	const notification = await locals.notificationService.find(notificationId);
	if (!notification) {
		return fail(404, {
			message: 'Notification not found'
		});
	}

	if (notification.userId !== user.id) {
		return fail(403, {
			message: 'Forbidden'
		});
	}

	await locals.notificationService.archive(notificationId);

	return {
		message: 'Notification archived successfully'
	};
});

export const archiveAllNotificationsAction = form(async () => {
	const { locals } = getRequestEvent();
	const user = locals.user;

	if (!user) {
		return fail(401, {
			message: 'Unauthorized'
		});
	}

	await locals.notificationService.archiveAll(user.id);

	return {
		message: 'All notifications archived successfully'
	};
});
