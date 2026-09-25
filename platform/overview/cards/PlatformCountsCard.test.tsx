import { render, screen, waitFor } from '@testing-library/react';
import { awxAPI } from '@ansible/awx-ui/common/api/awx-utils';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from 'vitest';
import useSWR from 'swr';
import { PlatformCountsCard } from './PlatformCountsCard';

vi.mock('@ansible/awx-ui/overview/cards/AwxCountsCard', () => ({
  AwxCountsCard: () => <div data-testid="awx-counts-card">counts</div>,
}));

vi.mock('swr');

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('PlatformCountsCard', () => {
  test('should render nothing while dashboard data is loading', () => {
    server.use(http.get(awxAPI`/dashboard/`, () => new Promise(() => {})));
    const { container } = render(<PlatformCountsCard />);

    expect(container).toBeEmptyDOMElement();
  });

  test('should render AwxCountsCard when dashboard data is available', async () => {
    server.use(
      http.get(awxAPI`/dashboard/`, () =>
        HttpResponse.json({ inventories: { total: 1, failed: 0, host_failed: 0 } })
      )
    );
    render(<PlatformCountsCard />);

    await waitFor(() => {
      expect(screen.getByTestId('awx-counts-card')).toBeInTheDocument();
    });
  });

  test('rejects failed dashboard requests', async () => {
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

  test('parses successful dashboard requests', async () => {
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
