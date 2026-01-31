import { env } from '$env/dynamic/private';

export const validateTurnstile = async (
	token: FormDataEntryValue | null,
	remoteip: string
): Promise<{ success: boolean; 'error-codes'?: string[] }> => {
	if (!token) {
		return { success: false, 'error-codes': ['missing-input-response'] };
	}

	const formData = new FormData();
	formData.append('secret', env.CLOUDFLARE_TURNSTILE_SITE_SECRET!);
	formData.append('response', token);
	formData.append('remoteip', remoteip);

	try {
		const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
			method: 'POST',
			body: formData
		});

		const result = (await response.json()) as { success: boolean; 'error-codes'?: string[] };
		return result;
	} catch (error) {
		console.error('Turnstile validation error:', error);
		return { success: false, 'error-codes': ['internal-error'] };
	}
};
