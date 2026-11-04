import { describe, expect, it } from 'vitest';
import { arrayToString, stringIsUUID, stringToArray, toTitleCase, truncateString } from './strings';

describe('strings utils', () => {
  describe('toTitleCase', () => {
    it('returns empty string for falsy input', () => {
      expect(toTitleCase('')).toBe('');
    });

    it('converts snake_case to title case', () => {
      expect(toTitleCase('job_template')).toBe('Job Template');
    });
  });

  describe('arrayToString and stringToArray', () => {
    it('joins and splits comma-separated values', () => {
      expect(arrayToString(['a', 'b'])).toBe('a,b');
      expect(stringToArray('a,b,c')).toEqual(['a', 'b', 'c']);
      expect(stringToArray('a,,b')).toEqual(['a', 'b']);
    });
  });

  describe('stringIsUUID', () => {
    it('matches valid UUIDs', () => {
      expect(stringIsUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
      expect(stringIsUUID('not-a-uuid')).toBe(false);
    });
  });

  describe('truncateString', () => {
    it('returns original string when shorter than limit', () => {
      expect(truncateString('short', 10)).toBe('short');
    });

    it('truncates with ellipsis when longer than limit', () => {
      expect(truncateString('abcdefghij', 5)).toBe('abcde...');
    });
  });
});
