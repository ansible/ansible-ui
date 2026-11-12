import { describe, expect, it } from 'vitest';
import { currencyFormatter } from './currencyFormatter';

describe('currencyFormatter', () => {
  it('formats USD currency for analytics displays', () => {
    expect(currencyFormatter(2500)).toBe('$2,500.00');
    expect(currencyFormatter(0)).toBe('$0.00');
  });
});
