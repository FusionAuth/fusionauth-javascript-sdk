declare const brand: unique symbol;

export type Brand<T, Kind extends string> = T & {
  readonly [brand]: Kind;
};
