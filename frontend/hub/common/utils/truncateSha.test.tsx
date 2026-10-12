import { describe, expect, it } from 'vitest';
import { truncateSha } from './truncateSha';

describe('truncateSha', () => {
  it('truncates digest to eight characters after algorithm prefix', () => {
    expect(truncateSha('sha256:abcdef0123456789')).toBe('sha256:abcdef01');
  });
});
