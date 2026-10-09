import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';
import { describe, expect, it, vi } from 'vitest';

const worker = ts.transpileModule(
	readFileSync(new URL('../service-worker.ts', import.meta.url), 'utf8'),
	{ compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ESNext } }
).outputText;

function setup() {
	const listeners = new Map<
		string,
		(event: { request: Request; respondWith: ReturnType<typeof vi.fn> }) => void
	>();
	const match = vi.fn().mockResolvedValue(undefined);
	const open = vi.fn().mockResolvedValue({ match });
	const fetch = vi.fn().mockResolvedValue(new Response('network'));
	runInNewContext(worker, {
		exports: {},
		require: () => ({
			build: ['/_app/immutable/app.js'],
			files: ['/favicon.ico'],
			version: 'test'
		}),
		self: {
			location: { origin: 'https://programmer.bar' },
			addEventListener: (
				name: string,
				listener: (event: { request: Request; respondWith: ReturnType<typeof vi.fn> }) => void
			) => listeners.set(name, listener)
		},
		caches: { open },
		fetch,
		URL
	});
	function request(path: string, method = 'GET') {
		const respondWith = vi.fn();
		listeners.get('fetch')!({
			request: new Request(new URL(path, 'https://programmer.bar'), { method }),
			respondWith
		});
		return respondWith;
	}
	return { request, match, open, fetch };
}

describe('service worker requests', () => {
	it.each([
		'/portal/fravaer',
		'/portal/admin/vaktoversikt',
		'/portal/fravaer/__data.json',
		'/api/status',
		'/@vite/client',
		'/src/routes/+layout.svelte',
		'https://other.example/_app/immutable/app.js'
	])('leaves %s to the browser without serving stale cached data', (path) => {
		const { request, open, fetch } = setup();
		expect(request(path)).not.toHaveBeenCalled();
		expect(open).not.toHaveBeenCalled();
		expect(fetch).not.toHaveBeenCalled();
	});
	it('does not intercept form submissions', () => {
		expect(setup().request('/portal/fravaer?/recurring', 'POST')).not.toHaveBeenCalled();
	});
	it('serves a cached build asset without a network request', async () => {
		const { request, match, fetch } = setup();
		const cached = new Response('cached');
		match.mockResolvedValue(cached);
		const response = await request('/_app/immutable/app.js').mock.calls[0][0];
		expect(response).toBe(cached);
		expect(fetch).not.toHaveBeenCalled();
	});
	it('loads a missing asset from the network', async () => {
		const { request, fetch } = setup();
		const response = await request('/_app/immutable/app.js').mock.calls[0][0];
		expect(await response.text()).toBe('network');
		expect(fetch).toHaveBeenCalledOnce();
	});
	it('still loads JavaScript when cache storage fails', async () => {
		const { request, open } = setup();
		open.mockRejectedValue(new Error('Storage unavailable'));
		const response = await request('/_app/immutable/app.js').mock.calls[0][0];
		expect(await response.text()).toBe('network');
	});
});
