const MAGIC_LINK_TTL_SECONDS = 15 * 60;
const MAGIC_LINK_KEY_PREFIX = 'magic-link:';

export class MagicLinkService {
	#kv: KVNamespace;

	constructor(kv: KVNamespace) {
		this.#kv = kv;
	}

	async create(userId: string): Promise<string> {
		const token = crypto.randomUUID() + crypto.randomUUID();
		await this.#kv.put(`${MAGIC_LINK_KEY_PREFIX}${token}`, userId, {
			expirationTtl: MAGIC_LINK_TTL_SECONDS
		});
		return token;
	}

	async consume(token: string): Promise<string | null> {
		const key = `${MAGIC_LINK_KEY_PREFIX}${token}`;
		const userId = await this.#kv.get(key);
		if (!userId) return null;

		await this.#kv.delete(key);
		return userId;
	}
}
