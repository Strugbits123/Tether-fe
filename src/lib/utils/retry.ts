/**
 * Runs an async function, retrying on failure with a fixed backoff schedule.
 * Useful for tolerating a cold-starting backend on first load. Throws the last
 * error if every attempt fails.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  delays: number[] = [2000, 4000, 8000, 15000, 30000],
): Promise<T> {
  let lastError: unknown
  for (let i = 0; i <= delays.length; i++) {
    try {
      return await fn()
    } catch (e) {
      lastError = e
      if (i === delays.length) break
      await new Promise((resolve) => setTimeout(resolve, delays[i]))
    }
  }
  throw lastError
}
