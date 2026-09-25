import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import useSWR from 'swr';
import { SubscriptionUsageChart } from './SubscriptionUsageChart';

vi.mock('swr');

describe('SubscriptionUsageChart', () => {
  beforeEach(() => {
    vi.mocked(useSWR).mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
    } as never);
  });

  it('rejects failed subscription usage requests', async () => {
    render(<SubscriptionUsageChart period={{ dateRange: [] }} />);
    const fetcher = vi.mocked(useSWR).mock.calls[0]?.[1] as unknown as (
      url: string
    ) => Promise<unknown>;
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500 }));

    await expect(fetcher('/usage')).rejects.toThrow('Subscription usage request failed: 500');
  });

  it('parses successful subscription usage requests', async () => {
    render(<SubscriptionUsageChart period={{ dateRange: [] }} />);
    const fetcher = vi.mocked(useSWR).mock.calls[0]?.[1] as unknown as (
      url: string
    ) => Promise<unknown>;
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({}) })
    );

    await expect(fetcher('/usage')).resolves.toEqual({});
  });
});
