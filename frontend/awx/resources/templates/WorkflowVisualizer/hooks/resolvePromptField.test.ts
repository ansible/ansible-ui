import { describe, expect, it } from 'vitest';
import { resolvePromptField } from './resolvePromptField';

describe('resolvePromptField', () => {
  const fallback = 'default';

  describe('when resource has a value (saved node with fresh API data)', () => {
    it('should return resource value when both resource and prompt have values', () => {
      expect(resolvePromptField('resource-value', 'prompt-value', fallback)).toBe('resource-value');
    });

    it('should return resource value when only resource has a value', () => {
      expect(resolvePromptField('resource-value', undefined, fallback)).toBe('resource-value');
    });

    it('should return resource value when prompt is null', () => {
      expect(resolvePromptField('resource-value', null, fallback)).toBe('resource-value');
    });
  });

  describe('when resource is null (user cleared the field)', () => {
    it('should return fallback when prompt is undefined', () => {
      expect(resolvePromptField(null, undefined, fallback)).toBe(fallback);
    });

    it('should return fallback when prompt is null', () => {
      expect(resolvePromptField(null, null, fallback)).toBe(fallback);
    });

    it('should return fallback when prompt has a value', () => {
      // Resource null takes precedence - user explicitly cleared it
      expect(resolvePromptField(null, 'prompt-value', fallback)).toBe(fallback);
    });
  });

  describe('when resource is undefined (unsaved node or field not in resource)', () => {
    it('should return prompt value when prompt has a value', () => {
      expect(resolvePromptField(undefined, 'prompt-value', fallback)).toBe('prompt-value');
    });

    it('should return fallback when prompt is null', () => {
      expect(resolvePromptField(undefined, null, fallback)).toBe(fallback);
    });

    it('should return fallback when prompt is undefined', () => {
      expect(resolvePromptField(undefined, undefined, fallback)).toBe(fallback);
    });
  });

  describe('type safety with different types', () => {
    it('should work with numbers', () => {
      expect(resolvePromptField(10, 20, 0)).toBe(10);
      expect(resolvePromptField(null, 20, 0)).toBe(0);
      expect(resolvePromptField(undefined, 20, 0)).toBe(20);
    });

    it('should work with booleans', () => {
      expect(resolvePromptField(true, false, false)).toBe(true);
      expect(resolvePromptField(false, true, true)).toBe(false);
      expect(resolvePromptField(null, true, false)).toBe(false);
      expect(resolvePromptField(undefined, true, false)).toBe(true);
    });

    it('should work with objects', () => {
      const obj1 = { id: 1 };
      const obj2 = { id: 2 };
      const objFallback = { id: 0 };

      expect(resolvePromptField(obj1, obj2, objFallback)).toBe(obj1);
      expect(resolvePromptField(null, obj2, objFallback)).toBe(objFallback);
      expect(resolvePromptField(undefined, obj2, objFallback)).toBe(obj2);
    });
  });

  describe('edge cases with zero and empty string', () => {
    it('should preserve zero as a valid value', () => {
      expect(resolvePromptField(0, 10, 5)).toBe(0);
      expect(resolvePromptField(undefined, 0, 5)).toBe(0);
    });

    it('should preserve empty string as a valid value', () => {
      expect(resolvePromptField('', 'prompt', 'fallback')).toBe('');
      expect(resolvePromptField(undefined, '', 'fallback')).toBe('');
    });

    it('should preserve false as a valid value', () => {
      expect(resolvePromptField(false, true, true)).toBe(false);
      expect(resolvePromptField(undefined, false, true)).toBe(false);
    });
  });

  describe('realistic workflow scenarios', () => {
    it('should handle limit field cleared by user (null in resource)', () => {
      // User cleared limit field, saved, then reopened dialog
      const resource = null; // API returned null (cleared)
      const prompt = 'staging-servers'; // Stale local state from before save
      const template = 'production-servers'; // Template default

      expect(resolvePromptField(resource, prompt, template)).toBe(template);
    });

    it('should handle scm_branch set to empty string', () => {
      // User explicitly set scm_branch to empty string (different from null)
      const resource = ''; // API returned empty string
      const prompt = 'develop'; // Stale local state
      const template = 'main'; // Template default

      expect(resolvePromptField(resource, prompt, template)).toBe('');
    });

    it('should handle unsaved node with local changes', () => {
      // New node, user entered data in wizard, hasn't saved yet
      const resource = undefined; // No API data yet (unsaved)
      const prompt = 'my-branch'; // User's input in wizard
      const template = 'main'; // Template default

      expect(resolvePromptField(resource, prompt, template)).toBe('my-branch');
    });

    it('should handle verbosity cleared (null) vs not set (undefined)', () => {
      // Saved node with cleared verbosity
      expect(resolvePromptField<number | null>(null, 2, 0)).toBe(0);

      // Unsaved node with verbosity not set
      expect(resolvePromptField<number | null>(undefined, undefined, 0)).toBe(0);

      // Unsaved node with verbosity set to 0
      expect(resolvePromptField<number | null>(undefined, 0, 2)).toBe(0);
    });
  });
});
