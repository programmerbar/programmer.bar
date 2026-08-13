import { defineType, defineField } from "sanity";
import { HashIcon } from "@sanity/icons/Hash";

export default defineType({
	name: "productType",
	title: "Produkttype",
	type: "document",
	icon: HashIcon,
	fields: [
		defineField({
			name: "title",
			title: "Tittel",
			type: "string",
			validation: (Rule) => Rule.required()
		})
	]
});
