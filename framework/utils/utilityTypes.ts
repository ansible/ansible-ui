/** Make selected keys required (mirrors type-fest `SetRequired`). */
export type SetRequired<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

/** Make selected keys optional (mirrors type-fest `SetOptional`). */
export type SetOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
