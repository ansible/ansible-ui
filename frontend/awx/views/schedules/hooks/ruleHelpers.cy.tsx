import { Frequency } from 'rrule';
import { normalizeOptions } from './ruleHelpers';

describe('normalizeOptions', () => {
  it('Normalizes null or undefined values into empty array []', () => {
    const mockOptions = [{ bysetpos: null }, { bysetpos: undefined }];
    mockOptions.forEach((option) => {
      const mockNormalized = normalizeOptions(option);
      expect(mockNormalized).to.deep.equal({ bysetpos: [] });
    });
  });
  it('Normalizes single values into [single value]', () => {
    const mockOptions = [{ bysetpos: 1 }, { bysetpos: 0 }];
    const expectedOptions = [{ bysetpos: [1] }, { bysetpos: [0] }];
    mockOptions.forEach((option, index) => {
      const mockNormalized = normalizeOptions(option);
      expect(mockNormalized).to.deep.equal(expectedOptions[index]);
    });
  });
  it('Ignores values that are already an array', () => {
    const mockOptions = [{ bysetpos: [1, 3] }, { bysetpos: [1] }];
    mockOptions.forEach((option, index) => {
      const mockNormalized = normalizeOptions(option);
      expect(mockNormalized).to.deep.equal(mockOptions[index]);
    });
  });
  it('Ignores keys that are not in propertiesToNormalize array', () => {
    const mockOptions = [{ freq: Frequency.DAILY }, { interval: 1 }, { baz: [{ qux: [1] }] }];
    mockOptions.forEach((option, index) => {
      const mockNormalized = normalizeOptions(option);
      expect(mockNormalized).to.deep.equal(mockOptions[index]);
    });
  });
});
