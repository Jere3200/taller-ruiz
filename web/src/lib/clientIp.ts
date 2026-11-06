/**
 * Visitor address from X-Forwarded-For. Each trusted proxy appends the address it received the request from,
 * so the visitor is the Nth entry counting from the right, where N is how many trusted proxies sit in front.
 * Entries further left are whatever the visitor chose to send and must never be trusted.
 * With no trusted proxy the header is ignored entirely.
 */
export function clientIpFromForwarded(header: string | null | undefined, trustedHops: number): string | undefined {
  if (trustedHops < 1 || !header) return undefined;
  const entries = header
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
  return entries.at(-trustedHops);
}

/** Reads TRUSTED_PROXY_HOPS. Anything that is not a non-negative integer counts as 0 (trust nothing). */
export function trustedHopsFromEnv(value: string | undefined): number {
  if (value === undefined || !/^\d+$/.test(value)) return 0;
  return Number(value);
}
