import { describe, expect, test } from 'vitest';
import { isOptionsResponse } from './optionsResponseGuards';

describe('optionsResponseGuards', () => {
  describe('isOptionsResponse', () => {
    test('returns true for valid OptionsResponse with minimal fields', () => {
      const validResponse = {
        name: 'test',
        description: 'test description',
      };
      expect(isOptionsResponse(validResponse)).toBe(true);
    });

    test('returns true for valid OptionsResponse with actions', () => {
      const validResponse = {
        name: 'test',
        description: 'test description',
        actions: {
          POST: {
            name: { type: 'string', required: true, label: 'Name', filterable: false },
          },
        },
      };
      expect(isOptionsResponse(validResponse)).toBe(true);
    });

    test('returns true for valid OptionsResponse with multiple HTTP methods', () => {
      const validResponse = {
        name: 'test',
        description: 'test description',
        actions: {
          POST: {
            name: { type: 'string', required: true, label: 'Name', filterable: false },
          },
          GET: {
            id: { type: 'integer', required: true, label: 'ID', filterable: true },
          },
          PATCH: {
            description: {
              type: 'string',
              required: false,
              label: 'Description',
              filterable: false,
            },
          },
        },
      };
      expect(isOptionsResponse(validResponse)).toBe(true);
    });

    test('returns false for null', () => {
      expect(isOptionsResponse(null)).toBe(false);
    });

    test('returns false for undefined', () => {
      expect(isOptionsResponse(undefined)).toBe(false);
    });

    test('returns false for non-object types', () => {
      expect(isOptionsResponse('string')).toBe(false);
      expect(isOptionsResponse(123)).toBe(false);
      expect(isOptionsResponse(true)).toBe(false);
      expect(isOptionsResponse([])).toBe(false);
    });

    test('returns false when missing name field', () => {
      const invalidResponse = {
        description: 'test description',
      };
      expect(isOptionsResponse(invalidResponse)).toBe(false);
    });

    test('returns false when missing description field', () => {
      const invalidResponse = {
        name: 'test',
      };
      expect(isOptionsResponse(invalidResponse)).toBe(false);
    });

    test('returns false when name is not a string', () => {
      const invalidResponse = {
        name: 123,
        description: 'test description',
      };
      expect(isOptionsResponse(invalidResponse)).toBe(false);
    });

    test('returns false when description is not a string', () => {
      const invalidResponse = {
        name: 'test',
        description: 123,
      };
      expect(isOptionsResponse(invalidResponse)).toBe(false);
    });

    test('returns false when actions is not an object', () => {
      const invalidResponse = {
        name: 'test',
        description: 'test description',
        actions: 'not-an-object',
      };
      expect(isOptionsResponse(invalidResponse)).toBe(false);
    });

    test('returns false when actions.POST is not an object', () => {
      const invalidResponse = {
        name: 'test',
        description: 'test description',
        actions: {
          POST: 'not-an-object',
        },
      };
      expect(isOptionsResponse(invalidResponse)).toBe(false);
    });

    test('returns false when actions has null value', () => {
      const invalidResponse = {
        name: 'test',
        description: 'test description',
        actions: {
          POST: null,
        },
      };
      expect(isOptionsResponse(invalidResponse)).toBe(false);
    });

    test('returns true when actions is empty object', () => {
      const validResponse = {
        name: 'test',
        description: 'test description',
        actions: {},
      };
      expect(isOptionsResponse(validResponse)).toBe(true);
    });

    test('returns true with additional optional fields', () => {
      const validResponse = {
        name: 'test',
        description: 'test description',
        renders: ['table', 'list'],
        parses: ['json'],
        types: ['organization'],
        search_fields: ['name', 'description'],
        related_search_fields: ['teams'],
        max_page_size: 100,
      };
      expect(isOptionsResponse(validResponse)).toBe(true);
    });

    test('returns true with null actions', () => {
      const validResponse = {
        name: 'test',
        description: 'test description',
        actions: null,
      };
      expect(isOptionsResponse(validResponse)).toBe(true);
    });

    test('returns true with undefined actions', () => {
      const validResponse = {
        name: 'test',
        description: 'test description',
        actions: undefined,
      };
      expect(isOptionsResponse(validResponse)).toBe(true);
    });
  });
});
