import { describe, expect, test } from 'vitest';
import { arrayIdsMatch } from './resolveNodeFields';
import { resolveExtraVars } from './resolveExtraVars';

describe('resolveExtraVars', () => {
  const templateVars = 'default_var: template_value';

  describe('unedited node (promptValues undefined)', () => {
    test('should show template defaults when node extra_data is empty object', () => {
      const result = resolveExtraVars(undefined, false, {}, templateVars, false);
      expect(result).toBe(templateVars);
    });

    test('should show template defaults when node extra_data is undefined', () => {
      const result = resolveExtraVars(undefined, false, undefined, templateVars, false);
      expect(result).toBe(templateVars);
    });

    test('should show node override when node has extra_data with keys', () => {
      const result = resolveExtraVars(undefined, false, { my_var: 'val' }, templateVars, false);
      expect(result).toContain('my_var');
    });
  });

  describe('template changed (isTemplateChanged = true)', () => {
    test('should show new template defaults when extra_vars is empty string and not promptable', () => {
      const result = resolveExtraVars('', false, { old_var: 'stale' }, templateVars, true);
      expect(result).toBe(templateVars);
    });

    test('should show empty when extra_vars is empty string and promptable (user chose empty)', () => {
      const result = resolveExtraVars('', true, { old_var: 'stale' }, templateVars, true);
      expect(result).toBe('');
    });

    test('should show user-entered extra_vars when set', () => {
      const result = resolveExtraVars(
        'new_var: fresh',
        true,
        { old_var: 'stale' },
        templateVars,
        true
      );
      expect(result).toBe('new_var: fresh');
    });

    test('should show new template defaults when promptValues.extra_vars is undefined', () => {
      const result = resolveExtraVars(undefined, false, { old_var: 'stale' }, templateVars, true);
      expect(result).toBe(templateVars);
    });
  });

  describe('same template edit (isTemplateChanged = false)', () => {
    test('should preserve user-entered extra_vars', () => {
      const result = resolveExtraVars(
        'user_var: value',
        true,
        { old_var: 'val' },
        templateVars,
        false
      );
      expect(result).toBe('user_var: value');
    });

    test('should show node extra_data when promptValues is undefined and node has data', () => {
      const result = resolveExtraVars(
        undefined,
        true,
        { existing_var: 'val' },
        templateVars,
        false
      );
      expect(result).toContain('existing_var');
    });

    test('should show template defaults when node extra_data is empty', () => {
      const result = resolveExtraVars(undefined, true, {}, templateVars, false);
      expect(result).toBe(templateVars);
    });
  });

  describe('non-promptable template with defaults', () => {
    test('should show template defaults after save clears extra_data to empty object', () => {
      const result = resolveExtraVars(undefined, false, {}, templateVars, false);
      expect(result).toBe(templateVars);
    });

    test('should show template defaults when template has no defaults', () => {
      const result = resolveExtraVars(undefined, false, {}, '', false);
      expect(result).toBe('');
    });
  });
});

describe('arrayIdsMatch', () => {
  test('should return true for two empty arrays', () => {
    expect(arrayIdsMatch([], [])).toBe(true);
  });

  test('should return true when arrays contain same ids in same order', () => {
    expect(arrayIdsMatch([{ id: 1 }, { id: 2 }], [{ id: 1 }, { id: 2 }])).toBe(true);
  });

  test('should return true when arrays contain same ids in different order', () => {
    expect(arrayIdsMatch([{ id: 2 }, { id: 1 }], [{ id: 1 }, { id: 2 }])).toBe(true);
  });

  test('should return false when arrays have different lengths', () => {
    expect(arrayIdsMatch([{ id: 1 }], [{ id: 1 }, { id: 2 }])).toBe(false);
  });

  test('should return false when arrays have same length but different ids', () => {
    expect(arrayIdsMatch([{ id: 1 }, { id: 3 }], [{ id: 1 }, { id: 2 }])).toBe(false);
  });

  test('should return false when one array is empty and the other is not', () => {
    expect(arrayIdsMatch([], [{ id: 1 }])).toBe(false);
    expect(arrayIdsMatch([{ id: 1 }], [])).toBe(false);
  });

  test('should return true for single-element arrays with matching id', () => {
    expect(arrayIdsMatch([{ id: 42 }], [{ id: 42 }])).toBe(true);
  });

  test('should return false for single-element arrays with different ids', () => {
    expect(arrayIdsMatch([{ id: 1 }], [{ id: 2 }])).toBe(false);
  });

  test('should return false when arrays have same length but one contains duplicate ids', () => {
    // arr1 = [{id:1},{id:1}] → Set size 1; arr2 = [{id:1},{id:2}] → Set size 2
    // Passes length check (both 2) but fails Set size check → covers lines 9-11
    expect(arrayIdsMatch([{ id: 1 }, { id: 1 }], [{ id: 1 }, { id: 2 }])).toBe(false);
  });
});
