import z from 'zod';

export const STATUS_KEY = 'status';

export const STATUS = {
	CLOSED: 0,
	OPEN: 1,
	PRIVATE: 2
} as const;

export class StatusService {
	#kv: KVNamespace;

	constructor(kv: KVNamespace) {
		this.#kv = kv;
	}

	async get() {
		return Number(await this.#kv.get(STATUS_KEY));
	}

	async set(status: number) {
		await this.#kv.put(STATUS_KEY, String(status));
	}

	async getWithMessage() {
		const status = await this.get();
		return {
			code: status,
			message: StatusService.getMessage(status)
		};
	}

	static getMessage(status: number) {
		switch (status) {
			case STATUS.CLOSED:
				return 'Baren er nå stengt! 🚪';
			case STATUS.OPEN:
				return 'Baren er nå åpen! 🍻';
			case STATUS.PRIVATE:
				return 'Lukket arrangement. 🎉';
			default:
				return 'Ukjent status.';
		}
	}

	static validateStatus(json: unknown) {
		return z
			.object({
				status: z.number().int().min(0).max(2)
			})
			.safeParse(json);
	}
}
