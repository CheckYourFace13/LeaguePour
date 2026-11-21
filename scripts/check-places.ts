/**
 * Offline checks for the Google venue lookup helpers (no network, no API key).
 *
 *   npx tsx scripts/check-places.ts
 */
import assert from "node:assert/strict";
import { addressFromComponents, cleanSessionToken } from "../src/lib/google-places";
import { rateLimit } from "../src/lib/rate-limit";

let n = 0;
const check = (name: string, fn: () => void) => {
  fn();
  n++;
  console.log("ok -", name);
};

check("US address components", () => {
  const a = addressFromComponents([
    { longText: "425", types: ["street_number"] },
    { longText: "Lafayette Street", shortText: "Lafayette St", types: ["route"] },
    { longText: "New York", types: ["locality", "political"] },
    { longText: "New York", shortText: "NY", types: ["administrative_area_level_1"] },
    { longText: "United States", shortText: "US", types: ["country"] },
    { longText: "10003", types: ["postal_code"] },
  ]);
  assert.deepEqual(a, { addressLine1: "425 Lafayette Street", city: "New York", region: "NY", postalCode: "10003", countryCode: "US" });
});

check("UK address uses postal_town and number-first street", () => {
  const a = addressFromComponents([
    { longText: "12", types: ["street_number"] },
    { longText: "Brewer Street", types: ["route"] },
    { longText: "London", types: ["postal_town"] },
    { longText: "England", shortText: "England", types: ["administrative_area_level_1"] },
    { longText: "United Kingdom", shortText: "GB", types: ["country"] },
    { longText: "W1F 0SG", types: ["postal_code"] },
  ]);
  assert.equal(a.addressLine1, "12 Brewer Street");
  assert.equal(a.city, "London");
  assert.equal(a.countryCode, "GB");
});

check("German address puts the number after the street", () => {
  const a = addressFromComponents([
    { longText: "5", types: ["street_number"] },
    { longText: "Hauptstraße", types: ["route"] },
    { longText: "Berlin", types: ["locality"] },
    { longText: "Germany", shortText: "DE", types: ["country"] },
  ]);
  assert.equal(a.addressLine1, "Hauptstraße 5");
  assert.equal(a.region, null);
});

check("missing components degrade to nulls", () => {
  assert.deepEqual(addressFromComponents([]), { addressLine1: null, city: null, region: null, postalCode: null, countryCode: null });
});

check("session tokens are validated", () => {
  assert.equal(cleanSessionToken("0123456789abcdef0123456789abcdef"), "0123456789abcdef0123456789abcdef");
  assert.equal(cleanSessionToken("short"), undefined);
  assert.equal(cleanSessionToken("has spaces in it!!"), undefined);
  assert.equal(cleanSessionToken("x".repeat(40)), undefined);
  assert.equal(cleanSessionToken(null), undefined);
});

check("rate limiter blocks after the limit and resets after the window", () => {
  const t0 = 1_000_000;
  for (let i = 0; i < 3; i++) assert.equal(rateLimit("t:key", 3, 1000, t0 + i).ok, true);
  const blocked = rateLimit("t:key", 3, 1000, t0 + 10);
  assert.equal(blocked.ok, false);
  assert.ok(blocked.retryAfterSec >= 1);
  assert.equal(rateLimit("t:key", 3, 1000, t0 + 1001).ok, true);
  assert.equal(rateLimit("t:other", 3, 1000, t0 + 10).ok, true);
});

console.log(`\n${n} places checks passed`);
