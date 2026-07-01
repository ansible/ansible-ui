import { describe, expect, test } from 'vitest';
import { resolveExtraVars } from './resolveExtraVars';

describe('resolveExtraVars', () => {
  describe('prompt value handling', () => {
    test('should use prompt extra_vars when non-empty', () => {
      expect(resolveExtraVars('my_var: value', true, undefined, '---', false)).toBe(
        'my_var: value'
      );
    });

    test('should use empty prompt extra_vars when field is promptable (user cleared it)', () => {
      expect(resolveExtraVars('', true, { old: 'data' }, 'template: default', false)).toBe('');
    });

    test('should fall through empty prompt when not promptable', () => {
      expect(resolveExtraVars('', false, undefined, 'template: default', false)).toBe(
        'template: default'
      );
    });
  });

  describe('template change handling', () => {
    test('should use template extra_vars on template change when prompt undefined', () => {
      expect(resolveExtraVars(undefined, false, { stale: 'data' }, 'new_template: val', true)).toBe(
        'new_template: val'
      );
    });

    test('should use template extra_vars on template change even when node has data', () => {
      expect(resolveExtraVars(undefined, false, { old_var: 'old_val' }, 'new: default', true)).toBe(
        'new: default'
      );
    });

    test('should prefer prompt over template on template change when prompt is provided', () => {
      expect(resolveExtraVars('user: input', true, undefined, 'template: default', true)).toBe(
        'user: input'
      );
    });
  });

  describe('no template change', () => {
    test('should use node extra_data when no template change and prompt undefined', () => {
      const result = resolveExtraVars(undefined, false, { node_var: 'node_val' }, '---', false);
      expect(result).toContain('node_var');
      expect(result).toContain('node_val');
    });

    test('should use template extra_vars when node has no data and prompt undefined', () => {
      expect(resolveExtraVars(undefined, false, undefined, 'template: vars', false)).toBe(
        'template: vars'
      );
    });

    test('should skip empty node extra_data and use template default', () => {
      expect(resolveExtraVars(undefined, false, {}, 'template: default', false)).toBe(
        'template: default'
      );
    });
  });

  describe('edge cases', () => {
    test('should return template default when all inputs are undefined/empty', () => {
      expect(resolveExtraVars(undefined, false, undefined, '---', false)).toBe('---');
    });

    test('should return template default on template change with empty template vars', () => {
      expect(resolveExtraVars(undefined, false, { old: 'data' }, '', true)).toBe('');
    });

    test('should handle node data with nested objects', () => {
      const nodeData = { parent: { child: 'value' } } as unknown as Record<string, unknown>;
      const result = resolveExtraVars(undefined, false, nodeData, '---', false);
      expect(result).toBeDefined();
      expect(result).toContain('parent');
    });
  });
});
