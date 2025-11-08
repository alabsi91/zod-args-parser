/** `{ some props } & { other props }` => `{ some props, other props }` */
export type Prettify<T> = { [K in keyof T]: T[K] } & {};

/** Extract the undefined properties from an object */
export type UndefinedProperties<T> = { [P in keyof T]-?: undefined extends T[P] ? P : never }[keyof T];

/** Make undefined properties optional? */
export type ToOptional<T> = Partial<Pick<T, UndefinedProperties<T>>> &
  Pick<T, Exclude<keyof T, UndefinedProperties<T>>>;

/** If every property in a record is optional, widen the type to `T | undefined`. */
export type AllowUndefinedIfOptional<T> = {
  [K in keyof T]-?: object extends Pick<T, K> ? never : K;
}[keyof T] extends never
  ? T | undefined
  : T;

/** Widen literal and tuples */
// prettier-ignore
export type Widen<T> =
  T extends string ? string :
  T extends number ? number :
  T extends boolean ? boolean :
  T extends readonly (infer U)[] ? Widen<U>[] :
  T extends Set<infer U> ? Set<Widen<U>> :
  T;
