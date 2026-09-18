import { z } from 'zod';
import { zfd } from 'zod-form-data';

export const UserRoleSchema = z.enum(['board', 'normal', 'inactive']);

export const CreateEventSchema = z.object({
	name: z.string(),
	date: z.coerce.date(),
	slug: z.string().nullable(),
	description: z.string().nullable(),
	shifts: z
		.object({
			startAt: z.coerce.date(),
			endAt: z.coerce.date(),
			users: z.array(z.string())
		})
		.array()
});

export const ContactUsSchema = zfd.formData({
	namekjkj: zfd.text(z.string().min(2).max(50)),
	emailkjkj: zfd.text(z.email().min(3)),
	messagekjkj: zfd.text(z.string().min(5).max(1000))
});

export const CreateInvitationSchema = z.object({
	email: z.email()
});

export const isValidEmail = (x: unknown): boolean => z.email().safeParse(x).success;

export const CreateEmailShiftSchema = z.object({
	user: z.object({
		name: z.string().min(1),
		email: z.email(),
		altEmail: z.email()
	}),
	shift: z.object({
		startAt: z.coerce.date(),
		endAt: z.coerce.date(),
		summary: z.string().min(1),
		description: z.string().optional()
	})
});
