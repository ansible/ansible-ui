import { describe, expect, it } from 'vitest';
import { parseJSONPreservingLargeInts, stringifyPreservingLargeInts } from './jsonUtils';

describe('jsonUtils', () => {
  describe('parseJSONPreservingLargeInts', () => {
    it('should parse small integers as numbers', () => {
      const json = '{"value": 12345}';
      const result = parseJSONPreservingLargeInts(json) as { value: number };
      expect(result.value).toBe(12345);
      expect(typeof result.value).toBe('number');
    });

    it('should parse large integers (>16 digits) as strings', () => {
      const json = '{"value": 12341234123412341234123412341235}';
      const result = parseJSONPreservingLargeInts(json) as { value: string };
      expect(result.value).toBe('12341234123412341234123412341235');
      expect(typeof result.value).toBe('string');
    });

    it('should preserve 32-digit integers as strings', () => {
      const json = `{
  "number_list": [
    12341234123412341234123412341235,
    12341234123412341234123412341236,
    12341234123412341234123412341237
  ]
}`;
      const result = parseJSONPreservingLargeInts(json) as { number_list: string[] };
      expect(result.number_list).toEqual([
        '12341234123412341234123412341235',
        '12341234123412341234123412341236',
        '12341234123412341234123412341237',
      ]);
      expect(typeof result.number_list[0]).toBe('string');
    });

    it('should parse negative large integers as strings', () => {
      const json = '{"value": -12341234123412341234123412341235}';
      const result = parseJSONPreservingLargeInts(json) as { value: string };
      expect(result.value).toBe('-12341234123412341234123412341235');
      expect(typeof result.value).toBe('string');
    });

    it('should handle mixed small and large integers', () => {
      const json = '{"small": 123, "large": 12341234123412341234123412341235}';
      const result = parseJSONPreservingLargeInts(json) as { small: number; large: string };
      expect(result.small).toBe(123);
      expect(typeof result.small).toBe('number');
      expect(result.large).toBe('12341234123412341234123412341235');
      expect(typeof result.large).toBe('string');
    });

    it('should handle large integers at end of array', () => {
      const json = '{"values": [1, 2, 12341234123412341234123412341235]}';
      const result = parseJSONPreservingLargeInts(json) as { values: (number | string)[] };
      expect(result.values[0]).toBe(1);
      expect(result.values[1]).toBe(2);
      expect(result.values[2]).toBe('12341234123412341234123412341235');
    });

    it('should handle large integers at start of array', () => {
      const json = '{"values": [12341234123412341234123412341235, 1, 2]}';
      const result = parseJSONPreservingLargeInts(json) as { values: (number | string)[] };
      expect(result.values[0]).toBe('12341234123412341234123412341235');
      expect(result.values[1]).toBe(1);
      expect(result.values[2]).toBe(2);
    });

    it('should handle strings normally', () => {
      const json = '{"value": "some string"}';
      const result = parseJSONPreservingLargeInts(json) as { value: string };
      expect(result.value).toBe('some string');
    });
  });

  describe('stringifyPreservingLargeInts', () => {
    it('should serialize small integers as numbers', () => {
      const obj = { value: 12345 };
      const json = stringifyPreservingLargeInts(obj, 2);
      expect(json).toContain('"value": 12345');
    });

    it('should serialize large integer strings as unquoted numbers', () => {
      const obj = { value: '12341234123412341234123412341235' };
      const json = stringifyPreservingLargeInts(obj, 2);
      expect(json).toContain('"value": 12341234123412341234123412341235');
      expect(json).not.toContain('"value": "12341234123412341234123412341235"');
    });

    it('should serialize arrays of large integers without quotes', () => {
      const obj = {
        number_list: [
          '12341234123412341234123412341235',
          '12341234123412341234123412341236',
          '12341234123412341234123412341237',
        ],
      };
      const json = stringifyPreservingLargeInts(obj, 2);
      expect(json).toContain('12341234123412341234123412341235');
      expect(json).not.toContain('"12341234123412341234123412341235"');
    });

    it('should handle negative large integers', () => {
      const obj = { value: '-12341234123412341234123412341235' };
      const json = stringifyPreservingLargeInts(obj, 2);
      expect(json).toContain('-12341234123412341234123412341235');
      expect(json).not.toContain('"-12341234123412341234123412341235"');
    });

    it('should serialize regular strings with quotes', () => {
      const obj = { value: 'some string' };
      const json = stringifyPreservingLargeInts(obj, 2);
      expect(json).toContain('"value": "some string"');
    });

    it('should not unquote numeric-like strings that are not large integers', () => {
      const obj = { value: '123abc' };
      const json = stringifyPreservingLargeInts(obj, 2);
      expect(json).toContain('"123abc"');
    });
  });

  describe('round-trip preservation', () => {
    it('should preserve large integers through parse and stringify', () => {
      const originalJson = `{
  "number_list": [
    12341234123412341234123412341235,
    12341234123412341234123412341236,
    12341234123412341234123412341237
  ]
}`;
      const parsed = parseJSONPreservingLargeInts(originalJson) as { number_list: string[] };
      const stringified = stringifyPreservingLargeInts(parsed, 2);
      const reparsed = parseJSONPreservingLargeInts(stringified) as { number_list: string[] };

      expect(reparsed.number_list).toEqual([
        '12341234123412341234123412341235',
        '12341234123412341234123412341236',
        '12341234123412341234123412341237',
      ]);
    });

    it('should preserve precision for 32-digit integers', () => {
      const original = '12341234123412341234123412341235';
      const json = stringifyPreservingLargeInts({ value: original }, 2);
      const result = parseJSONPreservingLargeInts(json) as { value: string };
      expect(result.value).toBe(original);
    });
  });
});
