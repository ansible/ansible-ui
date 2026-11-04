import { describe, expect, it, vi } from 'vitest';
import { pollAwxItemsResponseItem } from './pollAwxItemsResponseItem';

vi.mock('@ansible/common-ui/crud/Data', () => ({
  requestGet: vi.fn(),
}));

vi.mock('@ansible/common-ui/poll', () => ({
  poll: vi.fn(),
}));

import { poll } from '@ansible/common-ui/poll';

describe('pollAwxItemsResponseItem', () => {
  it('returns the single result when polling succeeds', async () => {
    const item = { id: 1, name: 'done' };
    vi.mocked(poll).mockImplementation(async (fn, predicate) => {
      await fn();
      expect(predicate({ count: 1, results: [item] })).toBe(true);
      return { count: 1, results: [item] };
    });

    const result = await pollAwxItemsResponseItem('/api/v2/jobs/1/', 5, 1000);
    expect(result).toEqual(item);
    expect(poll).toHaveBeenCalledWith(expect.any(Function), expect.any(Function), 1000, 5);
  });
});
