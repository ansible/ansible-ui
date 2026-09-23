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

  test('returns resolved values from each task', async () => {
    const limit = pLimit(2);
    const results = await Promise.all([
      limit(() => Promise.resolve(1)),
      limit(() => Promise.resolve(2)),
      limit(() => Promise.resolve(3)),
    ]);
    expect(results).toEqual([1, 2, 3]);
  });

  test('rejects when a task throws', async () => {
    const limit = pLimit(1);
    await expect(
      limit(() => Promise.reject(new Error('bulk failed')))
    ).rejects.toThrow('bulk failed');
  });
});
