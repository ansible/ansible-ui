/* eslint-disable i18next/no-literal-string */
import { describe, expect, it } from 'vitest';
import { capitalizeFirstLetter, toTitleCase } from './strings';

describe('strings', () => {
  describe('capitalizeFirstLetter', () => {
    it('should capitalize the first letter', () => {
      expect(capitalizeFirstLetter('hello')).toBe('Hello');
    });

    it('should return empty string for empty input', () => {
      expect(capitalizeFirstLetter('')).toBe('');
    });

    it('should handle single character', () => {
      expect(capitalizeFirstLetter('a')).toBe('A');
    });

    it('should not change already capitalized string', () => {
      expect(capitalizeFirstLetter('Hello')).toBe('Hello');
    });
  });

  describe('toTitleCase', () => {
    it('should convert underscore-separated words to title case', () => {
      expect(toTitleCase('hello_world')).toBe('Hello World');
    });

    it('should return empty string for empty input', () => {
      expect(toTitleCase('')).toBe('');
    });

    it('should handle single word', () => {
      expect(toTitleCase('hello')).toBe('Hello');
    });

    it('should handle multiple underscores', () => {
      expect(toTitleCase('one_two_three')).toBe('One Two Three');
    });

    it('should lowercase uppercase input first', () => {
      expect(toTitleCase('HELLO_WORLD')).toBe('Hello World');
    });
  });
});
