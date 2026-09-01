import devtoolsJson from 'vite-plugin-devtools-json';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import mkcert from 'vite-plugin-mkcert';

export default defineConfig(() => ({
	plugins: [sveltekit(), tailwindcss(), mkcert(), devtoolsJson()],
	resolve: {
		alias: { 'react-dom/server': 'react-dom/server.edge' }
	}
}));
