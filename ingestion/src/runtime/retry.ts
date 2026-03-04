type RetryWithBackoffOptions<T> = {
  operation: () => Promise<T>;
  retries?: number;
  baseDelayMs?: number;
  wait?: (delayMs: number) => Promise<void>;
};

function defaultWait(delayMs: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, delayMs);
  });
}

export async function retryWithBackoff<T>(options: RetryWithBackoffOptions<T>): Promise<T> {
  const {
    operation,
    retries = 2,
    baseDelayMs = 100,
    wait = defaultWait
  } = options;

  let attempt = 0;

  while (true) {
    try {
      return await operation();
    } catch (error) {
      if (attempt >= retries) {
        throw error;
      }

      const delayMs = baseDelayMs * 2 ** attempt;
      attempt += 1;
      await wait(delayMs);
    }
  }
}
