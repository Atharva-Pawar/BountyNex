/**
 * BigInt cannot be serialized by JSON.stringify. Amounts stored in wei are
 * BigInt, so we convert them to decimal strings before sending to the client.
 */
export function bigIntToString(value: unknown): unknown {
  if (typeof value === "bigint") return value.toString();
  if (Array.isArray(value)) return value.map(bigIntToString);
  if (value instanceof Date) return value.toISOString();
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) out[k] = bigIntToString(v);
    return out;
  }
  return value;
}

export function safeJson(data: unknown): string {
  return JSON.stringify(bigIntToString(data));
}
