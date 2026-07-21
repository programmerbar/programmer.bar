import { dev } from '$app/environment';
import {
	InvitationEmail,
	NewShiftEmail,
	ShiftCancelledEmail,
	VoulenteerRequestEmail
} from '@programmerbar/email-templates';
import { formatDate, normalDate } from '$lib/utils/date';
import { render } from '@react-email/render';
import { env } from '$env/dynamic/private';

const FROM_EMAIL = 'ikkesvar@programmer.bar';

type SendEmailPayload = Parameters<SendEmail['send']>[number];

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

export type ShiftCancelledEmailProps = {
	event: {
		name: string;
		date: string;
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
	#sendEmail: SendEmail;

	constructor(sendEmail: SendEmail) {
		this.#sendEmail = sendEmail;
	}

	async sendContactUsSlackMessage(data: ContactUsEmailProps) {
		const blocks = [
			{
				type: 'header',
				text: {
					type: 'plain_text',
					text: '📬 Ny kontaktskjema-henvendelse',
					emoji: true
				}
			},
			{
				type: 'section',
				fields: [
					{
						type: 'mrkdwn',
						text: `*Navn:*\n${data.name}`
					},
					{
						type: 'mrkdwn',
						text: `*E-post:*\n${data.email}`
					}
				]
			},
			{
				type: 'divider'
			},
			{
				type: 'section',
				text: {
					type: 'mrkdwn',
					text: `*Melding:*\n${data.message}`
				}
			},
			{
				type: 'context',
				elements: [
					{
						type: 'mrkdwn',
						text: `Mottatt: <!date^${Math.floor(Date.now() / 1000)}^{date_num} {time_secs}|${new Date().toISOString()}>`
					}
				]
			}
		];

		if (!env.SLACK_WEBHOOK_URL) {
			console.error('SLACK_WEBHOOK_URL is not defined');
			return;
		}

		if (dev) {
			console.log('Dev environment detected, skipping Slack webhook post.');
			console.log(JSON.stringify({ blocks }, null, 2));
			return;
		}

		await fetch(env.SLACK_WEBHOOK_URL, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ blocks })
		});
	}

	async sendInvitaitonEmail(data: InvitationEmailProps) {
		await this.sendEmail({
			from: FROM_EMAIL,
			subject: 'Invitasjon til Programmerbar',
			to: [data.email],
			html: await render(<InvitationEmail email={data.email} />)
		});
	}

	async sendVolunteerRequestEmail(data: VolunteerRequestEmailProps) {
		await this.sendEmail({
			from: FROM_EMAIL,
			subject: 'Ny frivillig-søknad',
			to: ['frivilligansvarlig@programmerbar.no'],
			html: await render(<VoulenteerRequestEmail name={data.name} email={data.email} />)
		});
	}

	async sendShiftEmail(data: ShiftEmailProps) {
		const icsContent = createIcsEvent(data.shift);

		await this.sendEmail({
			from: FROM_EMAIL,
			subject: 'Du har fått en vakt',
			to: [data.user.email],
			html: await render(<NewShiftEmail shift={data.shift} user={data.user} />),
			attachments: [
				{
					filename: 'shift.ics',
					content: icsContent,
					disposition: 'attachment',
					type: 'text/calendar'
				}
			]
		});
	}

	async sendShiftCancelledEmail(data: ShiftCancelledEmailProps) {
		await this.sendEmail({
			from: FROM_EMAIL,
			subject: `Arrangementet "${data.event.name}" er avlyst`,
			to: [data.user.email],
			html: await render(<ShiftCancelledEmail event={data.event} user={data.user} />)
		});
	}

	private async sendEmail(payload: SendEmailPayload) {
		console.log(`[EmailService] ###### SENDING EMAIL ########`);
		console.log(`[EmailService] To: ${payload.to}`);
		console.log(`[EmailService] Subject: ${payload.subject}`);
		console.log(payload.html);
		console.log(`[EmailService] #############################`);

		if (payload.attachments) {
			console.log(`[EmailService] ########### ATTACHMENTS ############`);
			console.log(payload.attachments);
		}

		if (dev) {
			console.log(`[EmailService] Dev mode - email not actually sent`);
			return;
		}

		await this.#sendEmail.send(payload);
		console.log(`[EmailService] ✅ Email sent via Cloudflare`);
	}
}
