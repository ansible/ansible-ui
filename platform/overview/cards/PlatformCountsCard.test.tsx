import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import useSWR from 'swr';
import { PlatformCountsCard } from './PlatformCountsCard';

vi.mock('swr');

describe('PlatformCountsCard', () => {
  it('rejects failed dashboard requests', async () => {
    vi.mocked(useSWR).mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
    } as never);
    render(<PlatformCountsCard />);
    const fetcher = vi.mocked(useSWR).mock.calls[0]?.[1] as unknown as (
      url: string
    ) => Promise<unknown>;
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 503 }));

    await expect(fetcher('/dashboard')).rejects.toThrow('Dashboard request failed: 503');
  });

  it('parses successful dashboard requests', async () => {
    vi.mocked(useSWR).mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
    } as never);
    render(<PlatformCountsCard />);
    const fetcher = vi.mocked(useSWR).mock.calls[0]?.[1] as unknown as (
      url: string
    ) => Promise<unknown>;
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({}) })
    );

    await expect(fetcher('/dashboard')).resolves.toEqual({});
  });
});
