import { describe, expect, it } from 'vitest';
import { pLimit } from './pLimit';

describe('pLimit', () => {
  it('should run at most the given number of tasks at once', async () => {
    const limit = pLimit(2);
    let active = 0;
    let maxActive = 0;

    const task = async () => {
      active += 1;
      maxActive = Math.max(maxActive, active);
      await Promise.resolve();
      active -= 1;
    };

    await Promise.all([limit(task), limit(task), limit(task), limit(task)]);
    expect(maxActive).toBe(2);
  });
});
