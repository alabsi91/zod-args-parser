/** @throws {TypeError} */
export function stringToBoolean(string: string): boolean {
  if (string.toLowerCase() === "true") {
    return true;
  }

  if (string.toLowerCase() === "false") {
    return false;
  }

  throw new TypeError(`Invalid boolean value: ${string}`);
}

/** @throws {TypeError} */
export function stringToNumber(string: string): number {
  const trimmed = string.trim();

  // Reject empty, whitespace-only, or signs without digits
  if (trimmed === "" || trimmed === "+" || trimmed === "-") {
    throw new TypeError(`Invalid number: "${string}"`);
  }

  const result = Number(trimmed);

  // Reject NaN, Infinity, and -Infinity
  if (!Number.isFinite(result)) {
    throw new TypeError(`Invalid number: "${string}"`);
  }

  return result;
}
