import c from "chalk";

export const spaceColumnEnd = 20;
export const spaceToColumn = 40;

export const expectsFailure = c.yellow("expects failure".padEnd(spaceColumnEnd));
export const expectsSuccess = c.yellow("expects success".padEnd(spaceColumnEnd));
export const expectsTrue = c.yellow("expects `true`".padEnd(spaceColumnEnd));
export const expectsFalse = c.yellow("expects `false`".padEnd(spaceColumnEnd));
export const expectsUndefined = c.yellow("expects `undefined`".padEnd(spaceColumnEnd));
export const expectsString = c.yellow("expects `string`".padEnd(spaceColumnEnd));
export const expectsNumber = c.yellow("expects `number`".padEnd(spaceColumnEnd));

export const err = (...message: unknown[]) => c.bold.red(...message);

