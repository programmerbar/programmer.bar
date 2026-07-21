import { Body, Container, Head, Html, Text, Tailwind, Link } from "@react-email/components";
import { z } from "zod";

export const InvitationEmailSchema = z.object({
	email: z.email()
});

export type InvitationEmailSchemaType = z.infer<typeof InvitationEmailSchema>;

export function InvitationEmail({ email }: InvitationEmailSchemaType) {
	return (
		<Html>
			<Head />
			<Tailwind>
				<Body className="mx-auto my-auto bg-white px-2 font-sans">
					<Container className="mx-auto my-[40px] max-w-[465px] rounded border border-solid border-[#eaeaea] p-[20px]">
						<Text className="text-center text-2xl font-medium">Velkommen til Programmerbar</Text>

						<Text>
							Du kan nå lage bruker på <Link href="https://programmer.bar">programmer.bar</Link>!
							For å registrere din bruker, logg inn med følgende e-post: {email}.
						</Text>

						<Link
							className="mx-auto w-full rounded-lg bg-blue-500 p-2 text-center text-white"
							href="https://programmer.bar/logg-inn"
						>
							Logg inn her
						</Link>

						<Text className="text-sm text-gray-500">
							Om du ikke registrerer deg innen 7 dager, vil invitasjonen utløpe.
						</Text>
					</Container>
				</Body>
			</Tailwind>
		</Html>
	);
}

InvitationEmail.PreviewProps = {
	email: "ola.nordmann@echo.uib.no"
} as InvitationEmailSchemaType;
