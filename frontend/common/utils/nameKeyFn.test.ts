import { describe, expect, it } from 'vitest';
import { idKeyFn, nameKeyFn } from './nameKeyFn';

describe('nameKeyFn', () => {
  it('should return item name', () => {
    expect(nameKeyFn({ name: 'example' })).toBe('example');
  });
});

describe('idKeyFn', () => {
  it('should return item id', () => {
    expect(idKeyFn({ id: 42 })).toBe(42);
    expect(idKeyFn({ id: 'abc' })).toBe('abc');
  });
});
