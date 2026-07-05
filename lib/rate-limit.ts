// ponytail: in-memory, resets on redeploy; move to DB/redis if multi-instance
const MAX_FAILURES = 5;
const WINDOW_MS = 15 * 60 * 1000;
const failures = new Map<string, { count: number; resetAt: number }>();

export function rateLimited(key: string, now = Date.now()) {
  const entry = failures.get(key);
  if (!entry || now > entry.resetAt) return false;
  return entry.count >= MAX_FAILURES;
}

export function recordFailure(key: string, now = Date.now()) {
  const entry = failures.get(key);
  if (!entry || now > entry.resetAt) {
    failures.set(key, { count: 1, resetAt: now + WINDOW_MS });
  } else {
    entry.count += 1;
  }
}

export function clearFailures(key: string) {
  failures.delete(key);
}
