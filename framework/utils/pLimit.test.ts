import { describe, expect, test, vi } from 'vitest';
import pLimit from './pLimit';

describe('pLimit', () => {
  test('limits concurrent executions', async () => {
    const limit = pLimit(2);
    let active = 0;
    let maxActive = 0;

    const task = () =>
      limit(async () => {
        active++;
        maxActive = Math.max(maxActive, active);
        await new Promise((r) => setTimeout(r, 10));
        active--;
      });

    await Promise.all([task(), task(), task(), task()]);
    expect(maxActive).toBeLessThanOrEqual(2);
  });

  test('rejects when concurrency is invalid', () => {
    expect(() => pLimit(0)).toThrow();
  });
});
