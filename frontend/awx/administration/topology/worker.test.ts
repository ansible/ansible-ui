import { describe, expect, it } from 'vitest';
import { SELECTOR } from './worker';

describe('topology layout worker', () => {
  it('should expose the topology selector constant', () => {
    expect(SELECTOR).toBe('#topology');
  });
});
