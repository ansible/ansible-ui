/* eslint-disable i18next/no-literal-string */
import { describe, expect, test } from 'vitest';
import {
  allSelectedKey,
  getAllSelectedSearch,
  getSelectionFingerprint,
  removeFilter,
  removeFilterValue,
  selectFilterValues,
  toCustomPeriodValues,
} from './filterStateUpdates';

const ALL_KEY = allSelectedKey('template');
const SEARCH = 'Test, job 1%';

describe('toCustomPeriodValues', () => {
  test('returns from and to when both are set', () => {
    expect(toCustomPeriodValues('custom', '2024-01-01', '2024-01-31')).toEqual([
      'custom',
      '2024-01-01',
      '2024-01-31',
    ]);
  });

  test('keeps an empty from while there is a to', () => {
    expect(toCustomPeriodValues('custom', '', '2024-01-31')).toEqual(['custom', '', '2024-01-31']);
    expect(toCustomPeriodValues('custom', undefined, '2024-01-31')).toEqual([
      'custom',
      '',
      '2024-01-31',
    ]);
  });

  test('returns only from when there is no to', () => {
    expect(toCustomPeriodValues('custom', '2024-01-01', undefined)).toEqual([
      'custom',
      '2024-01-01',
    ]);
    expect(toCustomPeriodValues('custom', '2024-01-01', '')).toEqual(['custom', '2024-01-01']);
  });

  test('returns only the custom value when neither from nor to is set', () => {
    expect(toCustomPeriodValues('custom', '', undefined)).toEqual(['custom']);
    expect(toCustomPeriodValues('custom', undefined, undefined)).toEqual(['custom']);
  });
});

describe('removeFilterValue', () => {
  test('removes one value and keeps the others', () => {
    expect(
      removeFilterValue({ template: ['1', '2'], period: ['last_7_days'] }, 'template', '1')
    ).toEqual({ template: ['2'], period: ['last_7_days'] });
  });

  test('drops the filter key when the last value is removed', () => {
    expect(
      removeFilterValue({ template: ['1'], period: ['last_7_days'] }, 'template', '1')
    ).toEqual({
      period: ['last_7_days'],
    });
  });

  test('handles a filter without values', () => {
    expect(removeFilterValue({ period: ['last_7_days'] }, 'template', '1')).toEqual({
      period: ['last_7_days'],
    });
  });

  test('does not mutate the given filter state', () => {
    const filterState = { template: ['1', '2'] };
    removeFilterValue(filterState, 'template', '1');
    expect(filterState).toEqual({ template: ['1', '2'] });
  });
});

describe('removeFilter', () => {
  test('removes all values of a filter and keeps the others', () => {
    const filterState = { template: ['1', '2'], period: ['last_7_days'] };
    expect(removeFilter(filterState, 'template')).toEqual({ period: ['last_7_days'] });
    expect(filterState).toEqual({ template: ['1', '2'], period: ['last_7_days'] });
  });
});

describe('getSelectionFingerprint', () => {
  test('does not depend on the order of the values', () => {
    expect(getSelectionFingerprint(['2', '10', '1'])).toBe(
      getSelectionFingerprint(['1', '2', '10'])
    );
  });

  test('tells selections of the same count apart', () => {
    expect(getSelectionFingerprint(['1', '2'])).not.toBe(getSelectionFingerprint(['1', '3']));
    expect(getSelectionFingerprint(['ab', 'c'])).not.toBe(getSelectionFingerprint(['a', 'bc']));
  });
});

describe('selectFilterValues', () => {
  test('marks a selection made by "Select all" with its search, without commas', () => {
    const next = selectFilterValues({}, 'template', () => ['1', '2'], {
      search: SEARCH,
      values: ['2', '1'],
    });

    expect(next.template).toEqual(['1', '2']);
    expect(next[ALL_KEY]?.join(',').split(',')).toEqual(next[ALL_KEY]);
    expect(getAllSelectedSearch(next.template, next[ALL_KEY])).toBe(SEARCH);
  });

  test('does not mark a selection that has more than the options "Select all" selected', () => {
    const next = selectFilterValues({ template: ['9'] }, 'template', (v = []) => [...v, '1'], {
      search: SEARCH,
      values: ['1'],
    });

    expect(next[ALL_KEY]).toBeUndefined();
  });

  test('drops the mark on any other change and the filter key on an empty selection', () => {
    const marked = selectFilterValues({}, 'template', () => ['1', '2'], {
      search: '',
      values: ['1', '2'],
    });

    expect(selectFilterValues(marked, 'template', () => ['1'])[ALL_KEY]).toBeUndefined();
    expect(selectFilterValues(marked, 'template', () => [])).toEqual({});
  });
});

describe('getAllSelectedSearch', () => {
  const marked = selectFilterValues({}, 'template', () => ['1', '2'], {
    search: '',
    values: ['1', '2'],
  });

  test('returns the search ("" without one) while the selection is unchanged', () => {
    expect(getAllSelectedSearch(['2', '1'], marked[ALL_KEY])).toBe('');
  });

  test('returns undefined once the selection changed or without a mark', () => {
    expect(getAllSelectedSearch(['1', '3'], marked[ALL_KEY])).toBeUndefined();
    expect(getAllSelectedSearch([], marked[ALL_KEY])).toBeUndefined();
    expect(getAllSelectedSearch(['1', '2'], undefined)).toBeUndefined();
  });

  test('returns undefined for a malformed search, e.g. from an edited URL', () => {
    const fingerprint = getSelectionFingerprint(['1']);
    expect(getAllSelectedSearch(['1'], ['%E0%A4%A', fingerprint])).toBeUndefined();
  });
});

describe('removing values drops the "Select all" mark', () => {
  const marked = selectFilterValues({}, 'template', () => ['1', '2'], {
    search: '',
    values: ['1', '2'],
  });

  test('removeFilterValue', () => {
    expect(removeFilterValue(marked, 'template', '1')).toEqual({ template: ['2'] });
  });

  test('removeFilter', () => {
    expect(removeFilter(marked, 'template')).toEqual({});
  });
});
