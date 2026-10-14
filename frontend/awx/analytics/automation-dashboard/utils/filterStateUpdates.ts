import { IFilterState } from '@ansible/ansible-ui-framework';
import { ToolbarLabel } from '@patternfly/react-core';

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

/** Removes one value of a filter; drops the filter key when no values are left. */
export function removeFilterValue(
  filterState: IFilterState,
  key: string,
  value: string
): IFilterState {
  const values = (filterState[key] ?? []).filter((v) => v !== value);
  const next = { ...filterState };
  if (values.length === 0) delete next[key];
  else next[key] = values;
  return next;
}

/** Removes all values of a filter. */
export function removeFilter(filterState: IFilterState, key: string): IFilterState {
  const next = { ...filterState };
  delete next[key];
  return next;
}

/** The filter value behind a PatternFly toolbar chip (a plain string or a `{ key, node }` label). */
export function getToolbarLabelValue(label: ToolbarLabel | string): string {
  return typeof label === 'string' ? label : label.key;
}
