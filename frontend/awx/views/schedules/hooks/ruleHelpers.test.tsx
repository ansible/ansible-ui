import { Frequency } from 'rrule';
import { describe, expect, it } from 'vitest';
import { normalizeOptions } from './ruleHelpers';

describe('normalizeOptions', () => {
  it('should normalize null or undefined values into empty array []', () => {
    const mockOptions = [{ bysetpos: null }, { bysetpos: undefined }];
    mockOptions.forEach((option) => {
      const mockNormalized = normalizeOptions(option);
      expect(mockNormalized).toEqual({ bysetpos: [] });
    });
  });

  it('should normalize single values into [single value]', () => {
    const mockOptions = [{ bysetpos: 1 }, { bysetpos: 0 }];
    const expectedOptions = [{ bysetpos: [1] }, { bysetpos: [0] }];
    mockOptions.forEach((option, index) => {
      const mockNormalized = normalizeOptions(option);
      expect(mockNormalized).toEqual(expectedOptions[index]);
    });
  });

  it('should ignore values that are already an array', () => {
    const mockOptions = [{ bysetpos: [1, 3] }, { bysetpos: [1] }];
    mockOptions.forEach((option, index) => {
      const mockNormalized = normalizeOptions(option);
      expect(mockNormalized).toEqual(mockOptions[index]);
    });
  });

  it('should ignore keys that are not in propertiesToNormalize array', () => {
    const mockOptions = [{ freq: Frequency.DAILY }, { interval: 1 }, { baz: [{ qux: [1] }] }];
    mockOptions.forEach((option, index) => {
      const mockNormalized = normalizeOptions(option);
      expect(mockNormalized).toEqual(mockOptions[index]);
    });
  });
});
