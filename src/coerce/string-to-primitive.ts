/** @throws {TypeError} */
export function stringToBoolean(string: string): boolean {
  if (string.toLowerCase() === "true") {
    return true;
  }

  if (string.toLowerCase() === "false") {
    return false;
  }

  throw new TypeError(`invalid boolean value: ${string}`);
}

/**
 * Converts a string to a finite number.
 *
 * @throws {TypeError} If input is empty, invalid, or not a finite number.
 */
export function stringToNumber(value: string): number {
  const input = value.trim();
  if (!/^[-+]?[0-9]+(?:\.[0-9]+)?$/.test(input)) {
    throw new TypeError(`invalid number: "${value}"`);
  }

  const number = Number(input);
  if (!Number.isFinite(number)) {
    throw new TypeError(`invalid number: "${value}"`);
  }

  return number;
}

/**
 * Converts a string to a bigint.
 *
 * @throws {TypeError} If input is empty or not a valid bigint.
 */
export function stringToBigint(value: string): bigint {
  const input = value.trim();
  if (!/^[+-]?[0-9]+$/.test(input)) {
    throw new TypeError(`invalid bigint: "${value}"`);
  }

  try {
    return BigInt(input);
  } catch {
    throw new TypeError(`invalid bigint: "${value}"`);
  }
}

/**
 * Converts a string to a valid Date object.
 *
 * @throws {TypeError} If input is not a valid date string.
 */
export function stringToDate(value: string): Date {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new TypeError(`invalid date: "${value}"`);
  }
  return date;
}
