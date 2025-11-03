import { defaultValueAndIsOptional, validateSync } from "./schema-utilities.ts";

import type { StandardSchemaV1 } from "@standard-schema/spec";

export const coerce = {
  string<T extends StandardSchemaV1>(schema: StandardSchemaV1.InferOutput<T> extends string | undefined ? T : never) {
    const { defaultValue, isOptional } = defaultValueAndIsOptional(schema);

    return {
      schema,
      defaultValue,
      isOptional,
      validate: (value?: string) => validateSync(schema, value),
    };
  },

  boolean<T extends StandardSchemaV1>(schema: StandardSchemaV1.InferOutput<T> extends boolean | undefined ? T : never) {
    const { defaultValue, isOptional } = defaultValueAndIsOptional(schema);

    return {
      schema,
      defaultValue,
      isOptional,
      isBoolean: true,
      validate: (value?: string) => validateSync(schema, value && stringToBoolean(value)),
    };
  },

  number<T extends StandardSchemaV1>(schema: StandardSchemaV1.InferOutput<T> extends number | undefined ? T : never) {
    const { defaultValue, isOptional } = defaultValueAndIsOptional(schema);

    return {
      schema,
      defaultValue,
      isOptional,
      validate: (value?: string) => validateSync(schema, value && stringToNumber(value)),
    };
  },

  /** @param separator- The separator to use to split the string. **Default** is `","` */
  arrayOfStrings<T extends StandardSchemaV1>(
    schema: StandardSchemaV1.InferOutput<T> extends string[] | undefined ? T : never,
    separator?: string,
  ) {
    const { defaultValue, isOptional } = defaultValueAndIsOptional(schema);

    return {
      schema,
      defaultValue,
      isOptional,
      validate: (value?: string) => validateSync(schema, value && stringToArrayOfStrings(value, separator)),
    };
  },

  /** @param separator- The separator to use to split the string. **Default** is `","` */
  arrayOfNumbers<T extends StandardSchemaV1>(
    schema: StandardSchemaV1.InferOutput<T> extends number[] | undefined ? T : never,
    separator?: string,
  ) {
    const { defaultValue, isOptional } = defaultValueAndIsOptional(schema);

    return {
      schema,
      defaultValue,
      isOptional,
      validate: (value?: string) => validateSync(schema, value && stringToArrayOfNumbers(value, separator)),
    };
  },

  /** @param separator- The separator to use to split the string. **Default** is `","` */
  arrayOfBooleans<T extends StandardSchemaV1>(
    schema: StandardSchemaV1.InferOutput<T> extends boolean[] | undefined ? T : never,
    separator?: string,
  ) {
    const { defaultValue, isOptional } = defaultValueAndIsOptional(schema);

    return {
      schema,
      defaultValue,
      isOptional,
      validate: (value?: string) => validateSync(schema, value && stringToArrayOfBooleans(value, separator)),
    };
  },

  /** @param separator- The separator to use to split the string. **Default** is `","` */
  setOfStrings<T extends StandardSchemaV1>(
    schema: StandardSchemaV1.InferOutput<T> extends Set<string> | undefined ? T : never,
    separator?: string,
  ) {
    const { defaultValue, isOptional } = defaultValueAndIsOptional(schema);

    return {
      schema,
      defaultValue,
      isOptional,
      validate: (value?: string) => validateSync(schema, value && stringToSetOfStrings(value, separator)),
    };
  },

  /** @param separator- The separator to use to split the string. **Default** is `","` */
  setOfNumbers<T extends StandardSchemaV1>(
    schema: StandardSchemaV1.InferOutput<T> extends Set<number> | undefined ? T : never,
    separator?: string,
  ) {
    const { defaultValue, isOptional } = defaultValueAndIsOptional(schema);

    return {
      schema,
      defaultValue,
      isOptional,
      validate: (value?: string) => validateSync(schema, value && stringToSetOfNumbers(value, separator)),
    };
  },

  /** @param separator- The separator to use to split the string. **Default** is `","` */
  stringToSetOfBooleans<T extends StandardSchemaV1>(
    schema: StandardSchemaV1.InferOutput<T> extends Set<boolean> | undefined ? T : never,
    separator?: string,
  ) {
    const { defaultValue, isOptional } = defaultValueAndIsOptional(schema);

    return {
      schema,
      defaultValue,
      isOptional,
      validate: (value?: string) => validateSync(schema, value && stringToSetOfBooleans(value, separator)),
    };
  },

  json<T extends StandardSchemaV1>(schema: T) {
    const { defaultValue, isOptional } = defaultValueAndIsOptional(schema);

    return {
      schema,
      defaultValue,
      isOptional,
      validate: (value?: string) => validateSync(schema, value && JSON.parse(value)),
    };
  },

  custom<T extends StandardSchemaV1>(schema: T, coerceHandler: (value: string) => StandardSchemaV1.InferOutput<T>) {
    const { defaultValue, isOptional } = defaultValueAndIsOptional(schema);

    return {
      schema,
      defaultValue,
      isOptional,
      validate: (value?: string) => validateSync(schema, value && coerceHandler(value)),
    };
  },
};

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

/** @throws {TypeError} */
export function stringToBoolean(string: string): boolean {
  if (string.toLowerCase() === "true") {
    return true;
  }

  if (string.toLowerCase() === "false") {
    return false;
  }

  throw new TypeError(`Invalid boolean value: ${string}`, { cause: "zod-args-parser" });
}

export function stringToArrayOfStrings(stringValue: string, separator: string = ","): string[] {
  return stringValue
    .split(separator)
    .map(s => s.trim())
    .filter(Boolean);
}

/** @throws {TypeError} - Because of `stringToNumber` */
export function stringToArrayOfNumbers(stringValue: string, separator: string = ","): number[] {
  return stringToArrayOfStrings(stringValue, separator).map(element => stringToNumber(element));
}

/** @throws {TypeError} - Because of `stringToBoolean` */
export function stringToArrayOfBooleans(stringValue: string, separator: string = ","): boolean[] {
  return stringToArrayOfStrings(stringValue, separator).map(element => stringToBoolean(element));
}

export function stringToSetOfStrings(stringValue: string, separator: string = ","): Set<string> {
  return new Set(stringToArrayOfStrings(stringValue, separator));
}

/** @throws {TypeError} - Because of `stringToNumber` */
export function stringToSetOfNumbers(stringValue: string, separator: string = ","): Set<number> {
  return new Set(stringToArrayOfNumbers(stringValue, separator));
}

/** @throws {TypeError} - Because of `stringToBoolean` */
export function stringToSetOfBooleans(stringValue: string, separator: string = ","): Set<boolean> {
  return new Set(stringToArrayOfBooleans(stringValue, separator));
}
