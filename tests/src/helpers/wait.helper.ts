/**
 * Утиліти для очікування — замість хардкоджених setTimeout.
 */

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function retry<T>(
  fn: () => Promise<T>,
  opts: { attempts?: number; delay?: number; condition?: (result: T) => boolean } = {}
): Promise<T> {
  const { attempts = 5, delay = 1000, condition } = opts;

  for (let i = 0; i < attempts; i++) {
    const result = await fn();
    if (!condition || condition(result)) return result;
    if (i < attempts - 1) await sleep(delay);
  }

  return fn();
}
