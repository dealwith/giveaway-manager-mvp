export interface RetryOptions {
	maxRetries?: number;
	delay?: number;
	backoffMultiplier?: number;
	retryableErrors?: string[];
}

export async function retryOperation<T>(
	operation: () => Promise<T>,
	options: RetryOptions = {}
): Promise<T> {
	const {
		maxRetries = 3,
		delay = 1000,
		backoffMultiplier = 2,
		retryableErrors = ["unavailable", "deadline-exceeded", "cancelled"]
	} = options;

	for (let i = 0; i < maxRetries; i++) {
		try {
			return await operation();
		} catch (error: unknown) {
			if (i === maxRetries - 1) throw error;

			const firebaseError = error as { code?: string; message?: string };

			// Check if it's a retryable error
			if (firebaseError.code && retryableErrors.includes(firebaseError.code)) {
				console.warn(
					`Retrying operation (attempt ${i + 1}/${maxRetries}):`,
					firebaseError.message
				);
				await new Promise((resolve) =>
					setTimeout(resolve, delay * Math.pow(backoffMultiplier, i))
				);
				continue;
			}

			throw error;
		}
	}
	throw new Error("Max retries reached");
}
