/* eslint-disable i18next/no-literal-string */
import { describe, expect, test } from 'vitest';
import {
  getToolbarLabelValue,
  removeFilter,
  removeFilterValue,
  toCustomPeriodValues,
} from './filterStateUpdates';

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

describe('getToolbarLabelValue', () => {
  test('returns a plain string label as is', () => {
    expect(getToolbarLabelValue('1')).toBe('1');
  });

  test('returns the key of a { key, node } label', () => {
    expect(getToolbarLabelValue({ key: '1', node: 'Template 1' })).toBe('1');
  });
});
