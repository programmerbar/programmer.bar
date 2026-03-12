import { Body, Container, Head, Html, Text, Tailwind } from "@react-email/components";
import { z } from "zod";

export const NewShiftEmailSchema = z.object({
	shift: z.object({
		id: z.string(), // Not used in the email, but can be useful for ICS generation
		startAt: z.string(),
		endAt: z.string(),
		startAtFormatted: z.string(),
		endAtFormatted: z.string(),
		summary: z.string(),
		description: z.string().optional()
	}),
	user: z.object({
		name: z.string(),
		email: z.email()
	})
});

export type NewShiftEmailSchemaType = z.infer<typeof NewShiftEmailSchema>;

export function NewShiftEmail({ shift, user }: NewShiftEmailSchemaType) {
	return (
		<Html>
			<Head />
			<Tailwind>
				<Body className="mx-auto my-auto bg-white px-2 font-sans">
					<Container className="mx-auto my-[40px] max-w-[465px] rounded border border-solid border-[#eaeaea] p-[20px]">
						<Text className="text-center text-2xl font-medium">
							Hei {user.name}, du har fått en ny vakt!
						</Text>

						<Text className="mt-4">Du har blitt tildelt en vakt med følgende detaljer:</Text>

						<Text className="mt-2">
							<strong>Fra:</strong> {shift.startAtFormatted}
						</Text>

						<Text className="mt-1">
							<strong>Til:</strong> {shift.endAtFormatted}
						</Text>

						{shift.description && (
							<Text className="mt-2">
								<strong>Beskrivelse:</strong> {shift.description}
							</Text>
						)}

						<Text className="mt-4">Kalenderinvitasjonen er vedlagt denne e-posten.</Text>
					</Container>
				</Body>
			</Tailwind>
		</Html>
	);
}

NewShiftEmail.PreviewProps = {
	shift: {
		startAt: new Date().toISOString(),
		endAt: new Date(Date.now() + 3600000).toISOString(),
		summary: "Vakt for programmerbar fredagsåpent",
		description: "Programmerbar."
	},
	user: {
		name: "Ola Nordmann",
		email: "ola.nordmann@example.com"
	}
} as NewShiftEmailSchemaType;
