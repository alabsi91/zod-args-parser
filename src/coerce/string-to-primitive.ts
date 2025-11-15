import { CliError, ErrorCause, ValidationErrorCode } from "../utilities/cli-error.ts";

/** @throws {CliError} */
export function stringToBoolean(string: string): boolean {
  if (string.toLowerCase() === "true") {
    return true;
  }

  if (string.toLowerCase() === "false") {
    return false;
  }

  throw new CliError({
    cause: ErrorCause.Validation,
    code: ValidationErrorCode.CoercionFailed,
    context: { coerceToType: "boolean", providedValue: string },
  });
}

/**
 * Converts a string to a finite number.
 *
 * @throws {CliError} If input is empty, invalid, or not a finite number.
 */
export function stringToNumber(value: string): number {
  const input = value.trim();
  if (!/^[-+]?[0-9]+(?:\.[0-9]+)?$/.test(input)) {
    throw new CliError({
      cause: ErrorCause.Validation,
      code: ValidationErrorCode.CoercionFailed,
      context: { coerceToType: "number", providedValue: value },
    });
  }

  const number = Number(input);
  if (!Number.isFinite(number)) {
    throw new CliError({
      cause: ErrorCause.Validation,
      code: ValidationErrorCode.CoercionFailed,
      context: { coerceToType: "number", providedValue: value },
    });
  }

  return number;
}

/**
 * Converts a string to a bigint.
 *
 * @throws {CliError} If input is empty or not a valid bigint.
 */
export function stringToBigint(value: string): bigint {
  const input = value.trim();
  if (!/^[+-]?[0-9]+$/.test(input)) {
    throw new CliError({
      cause: ErrorCause.Validation,
      code: ValidationErrorCode.CoercionFailed,
      context: { coerceToType: "bigint", providedValue: value },
    });
  }

  try {
    return BigInt(input);
  } catch {
    throw new CliError({
      cause: ErrorCause.Validation,
      code: ValidationErrorCode.CoercionFailed,
      context: { coerceToType: "bigint", providedValue: value },
    });
  }
}

/**
 * Converts a string to a valid Date object.
 *
 * @throws {CliError} If input is not a valid date string.
 */
export function stringToDate(value: string): Date {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new CliError({
      cause: ErrorCause.Validation,
      code: ValidationErrorCode.CoercionFailed,
      context: { coerceToType: "date", providedValue: value },
    });
  }
  return date;
}
