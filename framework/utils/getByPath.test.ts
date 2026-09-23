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
  });
});
