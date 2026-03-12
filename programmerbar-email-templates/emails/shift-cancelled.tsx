import { Body, Container, Head, Html, Text, Tailwind } from "@react-email/components";
import { z } from "zod";

export const ShiftCancelledEmailSchema = z.object({
	event: z.object({
		name: z.string(),
		date: z.string()
	}),
	user: z.object({
		name: z.string(),
		email: z.email()
	})
});

export type ShiftCancelledEmailSchemaType = z.infer<typeof ShiftCancelledEmailSchema>;

export function ShiftCancelledEmail({ event, user }: ShiftCancelledEmailSchemaType) {
	return (
		<Html>
			<Head />
			<Tailwind>
				<Body className="mx-auto my-auto bg-white px-2 font-sans">
					<Container className="mx-auto my-[40px] max-w-[465px] rounded border border-solid border-[#eaeaea] p-[20px]">
						<Text className="text-center text-2xl font-medium">
							Hei {user.name}, arrangementet er avlyst!
						</Text>

						<Text className="mt-4">
							Arrangementet <strong>{event.name}</strong> ({event.date}) er blitt slettet, og vakten
							din er derfor også avlyst.
						</Text>

						<Text className="mt-4">Ta kontakt med styret hvis du har spørsmål.</Text>
					</Container>
				</Body>
			</Tailwind>
		</Html>
	);
}

ShiftCancelledEmail.PreviewProps = {
	event: {
		name: "Programmerbar fredagsåpent",
		date: "fredag 14. mars 2026"
	},
	user: {
		name: "Ola Nordmann",
		email: "ola.nordmann@example.com"
	}
} as ShiftCancelledEmailSchemaType;
