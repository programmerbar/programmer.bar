import { defineField, defineType } from "sanity";
import { CogIcon } from "@sanity/icons/Cog";

export default defineType({
	name: "producer",
	title: "Produsent",
	type: "document",
	icon: CogIcon,
	fields: [
		defineField({
			name: "name",
			title: "Navn",
			type: "string",
			validation: (Rule) => Rule.required()
		}),
		defineField({
			name: "logo",
			title: "Logo",
			type: "image"
		})
	]
});
