import { building } from '$app/environment';
import type { RequestEvent } from '@sveltejs/kit';

export interface RateLimitConfig {
	/**
	 * Maximum number of requests allowed within the window
	 */
	maxRequests: number;
	/**
	 * Time window in seconds
	 */
	windowSeconds: number;
	/**
	 * How long to block the IP after exceeding the limit (in seconds)
	 */
	blockDurationSeconds?: number;
}

export interface RateLimitResult {
	allowed: boolean;
	remaining: number;
	resetAt: Date;
	retryAfter?: number;
}

export class RateLimitService {
	#kv: KVNamespace;

	constructor(kv: KVNamespace) {
		this.#kv = kv;
	}

	private getIp(event: RequestEvent): string | null {
		try {
			return event.getClientAddress();
		} catch {
			console.warn('[RateLimitService] Could not get client IP address');
			return null;
		}
	}

	/**
	 * Check if a request is allowed based on rate limiting rules
	 * Uses a sliding window counter stored in KV
	 */
	async checkLimit(
		event: RequestEvent,
		key: string,
		config: RateLimitConfig
	): Promise<RateLimitResult> {
		if (building) {
			return {
				allowed: true,
				remaining: config.maxRequests,
				resetAt: new Date(Date.now() + config.windowSeconds * 1000)
			};
		}

		const ip = this.getIp(event);
		if (!ip) {
			// If we can't get IP, allow the request but log it
			console.warn('[RateLimitService] No IP address, allowing request');
			return {
				allowed: true,
				remaining: config.maxRequests,
				resetAt: new Date(Date.now() + config.windowSeconds * 1000)
			};
		}

		const rateLimitKey = `ratelimit:${key}:${ip}`;
		const blockKey = `ratelimit:block:${key}:${ip}`;

		// Check if IP is currently blocked
		const blocked = await this.#kv.get(blockKey);
		if (blocked) {
			const blockExpiry = parseInt(blocked, 10);
			const now = Date.now();
			if (blockExpiry > now) {
				const retryAfter = Math.ceil((blockExpiry - now) / 1000);
				console.log(
					`[RateLimitService] 🚫 IP ${ip} is blocked for ${key}. Retry after ${retryAfter}s`
				);
				return {
					allowed: false,
					remaining: 0,
					resetAt: new Date(blockExpiry),
					retryAfter
				};
			}
		}

		// Get current request count
		const current = await this.#kv.get(rateLimitKey);
		const count = current ? parseInt(current, 10) : 0;

		const now = Date.now();
		const resetAt = new Date(now + config.windowSeconds * 1000);

		// Check if limit exceeded
		if (count >= config.maxRequests) {
			// Block the IP if blockDurationSeconds is specified
			if (config.blockDurationSeconds) {
				const blockUntil = now + config.blockDurationSeconds * 1000;
				await this.#kv.put(blockKey, blockUntil.toString(), {
					expirationTtl: config.blockDurationSeconds
				});
				console.log(
					`[RateLimitService] 🚫 Rate limit exceeded for ${key} from IP ${ip}. Blocked for ${config.blockDurationSeconds}s`
				);
				return {
					allowed: false,
					remaining: 0,
					resetAt: new Date(blockUntil),
					retryAfter: config.blockDurationSeconds
				};
			}

			console.log(`[RateLimitService] 🚫 Rate limit exceeded for ${key} from IP ${ip}`);
			return {
				allowed: false,
				remaining: 0,
				resetAt
			};
		}

		// Increment counter
		const newCount = count + 1;
		await this.#kv.put(rateLimitKey, newCount.toString(), {
			expirationTtl: config.windowSeconds
		});

		const remaining = Math.max(0, config.maxRequests - newCount);

		console.log(
			`[RateLimitService] ✅ Request allowed for ${key} from IP ${ip}. ${remaining} remaining`
		);

		return {
			allowed: true,
			remaining,
			resetAt
		};
	}

	/**
	 * Manually reset rate limit for an IP and key
	 */
	async resetLimit(event: RequestEvent, key: string): Promise<void> {
		const ip = this.getIp(event);
		if (!ip) return;

		const rateLimitKey = `ratelimit:${key}:${ip}`;
		const blockKey = `ratelimit:block:${key}:${ip}`;

		await this.#kv.delete(rateLimitKey);
		await this.#kv.delete(blockKey);

		console.log(`[RateLimitService] 🔄 Rate limit reset for ${key} from IP ${ip}`);
	}

	/**
	 * Get current rate limit status without incrementing
	 */
	async getStatus(
		event: RequestEvent,
		key: string,
		config: RateLimitConfig
	): Promise<{
		count: number;
		remaining: number;
		isBlocked: boolean;
	}> {
		if (building) {
			return {
				count: 0,
				remaining: config.maxRequests,
				isBlocked: false
			};
		}

		const ip = this.getIp(event);
		if (!ip) {
			return {
				count: 0,
				remaining: config.maxRequests,
				isBlocked: false
			};
		}

		const rateLimitKey = `ratelimit:${key}:${ip}`;
		const blockKey = `ratelimit:block:${key}:${ip}`;

		// Check if blocked
		const blocked = await this.#kv.get(blockKey);
		const isBlocked = blocked !== null && parseInt(blocked, 10) > Date.now();

		// Get count
		const current = await this.#kv.get(rateLimitKey);
		const count = current ? parseInt(current, 10) : 0;
		const remaining = Math.max(0, config.maxRequests - count);

		return {
			count,
			remaining,
			isBlocked
		};
	}
}
