import { describe, expect, test } from 'vitest';
import { getByPath } from './getByPath';

describe('getByPath', () => {
  test('reads nested properties', () => {
    const data = { foo: { bar: 1 }, list: { a: 'x' } };
    expect(getByPath(data, 'foo.bar')).toBe(1);
    expect(getByPath(data, 'list.a')).toBe('x');
  });

  test('returns undefined for missing paths', () => {
    expect(getByPath({ foo: 1 }, 'foo.bar')).toBeUndefined();
    expect(getByPath({ foo: 1 }, '')).toBeUndefined();
    expect(getByPath({ foo: null as unknown as object }, 'foo.bar')).toBeUndefined();
  });

  test('reads top-level keys', () => {
    expect(getByPath({ name: 'controller' }, 'name')).toBe('controller');
  });

  test('prefers a full path key over nested segments', () => {
    const data = { 'foo.bar': 'literal', foo: { bar: 'nested' } };
    expect(getByPath(data, 'foo.bar')).toBe('literal');
  });
});
