import { describe, expect, it } from 'vitest';
import { numberFormatter } from './numberFormatter';

describe('numberFormatter', () => {
  it('formats numbers with at most two significant digits', () => {
    expect(numberFormatter(1234)).toBe('1,200');
    expect(numberFormatter(0.00456)).toBe('0.0046');
  });
});
