import { describe, expect, it, vi } from 'vitest';
import { pollAwxItemsResponseItem } from './pollAwxItemsResponseItem';

vi.mock('@ansible/common-ui/poll', () => ({
  poll: vi.fn(),
}));

import { poll } from '@ansible/common-ui/poll';

describe('pollAwxItemsResponseItem', () => {
  it('returns the single result when polling succeeds', async () => {
    const item = { id: 1, name: 'done' };
    const response = { count: 1, results: [item] };
    vi.mocked(poll).mockImplementation((_fn, predicate) => {
      expect(predicate(response)).toBe(true);
      return Promise.resolve(response);
    });

    const result = await pollAwxItemsResponseItem('/api/v2/jobs/1/', 5, 1000);
    expect(result).toEqual(item);
    expect(poll).toHaveBeenCalledWith(expect.any(Function), expect.any(Function), 1000, 5);
  });
});
