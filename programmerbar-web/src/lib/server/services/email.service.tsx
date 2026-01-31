import { dev } from '$app/environment';
import {
	ContactUsEmail,
	InvitationEmail,
	NewShiftEmail,
	VoulenteerRequestEmail
} from '@programmerbar/email-templates';
import type { CreateEmailOptions, Resend } from 'resend';
import { formatDate, normalDate } from '$lib/utils/date';
import { render } from '@react-email/render';

const PROGRAMMERBAR_EMAIL = 'styret@programmerbar.no';
const FROM_EMAIL = 'ikkesvar@programmer.bar';

export type ContactUsEmailProps = {
	name: string;
	email: string;
	message: string;
};

export type InvitationEmailProps = {
	email: string;
};

export type VolunteerRequestEmailProps = {
	name: string;
	email: string;
};

export type ShiftEmailProps = {
	shift: {
		id: string;
		startAt: string;
		endAt: string;
		startAtFormatted: string;
		endAtFormatted: string;
		summary: string;
		description?: string;
	};
	user: {
		name: string;
		email: string;
	};
};

type IcsShiftEvent = {
	id: string;
	startAt: string;
	endAt: string;
	summary: string;
	description?: string;
};

function createIcsEvent(shift: IcsShiftEvent): string {
	const uid = shift.id;

	const dtstamp = formatDate(new Date().toISOString());
	const dtstart = normalDate(shift.startAt);
	const dtend = normalDate(shift.endAt);

	return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Programmerbar//Shift Notification//EN
BEGIN:VEVENT
UID:${uid}
DTSTAMP:${dtstamp}
DTSTART;TZID=Europe/Oslo:${dtstart}
DTEND;TZID=Europe/Oslo:${dtend}
SUMMARY:${shift.summary}
DESCRIPTION:${shift.description || ''}
END:VEVENT
END:VCALENDAR`;
}

export class EmailService {
	#resend: Resend;

	constructor(resend: Resend) {
		this.#resend = resend;
	}

	async sendContactUsEmail(data: ContactUsEmailProps) {
		await this.sendEmail({
			from: FROM_EMAIL,
			subject: 'Kontaktskjema på hjemmesiden',
			to: [PROGRAMMERBAR_EMAIL],
			react: <ContactUsEmail {...data} />
		});
	}

	async sendInvitaitonEmail(data: InvitationEmailProps) {
		await this.sendEmail({
			from: FROM_EMAIL,
			subject: 'Invitasjon til Programmerbar',
			to: [data.email],
			react: <InvitationEmail email={data.email} />
		});
	}

	async sendVolunteerRequestEmail(data: VolunteerRequestEmailProps) {
		await this.sendEmail({
			from: FROM_EMAIL,
			subject: 'Ny frivillig-søknad',
			to: ['frivilligansvarlig@programmerbar.no'],
			react: <VoulenteerRequestEmail name={data.name} email={data.email} />
		});
	}

	async sendShiftEmail(data: ShiftEmailProps) {
		const icsContent = createIcsEvent(data.shift);

		await this.sendEmail({
			from: FROM_EMAIL,
			subject: 'Du har fått en vakt',
			to: [data.user.email],
			react: <NewShiftEmail shift={data.shift} user={data.user} />,
			attachments: [
				{
					filename: 'shift.ics',
					content: icsContent,
					contentType: 'text/calendar'
				}
			]
		});
	}

	private async sendEmail(payload: CreateEmailOptions) {
		console.log(`[EmailService] ###### SENDING EMAIL ########`);
		console.log(`[EmailService] To: ${payload.to}`);
		console.log(`[EmailService] Subject: ${payload.subject}`);
		console.log(await render(payload.react));
		console.log(`[EmailService] #############################`);

		if (payload.attachments) {
			console.log(`[EmailService] ########### ATTACHMENTS ############`);
			console.log(payload.attachments);
		}

		if (dev) {
			console.log(`[EmailService] Dev mode - email not actually sent`);
			return;
		}

		await this.#resend.emails.send(payload);
		console.log(`[EmailService] ✅ Email sent via Resend`);
	}
}
