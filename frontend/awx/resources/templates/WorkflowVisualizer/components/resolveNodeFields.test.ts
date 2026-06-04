import { describe, expect, test } from 'vitest';
import { resolveArrayField, resolveScalarField, resolveTagField } from './resolveNodeFields';

describe('resolveArrayField', () => {
  const templateDefault = [{ id: 10, name: 'template-cred' }];
  const nodeDbValue = [{ id: 20, name: 'node-cred' }];

  test('should use prompt value when non-empty', () => {
    const prompt = [{ id: 30, name: 'user-cred' }];
    expect(resolveArrayField(prompt, true, false, nodeDbValue, templateDefault)).toEqual(prompt);
  });

  test('should use empty prompt value when field is promptable (user chose none)', () => {
    expect(resolveArrayField([], true, false, nodeDbValue, templateDefault)).toEqual([]);
  });

  test('should fall through empty prompt when not promptable (force-cleared)', () => {
    expect(resolveArrayField([], false, true, nodeDbValue, templateDefault)).toEqual(
      templateDefault
    );
  });

  test('should use template default on template change when prompt undefined', () => {
    expect(resolveArrayField(undefined, false, true, nodeDbValue, templateDefault)).toEqual(
      templateDefault
    );
  });

  test('should use node DB value when no template change and prompt undefined', () => {
    expect(resolveArrayField(undefined, false, false, nodeDbValue, templateDefault)).toEqual(
      nodeDbValue
    );
  });

  test('should use template default when node DB value is empty', () => {
    expect(resolveArrayField(undefined, false, false, [], templateDefault)).toEqual(
      templateDefault
    );
  });

  test('should return undefined when all sources are undefined', () => {
    expect(resolveArrayField(undefined, false, false, undefined, undefined)).toBeUndefined();
  });
});

describe('resolveScalarField', () => {
  test('should use prompt value when defined', () => {
    expect(resolveScalarField('user-limit', false, 'node-limit', 'template-limit')).toBe(
      'user-limit'
    );
  });

  test('should use prompt value even when falsy (0, false)', () => {
    expect(resolveScalarField(0, false, 5, 10)).toBe(0);
    expect(resolveScalarField(false, false, true, true)).toBe(false);
  });

  test('should skip node value and use template default on template change', () => {
    expect(resolveScalarField(undefined, true, 'stale-node', 'template-default')).toBe(
      'template-default'
    );
  });

  test('should use node value when no template change', () => {
    expect(resolveScalarField(undefined, false, 'node-val', 'template-val')).toBe('node-val');
  });

  test('should use template default when node value is null/undefined', () => {
    expect(resolveScalarField(undefined, false, undefined, 'template-val')).toBe('template-val');
    expect(resolveScalarField(undefined, false, null, 'template-val')).toBe('template-val');
  });
});

describe('resolveTagField', () => {
  test('should use prompt tags when non-empty', () => {
    const tags = [{ name: 'tag1' }];
    expect(resolveTagField(tags, true, false, 'old', 'default')).toEqual(tags);
  });

  test('should use empty prompt tags when promptable (user chose none)', () => {
    expect(resolveTagField([], true, false, 'old', 'default')).toEqual([]);
  });

  test('should use template tags on template change', () => {
    const result = resolveTagField(undefined, false, true, 'stale_tag', 'new_tag');
    expect(result).toEqual(expect.arrayContaining([expect.objectContaining({ name: 'new_tag' })]));
  });

  test('should use node tag string when no template change', () => {
    const result = resolveTagField(undefined, false, false, 'node_tag', 'template_tag');
    expect(result).toEqual(expect.arrayContaining([expect.objectContaining({ name: 'node_tag' })]));
  });

  test('should fall through to template tags when node tags are null', () => {
    const result = resolveTagField(undefined, false, false, null, 'template_tag');
    expect(result).toEqual(
      expect.arrayContaining([expect.objectContaining({ name: 'template_tag' })])
    );
  });

  test('should return empty array when all sources are empty', () => {
    expect(resolveTagField(undefined, false, false, '', '')).toEqual([]);
  });

  test('should fall through force-cleared empty tags to template default on template change', () => {
    const result = resolveTagField([], false, true, 'stale', 'default_tag');
    expect(result).toEqual(
      expect.arrayContaining([expect.objectContaining({ name: 'default_tag' })])
    );
  });
});
