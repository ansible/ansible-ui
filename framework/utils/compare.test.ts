import { describe, expect, it } from 'vitest';
import { compareNumbers, compareStrings, compareUnknowns } from './compare';

describe('compare', () => {
  describe('compareStrings', () => {
    it('orders strings lexicographically', () => {
      expect(compareStrings('a', 'b')).toBe(-1);
      expect(compareStrings('b', 'a')).toBe(1);
      expect(compareStrings('same', 'same')).toBe(0);
    });

    it('treats null and undefined as less than defined strings', () => {
      expect(compareStrings(undefined, 'a')).toBe(1);
      expect(compareStrings(null, 'a')).toBe(1);
      expect(compareStrings('a', undefined)).toBe(-1);
      expect(compareStrings(undefined, undefined)).toBe(0);
    });
  });

  describe('compareNumbers', () => {
    it('orders numbers numerically', () => {
      expect(compareNumbers(1, 2)).toBe(-1);
      expect(compareNumbers(2, 1)).toBe(1);
      expect(compareNumbers(5, 5)).toBe(0);
    });

    it('treats null and undefined as less than defined numbers', () => {
      expect(compareNumbers(undefined, 1)).toBe(1);
      expect(compareNumbers(null, 1)).toBe(1);
      expect(compareNumbers(1, undefined)).toBe(-1);
    });
  });

  describe('compareUnknowns', () => {
    it('compares string pairs', () => {
      expect(compareUnknowns('alpha', 'beta')).toBe(-1);
    });

    it('compares mixed string and number values', () => {
      expect(compareUnknowns('10', 2)).toBe(-1);
      expect(compareUnknowns(10, '2')).toBe(-1);
    });

    it('compares number pairs', () => {
      expect(compareUnknowns(3, 7)).toBe(-1);
    });

    it('returns zero for incomparable types', () => {
      expect(compareUnknowns(true, false)).toBe(0);
    });
  });
});
