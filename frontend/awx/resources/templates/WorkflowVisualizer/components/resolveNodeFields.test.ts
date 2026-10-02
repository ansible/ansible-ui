import { describe, expect, test } from 'vitest';
import type { ExecutionEnvironment } from '../../../../interfaces/ExecutionEnvironment';
import {
  resolveArrayField,
  resolveScalar,
  resolveTagField,
  resolveExecutionEnvironment,
  mergeSurveyIntoVariables,
  arrayIdsMatch,
} from './resolveNodeFields';

describe('resolveArrayField', () => {
  const templateDefault = [{ id: 10, name: 'template-cred' }];
  const nodeDbValue = [{ id: 20, name: 'node-cred' }];

  test('should use prompt value when non-empty', () => {
    const prompt = [{ id: 30, name: 'user-cred' }];
    expect(resolveArrayField(prompt, true, nodeDbValue, templateDefault, false)).toEqual(prompt);
  });

  test('should use empty prompt value when field is promptable (user chose none)', () => {
    expect(resolveArrayField([], true, nodeDbValue, templateDefault, false)).toEqual([]);
  });

  test('should fall through empty prompt when not promptable (force-cleared)', () => {
    expect(resolveArrayField([], false, nodeDbValue, templateDefault, true)).toEqual(
      templateDefault
    );
  });

  test('should use template default on template change when prompt undefined', () => {
    expect(resolveArrayField(undefined, false, nodeDbValue, templateDefault, true)).toEqual(
      templateDefault
    );
  });

  test('should use node DB value when no template change and prompt undefined', () => {
    expect(resolveArrayField(undefined, false, nodeDbValue, templateDefault, false)).toEqual(
      nodeDbValue
    );
  });

  test('should use template default when node DB value is empty', () => {
    expect(resolveArrayField(undefined, false, [], templateDefault, false)).toEqual(
      templateDefault
    );
  });

  test('should return undefined when all sources are undefined', () => {
    expect(resolveArrayField(undefined, false, undefined, undefined, false)).toBeUndefined();
  });
});

describe('resolveScalar', () => {
  test('should use prompt value when defined', () => {
    expect(resolveScalar('user-limit', 'node-limit', 'template-limit', false)).toBe('user-limit');
  });

  test('should use prompt value even when falsy (0, false)', () => {
    expect(resolveScalar(0, 5, 10, false)).toBe(0);
    expect(resolveScalar(false, true, true, false)).toBe(false);
  });

  test('should skip node value and use template default on template change', () => {
    expect(resolveScalar(undefined, 'stale-node', 'template-default', true)).toBe(
      'template-default'
    );
  });

  test('should use node value when no template change', () => {
    expect(resolveScalar(undefined, 'node-val', 'template-val', false)).toBe('node-val');
  });

  test('should use template default when node value is undefined', () => {
    expect(resolveScalar(undefined, undefined, 'template-val', false)).toBe('template-val');
  });

  test('should preserve null node value (cleared field)', () => {
    expect(resolveScalar(undefined, null, 'template-val', false)).toBe(null);
  });
});

describe('resolveTagField', () => {
  test('should use prompt tags when non-empty', () => {
    const tags = [{ name: 'tag1' }];
    expect(resolveTagField(tags, true, 'old', 'default', false)).toEqual(tags);
  });

  test('should use empty prompt tags when promptable (user chose none)', () => {
    expect(resolveTagField([], true, 'old', 'default', false)).toEqual([]);
  });

  test('should use template tags on template change', () => {
    const result = resolveTagField(undefined, false, 'stale_tag', 'new_tag', true);
    expect(result).toEqual(expect.arrayContaining([expect.objectContaining({ name: 'new_tag' })]));
  });

  test('should use node tag string when no template change', () => {
    const result = resolveTagField(undefined, false, 'node_tag', 'template_tag', false);
    expect(result).toEqual(expect.arrayContaining([expect.objectContaining({ name: 'node_tag' })]));
  });

  test('should fall through to template tags when node tags are null', () => {
    const result = resolveTagField(undefined, false, null, 'template_tag', false);
    expect(result).toEqual(
      expect.arrayContaining([expect.objectContaining({ name: 'template_tag' })])
    );
  });

  test('should return empty array when all sources are empty', () => {
    expect(resolveTagField(undefined, false, '', '', false)).toEqual([]);
  });

  test('should fall through force-cleared empty tags to template default on template change', () => {
    const result = resolveTagField([], false, 'stale', 'default_tag', true);
    expect(result).toEqual(
      expect.arrayContaining([expect.objectContaining({ name: 'default_tag' })])
    );
  });
});

describe('resolveExecutionEnvironment', () => {
  const fetchedEE = { id: 1, name: 'Fetched EE' } as unknown as ExecutionEnvironment;
  const nodeEE = { id: 2, name: 'Node EE' } as unknown as ExecutionEnvironment;
  const templateEE = { id: 3, name: 'Template EE' } as unknown as ExecutionEnvironment;

  test('should use fetched EE when prompt has an EE selection', () => {
    const promptEE = { id: 1, name: 'Fetched EE' };
    expect(resolveExecutionEnvironment(promptEE, fetchedEE, nodeEE, templateEE, false)).toEqual(
      fetchedEE
    );
  });

  test('should use template EE on template change when no prompt', () => {
    expect(resolveExecutionEnvironment(undefined, undefined, nodeEE, templateEE, true)).toEqual(
      templateEE
    );
  });

  test('should use node EE when no template change and no prompt', () => {
    expect(resolveExecutionEnvironment(undefined, undefined, nodeEE, templateEE, false)).toEqual(
      nodeEE
    );
  });

  test('should fall through to template EE when node EE is undefined', () => {
    expect(resolveExecutionEnvironment(undefined, undefined, undefined, templateEE, false)).toEqual(
      templateEE
    );
  });

  test('should return undefined when all sources are undefined', () => {
    expect(
      resolveExecutionEnvironment(undefined, undefined, undefined, undefined, false)
    ).toBeUndefined();
  });
});

describe('mergeSurveyIntoVariables', () => {
  test('should merge survey values into existing variables', () => {
    const result = mergeSurveyIntoVariables('key1: value1', { key2: 'value2' });
    expect(result).toContain('key1');
    expect(result).toContain('key2');
  });

  test('should override existing keys with survey values', () => {
    const result = mergeSurveyIntoVariables('key1: old', { key1: 'new' });
    expect(result).toContain('new');
  });

  test('should handle undefined variables', () => {
    const result = mergeSurveyIntoVariables(undefined, { key1: 'value1' });
    expect(result).toContain('key1');
  });

  test('should handle empty survey values', () => {
    const result = mergeSurveyIntoVariables('key1: value1', {});
    expect(result).toContain('key1');
  });
});

describe('arrayIdsMatch', () => {
  test('should return true when arrays have same IDs', () => {
    expect(arrayIdsMatch([{ id: 1 }, { id: 2 }], [{ id: 1 }, { id: 2 }])).toBe(true);
  });

  test('should return true when arrays have same IDs in different order', () => {
    expect(arrayIdsMatch([{ id: 2 }, { id: 1 }], [{ id: 1 }, { id: 2 }])).toBe(true);
  });

  test('should return false when arrays have different lengths', () => {
    expect(arrayIdsMatch([{ id: 1 }], [{ id: 1 }, { id: 2 }])).toBe(false);
  });

  test('should return false when arrays have different IDs', () => {
    expect(arrayIdsMatch([{ id: 1 }, { id: 3 }], [{ id: 1 }, { id: 2 }])).toBe(false);
  });

  test('should return true for empty arrays', () => {
    expect(arrayIdsMatch([], [])).toBe(true);
  });
});
