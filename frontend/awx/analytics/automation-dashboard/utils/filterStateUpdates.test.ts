import { describe, expect, test } from 'vitest';
import { toCustomPeriodValues } from './filterStateUpdates';

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
