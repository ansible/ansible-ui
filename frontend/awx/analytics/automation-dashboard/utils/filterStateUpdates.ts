/**
 * Builds the custom period values `['custom', from?, to?]`.
 *
 * While there is a "to", an empty "from" is kept as `''` so the end date survives clearing the
 * start date (the "to" picker becomes read-only instead). Without a "to", an empty "from" is
 * dropped.
 */
export function toCustomPeriodValues(
  customValue: string,
  from: string | undefined,
  to: string | undefined
): string[] {
  if (to) return [customValue, from ?? '', to];
  return from ? [customValue, from] : [customValue];
}
