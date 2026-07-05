import assert from "node:assert";
import { rateLimited, recordFailure, clearFailures } from "./rate-limit.ts";

const ip = "1.2.3.4";
const t0 = 1_000_000;

// Not limited before any failures.
assert.equal(rateLimited(ip, t0), false);

// 5 failures still allowed on the 5th check boundary (>= MAX blocks the 6th).
for (let i = 0; i < 5; i++) recordFailure(ip, t0);
assert.equal(rateLimited(ip, t0), true, "locked after 5 failures");

// Window expiry (15 min + 1ms) resets.
assert.equal(rateLimited(ip, t0 + 15 * 60 * 1000 + 1), false, "resets after window");

// Success path clears the counter.
recordFailure(ip, t0);
clearFailures(ip);
assert.equal(rateLimited(ip, t0), false, "cleared on success");

console.log("rate-limit ok");
