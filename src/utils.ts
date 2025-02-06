import assert from "node:assert";
import { z } from "zod";

/**
 * @param name - Should start with `'--'`
 * @returns - The transformed name E.g. `--input-dir` -> `InputDir`
 */
export function transformArg(name: string): string {
  assert(name.startsWith("-"), `[transformArg] Invalid arg name: ${name}`);
  name = name.startsWith("--") ? name.substring(2) : name.substring(1);
  return name.replace(/-([a-z])/g, g => g[1].toUpperCase());
}

/** - Reverse of `transformArg`. E.g. `InputDir` -> `--input-dir` , `i` -> `-i` */
export function transformOptionToArg(name: string): string {
  name = name.replace(/^[A-Z]/g, g => g.toLowerCase()); // first letter always lower case
  if (name.length === 1) return `-${name}`;
  return `--${name.replace(/[A-Z]/g, g => "-" + g.toLowerCase())}`;
}

/** - Check if an arg string is a short arg. E.g. `-i` -> `true` */
export function isFlagArg(name: string): boolean {
  return /^-[A-Z-a-z]$/.test(name);
}

/** - Check if an arg string is a long arg. E.g. `--input-dir` -> `true` */
export function isLongArg(name: string): boolean {
  return /^--[A-Z-a-z-]+[A-Z-a-z]$/.test(name);
}

/** - Check if an arg string is an options arg. E.g. `--input-dir` -> `true` , `-i` -> `true` */
export function isOptionArg(name: string | boolean): boolean {
  if (typeof name !== "string") return false;
  return isFlagArg(name) || isLongArg(name);
}

/**
 * - Transform option name to no name. E.g. `include` -> `noInclude`
 * - For short name like `-i` it will be ignored
 */
export function noName(name: string): string {
  if (name.length === 1) return name;
  return "no" + name.replace(/^[a-z]/, g => g.toUpperCase());
}

/** - Convert string to boolean. E.g. `"true"` -> `true` , `"false"` -> `false` */
export function stringToBoolean(str: string): boolean {
  if (str.toLowerCase() === "true") return true;
  if (str.toLowerCase() === "false") return false;
  throw new Error(`[stringToBoolean] Invalid boolean value: "${str}"; Expected "true" or "false"`);
}

export function getOrdinalPlacement(index: number): string {
  if (index < 0) return "";

  const suffixes = ["th", "st", "nd", "rd"];
  const lastDigit = index % 10;
  const lastTwoDigits = index % 100;

  const suffix =
    lastDigit === 1 && lastTwoDigits !== 11
      ? suffixes[1]
      : lastDigit === 2 && lastTwoDigits !== 12
        ? suffixes[2]
        : lastDigit === 3 && lastTwoDigits !== 13
          ? suffixes[3]
          : suffixes[0];

  return `${index + 1}${suffix}`;
}

/** - Check if a schema is a boolean */
export function isBooleanSchema(schema: z.ZodTypeAny): boolean {
  let type = schema;
  while (type) {
    if (type instanceof z.ZodBoolean) {
      return true;
    }

    if (type instanceof z.ZodLiteral) {
      return type.value === true || type.value === false;
    }

    type = type._def.innerType;
  }

  return false;
}

export function getDefaultValueFromSchema(schema: z.ZodTypeAny): unknown | undefined {
  let type = schema;
  while (type) {
    if (type instanceof z.ZodDefault) {
      const defaultValue = type._def.defaultValue();
      return defaultValue;
    }

    type = type._def.innerType;
  }

  return undefined;
}

/** - Decouple flags E.g. `-rf` -> `-r, -f` */
export function decoupleFlags(args: string[]): string[] {
  const flagsRe = /^-[a-z]{2,}$/i;

  const result = [];
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const isCoupled = flagsRe.test(arg);

    if (!isCoupled) {
      result.push(arg);
      continue;
    }

    const decoupledArr = arg
      .substring(1)
      .split("")
      .map(c => "-" + c);

    result.push(...decoupledArr);
  }

  return result;
}

/** Print */
export function print(...messages: string[]) {
  return process.stdout.write(messages.join(" "));
}

/** Print line */
export function println(...messages: string[]) {
  messages = messages.filter(Boolean);
  return console.log(...messages);
}

/** New line */
export function ln(count: number) {
  return "\n".repeat(count);
}

/** Space */
export function indent(count: number) {
  return " ".repeat(count);
}

/** Add indent before each new line */
export function addIndentLn(message: string, indent: string = "") {
  return message.replace(/\n/g, `\n${indent}`);
}

/** Concat strings */
export function concat(...messages: string[]) {
  messages = messages.filter(Boolean);
  return messages.join(" ");
}
