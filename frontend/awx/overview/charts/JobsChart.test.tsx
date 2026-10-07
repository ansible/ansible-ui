import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import useSWR from 'swr';
import { JobsChart } from './JobsChart';

vi.mock('swr');
vi.mock('@ansible/ansible-ui-framework/PageDashboard/usePageChartColors', () => ({
  usePageChartColors: () => ({
    successfulColor: '#000',
    failedColor: '#000',
    errorColor: '#000',
    canceledColor: '#000',
  }),
}));
vi.mock('@ansible/ansible-ui-framework/PageNavigation/useGetPageUrl', () => ({
  useGetPageUrl: () => () => '/jobs',
}));
vi.mock('@ansible/ansible-ui-framework/components/EmptyStateError', () => ({
  EmptyStateError: ({ message }: { message?: string }) => <div>{message}</div>,
}));

describe('JobsChart', () => {
  beforeEach(() => {
    vi.mocked(useSWR).mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
    } as never);
  });

  it('rejects failed jobs chart requests', async () => {
    render(
      <MemoryRouter>
        <JobsChart />
      </MemoryRouter>
    );
    const fetcher = vi.mocked(useSWR).mock.calls[0]?.[1] as unknown as (
      url: string
    ) => Promise<unknown>;
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500 }));

    await expect(fetcher('/jobs')).rejects.toThrow('Jobs chart request failed: 500');
  });

  it('parses successful jobs chart requests', async () => {
    render(
      <MemoryRouter>
        <JobsChart />
      </MemoryRouter>
    );
    const fetcher = vi.mocked(useSWR).mock.calls[0]?.[1] as unknown as (
      url: string
    ) => Promise<unknown>;
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({}) })
    );

    await expect(fetcher('/jobs')).resolves.toEqual({});
  });

  it('renders an error state when the request fails', () => {
    vi.mocked(useSWR).mockReturnValue({
      data: undefined,
      error: new Error('Jobs chart unavailable'),
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
    } as never);

    render(
      <MemoryRouter>
        <JobsChart />
      </MemoryRouter>
    );

    expect(document.body).toHaveTextContent('Jobs chart unavailable');
  });
});
