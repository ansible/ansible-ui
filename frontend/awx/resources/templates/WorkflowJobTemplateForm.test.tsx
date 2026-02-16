import { describe, expect, it } from 'vitest';
import { parseStringToTagArray, stringifyTags } from './JobTemplateFormHelpers';

describe('WorkflowJobTemplateForm', () => {
  describe('WorkflowJobTemplate helper functions', () => {
    it('should parse comma-separated string to tag array', () => {
      const result = parseStringToTagArray('tag1, tag2, tag3');
      expect(result).toHaveLength(3);
      expect(result[0].name).toBe('tag1');
      expect(result[1].name).toBe(' tag2');
      expect(result[2].name).toBe(' tag3');
    });

    it('should handle empty string when parsing tags', () => {
      const result = parseStringToTagArray('');
      expect(result).toEqual([]);
    });

    it('should handle null when parsing tags', () => {
      const result = parseStringToTagArray(null);
      expect(result).toEqual([]);
    });

    it('should stringify tag array to comma-separated string', () => {
      const tags = [{ name: 'tag1' }, { name: 'tag2' }];
      const result = stringifyTags(tags);
      expect(result).toBe('tag1,tag2');
    });

    it('should handle empty array when stringifying tags', () => {
      const result = stringifyTags([]);
      expect(result).toBe('');
    });

    it('should filter empty name tags when stringifying', () => {
      const tags = [{ name: 'tag1' }, { name: '' }, { name: 'tag2' }];
      const result = stringifyTags(tags);
      expect(result).toBe('tag1,tag2');
    });
  });
});
