import { describe, expect, it } from 'vitest';
import { resolvePromptField } from './resolvePromptField';

describe('resolvePromptField', () => {
  const fallback = 'default';

  describe('reviewer-requested verification tests', () => {
    it('should verify: resolvePromptField("main", "", "") === ""', () => {
      // In-session edit to clear scm_branch (empty string) should win over resource
      expect(resolvePromptField('main', '', '')).toBe('');
    });

    it('should verify: resolvePromptField(null, "feature", "") === "feature"', () => {
      // In-session edit to set scm_branch should win over null resource
      expect(resolvePromptField(null, 'feature', '')).toBe('feature');
    });
  });

  describe('prompt-first precedence (preserves in-session edits)', () => {
    it('should return prompt value when both have values (in-session edit wins)', () => {
      expect(resolvePromptField('resource-value', 'prompt-value', fallback)).toBe('prompt-value');
    });

    it('should return prompt value when only prompt has a value', () => {
      expect(resolvePromptField(undefined, 'prompt-value', fallback)).toBe('prompt-value');
    });

    it('should return prompt value even when resource is null', () => {
      // User edited after field was cleared - prompt edit wins
      expect(resolvePromptField(null, 'prompt-value', fallback)).toBe('prompt-value');
    });
  });

  describe('prompt cleared (empty string preserves user intent)', () => {
    it('should preserve empty string from prompt (cleared field)', () => {
      expect(resolvePromptField('main', '', '')).toBe('');
      expect(resolvePromptField('resource-val', '', 'fallback')).toBe('');
    });

    it('should preserve zero from prompt', () => {
      expect(resolvePromptField(10, 0, 5)).toBe(0);
      expect(resolvePromptField(undefined, 0, 5)).toBe(0);
    });

    it('should preserve false from prompt', () => {
      expect(resolvePromptField(true, false, true)).toBe(false);
      expect(resolvePromptField(undefined, false, true)).toBe(false);
    });
  });

  describe('when prompt is null (user explicitly cleared via wizard)', () => {
    it('should use fallback when resource is undefined', () => {
      expect(resolvePromptField(undefined, null, fallback)).toBe(fallback);
    });

    it('should use fallback when resource is null', () => {
      expect(resolvePromptField(null, null, fallback)).toBe(fallback);
    });

    it('should use fallback when resource has a value', () => {
      // Prompt null means user cleared it - use fallback
      expect(resolvePromptField('resource-value', null, fallback)).toBe(fallback);
    });
  });

  describe('when prompt is undefined (field not edited in wizard)', () => {
    it('should use resource value when available', () => {
      expect(resolvePromptField('resource-value', undefined, fallback)).toBe('resource-value');
    });

    it('should use fallback when resource is null', () => {
      expect(resolvePromptField(null, undefined, fallback)).toBe(fallback);
    });

    it('should use fallback when resource is undefined', () => {
      expect(resolvePromptField(undefined, undefined, fallback)).toBe(fallback);
    });
  });

  describe('type safety with different types', () => {
    it('should work with numbers', () => {
      expect(resolvePromptField(10, 20, 0)).toBe(20); // prompt wins
      expect(resolvePromptField(null, 20, 0)).toBe(20); // prompt wins
      expect(resolvePromptField(10, undefined, 0)).toBe(10); // resource when prompt undefined
    });

    it('should work with booleans', () => {
      expect(resolvePromptField(true, false, false)).toBe(false); // prompt wins
      expect(resolvePromptField(false, true, true)).toBe(true); // prompt wins
      expect(resolvePromptField(null, true, false)).toBe(true); // prompt wins
      expect(resolvePromptField(true, undefined, false)).toBe(true); // resource when prompt undefined
    });

    it('should work with objects', () => {
      const obj1 = { id: 1 };
      const obj2 = { id: 2 };
      const objFallback = { id: 0 };

      expect(resolvePromptField(obj1, obj2, objFallback)).toBe(obj2); // prompt wins
      expect(resolvePromptField(null, obj2, objFallback)).toBe(obj2); // prompt wins
      expect(resolvePromptField(obj1, undefined, objFallback)).toBe(obj1); // resource when prompt undefined
    });
  });

  describe('edge cases with zero and empty string', () => {
    it('should preserve zero as a valid value', () => {
      expect(resolvePromptField(10, 0, 5)).toBe(0); // prompt zero wins
      expect(resolvePromptField(undefined, 0, 5)).toBe(0); // prompt zero wins
    });

    it('should preserve empty string as a valid value', () => {
      expect(resolvePromptField('resource', '', 'fallback')).toBe(''); // prompt empty string wins
      expect(resolvePromptField(undefined, '', 'fallback')).toBe(''); // prompt empty string wins
    });

    it('should preserve false as a valid value', () => {
      expect(resolvePromptField(true, false, true)).toBe(false); // prompt false wins
      expect(resolvePromptField(undefined, false, true)).toBe(false); // prompt false wins
    });
  });

  describe('realistic workflow scenarios', () => {
    it('should preserve in-session clear when reopening saved node', () => {
      // User clears limit field in wizard (prompt = ''), then reopens
      const resource = 'production-servers'; // Stale API data
      const prompt = ''; // User cleared it in current session
      const template = 'default-servers'; // Template default

      expect(resolvePromptField(resource, prompt, template)).toBe('');
    });

    it('should preserve in-session edit when reopening saved node', () => {
      // User edits scm_branch in wizard (prompt = 'feature'), then reopens
      const resource = 'main'; // Stale API data
      const prompt = 'feature'; // User edited it in current session
      const template = 'develop'; // Template default

      expect(resolvePromptField(resource, prompt, template)).toBe('feature');
    });

    it('should use resource when field not edited (prompt undefined)', () => {
      // User opens saved node, hasn't edited this field
      const resource = 'production'; // Fresh API data
      const prompt = undefined; // Not edited in this session
      const template = 'default'; // Template default

      expect(resolvePromptField(resource, prompt, template)).toBe('production');
    });

    it('should handle unsaved node with local changes', () => {
      // User creates new node and sets a value
      const resource = undefined; // New node, no API data yet
      const prompt = 'staging-servers'; // User entered value
      const template = 'default-servers'; // Template default

      expect(resolvePromptField(resource, prompt, template)).toBe('staging-servers');
    });

    it('should handle new node with no changes', () => {
      // User creates new node, hasn't set value
      const resource = undefined; // New node
      const prompt = undefined; // Not set
      const template = 'default-servers'; // Template default

      expect(resolvePromptField(resource, prompt, template)).toBe('default-servers');
    });

    it('should preserve numeric zero as distinct from undefined', () => {
      // User explicitly sets timeout to 0 (disable)
      const resource = 300; // Previous value
      const prompt = 0; // User set to zero
      const template = 600; // Template default

      expect(resolvePromptField(resource, prompt, template)).toBe(0);
    });

    it('should preserve boolean false as distinct from undefined', () => {
      // User explicitly sets diff_mode to false
      const resource = true; // Previous value
      const prompt = false; // User disabled it
      const template = true; // Template default

      expect(resolvePromptField(resource, prompt, template)).toBe(false);
    });
  });
});
