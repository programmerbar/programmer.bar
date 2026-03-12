import { Body, Container, Head, Html, Text, Tailwind, Heading } from "@react-email/components";
import { z } from "zod";

export const VoulenteerRequestEmailSchema = z.object({
	email: z.email("Invalid email address"),
	name: z.string().min(1, "Name is required")
});

export type VoulenteerEmailSchemaType = z.infer<typeof VoulenteerRequestEmailSchema>;

export function VoulenteerRequestEmail({ email, name }: VoulenteerEmailSchemaType) {
	return (
		<Html>
			<Head />
			<Tailwind>
				<Body className="mx-auto my-auto bg-white px-2 font-sans">
					<Container className="mx-auto my-[40px] max-w-[465px] rounded border border-solid border-[#eaeaea] p-[20px]">
						<Heading>Ny frivillig-søknad</Heading>

						<Text>En ny person har søkt om å bli frivillig hos Programmerbar:</Text>
						<Container>
							<Text>Navn: {name}</Text>
							<Text>E-post: {email}</Text>
						</Container>
						<p>Brukeren har blitt lagt til i databasen og kan nå logge inn med Feide.</p>
					</Container>
				</Body>
			</Tailwind>
		</Html>
	);
}

VoulenteerRequestEmail.PreviewProps = {
	name: "Ola Nordmann",
	email: "ola.nordmann@uib.no"
} as VoulenteerEmailSchemaType;
