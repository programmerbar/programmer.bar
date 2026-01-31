import type {
	GET_PRODUCT_BY_ID_QUERYResult,
	GET_PRODUCTS_QUERYResult
} from '@programmerbar/cms/types';
import { sanityClient } from './client';
import { GET_PRODUCTS_QUERY, GET_PRODUCT_BY_ID_QUERY } from '@programmerbar/cms/queries';
import { type SanityImageSource, createImageUrlBuilder } from '@sanity/image-url';

const builder = createImageUrlBuilder(sanityClient);

export type Image = SanityImageSource;

export const urlFor = (source: Image) => {
	return builder.image(source);
};

export async function getProducts() {
	return await sanityClient.fetch<GET_PRODUCTS_QUERYResult>(GET_PRODUCTS_QUERY);
}

export async function getProductById(id: string) {
	return await sanityClient.fetch<GET_PRODUCT_BY_ID_QUERYResult>(GET_PRODUCT_BY_ID_QUERY, { id });
}
