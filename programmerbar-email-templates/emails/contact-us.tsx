import { Body, Container, Head, Html, Text, Tailwind } from "@react-email/components";
import { z } from "zod";

export const ContactUsEmailSchema = z.object({
	name: z.string().min(1, "Name is required"),
	email: z.email("Invalid email address"),
	message: z.string().min(1, "Message is required")
});

export type ContactUsEmailSchemaType = z.infer<typeof ContactUsEmailSchema>;

export function ContactUsEmail({ name, email, message }: ContactUsEmailSchemaType) {
	return (
		<Html>
			<Head />
			<Tailwind>
				<Body className="mx-auto my-auto bg-white px-2 font-sans">
					<Container className="mx-auto my-[40px] max-w-[465px] rounded border border-solid border-[#eaeaea] p-[20px]">
						<Text>Navn: {name}</Text>
						<Text>E-post: {email}</Text>
						<Text>Melding: {message}</Text>
					</Container>
				</Body>
			</Tailwind>
		</Html>
	);
}

ContactUsEmail.PreviewProps = {
	name: "Ola Nordmann",
	email: "ola.nordmann@echo.uib.no",
	message: "Hei, jeg vil gjerne ha kontakt med dere."
} as ContactUsEmailSchemaType;
