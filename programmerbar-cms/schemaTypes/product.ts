import { defineType, defineField } from "sanity";
import { TrolleyIcon } from "@sanity/icons/Trolley";

export default defineType({
	name: "product",
	title: "Produkt",
	type: "document",
	icon: TrolleyIcon,
	fields: [
		defineField({
			name: "sku",
			title: "Frontline ID",
			description: "ID fra Frontline. Gjør at vi kan hente mer informasjon om produktet.",
			type: "string"
		}),
		defineField({
			name: "name",
			title: "Navn",
			type: "string",
			validation: (Rule) => Rule.required()
		}),
		defineField({
			name: "description",
			title: "Beskrivelse",
			type: "text"
		}),
		defineField({
			name: "productType",
			title: "Type",
			type: "array",
			of: [{ type: "reference", to: [{ type: "productType" }] }]
		}),
		defineField({
			name: "isSoldOut",
			title: "Utsolgt",
			type: "boolean",
			validation: (Rule) => Rule.required(),
			options: {
				layout: "switch"
			},
			initialValue: false
		}),
		defineField({
			name: "priceList",
			title: "Prisliste",
			description: "Prisliste for produktet.",
			type: "price",
			validation: (Rule) => Rule.required()
		}),
		defineField({
			name: "volume",
			title: "Volum",
			description: "Volum i liter. F.eks. 0.5 for en halvliter.",
			type: "number",
			validation: (Rule) => Rule.greaterThan(0)
		}),
		defineField({
			name: "alcoholContent",
			title: "Alkoholinnhold",
			description:
				"Alkoholinnhold i prosent. F.eks. 4.7 for 4.7%. Tom om det ikke er alkoholholdig.",
			type: "number"
		}),
		defineField({
			name: "variants",
			title: "Varianter",
			description: "Varianter av smak eller type. Tom for ingen varianter.",
			type: "array",
			of: [{ type: "string" }]
		}),
		defineField({
			name: "image",
			title: "Bilde",
			type: "image"
		}),
		defineField({
			name: "producer",
			title: "Produsent",
			type: "reference",
			to: [{ type: "producer" }]
		})
	],
	preview: {
		select: {
			title: "name",
			subtitle: "producer.name",
			media: "image"
		}
	}
});
