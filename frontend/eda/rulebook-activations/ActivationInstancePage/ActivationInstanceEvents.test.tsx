import {
  PageAlertToasterProvider,
  type IToolbarFilter,
  ToolbarFilterType,
} from '@ansible/ansible-ui-framework';
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { setEdaApiPath } from '../../common/eda-utils';
import { ActivationInstanceEvents } from './ActivationInstanceEvents';

vi.mock('@react-hook/resize-observer', () => ({
  default: vi.fn(),
}));

const requestedQueryParams: URLSearchParams[] = [];

const server = setupServer(
  http.get('*/activation-instances/1/logs/', ({ request }) => {
    const queryParams = new URL(request.url).searchParams;
    requestedQueryParams.push(queryParams);

    if (queryParams.get('ordering') === '-id') {
      return HttpResponse.json({
        count: 5002,
        results: [
          {
            id: 10002,
            log: 'newest filtered log',
            log_timestamp: 5001,
            activation_instance: 1,
          },
          {
            id: 10001,
            log: 'older filtered log',
            log_timestamp: 5001,
            activation_instance: 1,
          },
        ],
      });
    }

    return HttpResponse.json({ count: 5001, results: [] });
  })
);

const toolbarFilters = [
  {
    type: ToolbarFilterType.Search,
    key: 'log',
    label: 'Search',
    query: 'log',
    placeholder: 'Filter by keyword',
  },
] satisfies IToolbarFilter[];

describe('ActivationInstanceEvents', () => {
  beforeAll(() => {
    setEdaApiPath('/api/eda/v1');
    server.listen({ onUnhandledRequest: 'error' });
  });

  beforeEach(() => {
    requestedQueryParams.length = 0;
  });

  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('should fetch one bounded filtered tail in chronological order', async () => {
    render(
      <MemoryRouter initialEntries={['/activations/instances/1']}>
        <Routes>
          <Route
            path="/activations/instances/:instanceId"
            element={
              <ActivationInstanceEvents
                toolbarFilters={toolbarFilters}
                filterState={{ log: ['filtered'] }}
                isFollowModeEnabled={false}
                setIsFollowModeEnabled={vi.fn()}
                isRunning={false}
                refreshToken={0}
              />
            }
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText('newest filtered log')).toBeInTheDocument());

    const logOutput = screen.getByText('newest filtered log').closest('pre')?.parentElement;
    expect(logOutput?.parentElement?.tagName).toBe('SECTION');
    expect(logOutput?.parentElement).not.toHaveClass('pf-v6-c-page__main-body');

    expect(requestedQueryParams).toHaveLength(1);
    expect(requestedQueryParams[0].get('ordering')).toBe('-id');
    expect(requestedQueryParams[0].get('page_size')).toBe('5000');
    expect(requestedQueryParams[0].get('page')).toBeNull();
    expect(requestedQueryParams[0].get('log')).toBe('filtered');

    const olderLogRow = screen.getByText('older filtered log').closest('.output-grid-row');
    const newestLogRow = screen.getByText('newest filtered log').closest('.output-grid-row');
    expect(
      Array.from(document.querySelectorAll('.output-grid-row')).map(
        (row) => row.children[1]?.textContent
      )
    ).toEqual(['older filtered log', 'newest filtered log']);
    expect(olderLogRow?.firstElementChild?.textContent).toBe('5001');
    expect(newestLogRow?.firstElementChild?.textContent).toBe('5002');

    expect(screen.getByRole('button', { name: 'Scroll first' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Scroll last' })).toBeInTheDocument();
  });

  it('should render no logs when the initial count is zero', async () => {
    server.use(
      http.get('*/activation-instances/1/logs/', ({ request }) => {
        const queryParams = new URL(request.url).searchParams;
        requestedQueryParams.push(queryParams);
        return HttpResponse.json({ count: 0, results: [] });
      })
    );

    render(
      <MemoryRouter initialEntries={['/activations/instances/1']}>
        <Routes>
          <Route
            path="/activations/instances/:instanceId"
            element={
              <ActivationInstanceEvents
                toolbarFilters={[]}
                filterState={{}}
                isFollowModeEnabled={false}
                setIsFollowModeEnabled={vi.fn()}
                isRunning={false}
                refreshToken={0}
              />
            }
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(requestedQueryParams).toHaveLength(1);
    });
    expect(requestedQueryParams[0].get('ordering')).toBe('-id');
    expect(requestedQueryParams[0].get('page_size')).toBe('5000');
    expect(screen.queryByText('newest filtered log')).not.toBeInTheDocument();
  });

  it('should reset ID cursors when the filter or refresh token changes', async () => {
    server.use(
      http.get('*/activation-instances/1/logs/', ({ request }) => {
        const queryParams = new URL(request.url).searchParams;
        requestedQueryParams.push(queryParams);
        const log = queryParams.get('log') ?? 'initial';
        return HttpResponse.json({
          count: 1,
          results: [
            { id: log === 'second' ? 2 : 1, log, log_timestamp: 1, activation_instance: 1 },
          ],
        });
      })
    );

    const { rerender } = render(
      <MemoryRouter initialEntries={['/activations/instances/1']}>
        <Routes>
          <Route
            path="/activations/instances/:instanceId"
            element={
              <ActivationInstanceEvents
                toolbarFilters={toolbarFilters}
                filterState={{ log: ['first'] }}
                isFollowModeEnabled={false}
                setIsFollowModeEnabled={vi.fn()}
                isRunning={false}
                refreshToken={0}
              />
            }
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText('first')).toBeInTheDocument());

    rerender(
      <MemoryRouter initialEntries={['/activations/instances/1']}>
        <Routes>
          <Route
            path="/activations/instances/:instanceId"
            element={
              <ActivationInstanceEvents
                toolbarFilters={toolbarFilters}
                filterState={{ log: ['second'] }}
                isFollowModeEnabled={false}
                setIsFollowModeEnabled={vi.fn()}
                isRunning={false}
                refreshToken={1}
              />
            }
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText('second')).toBeInTheDocument());

    expect(requestedQueryParams).toHaveLength(2);
    expect(requestedQueryParams[1].get('id__gt')).toBeNull();
    expect(requestedQueryParams[1].get('id__lt')).toBeNull();
    expect(requestedQueryParams[1].get('ordering')).toBe('-id');
    expect(requestedQueryParams[1].get('log')).toBe('second');
  });

  it('should poll from the newest ID and skip duplicate logs with tied timestamps', async () => {
    server.use(
      http.get('*/activation-instances/1/logs/', ({ request }) => {
        const queryParams = new URL(request.url).searchParams;
        requestedQueryParams.push(queryParams);
        const initialLog = {
          id: 1,
          log: 'initial log',
          log_timestamp: 100,
          activation_instance: 1,
        };

        if (queryParams.get('id__gt') === '1') {
          return HttpResponse.json({
            count: 2,
            results: [
              {
                id: 2,
                log: 'new log one',
                log_timestamp: 100,
                activation_instance: 1,
              },
              {
                id: 1,
                log: 'initial log',
                log_timestamp: 100,
                activation_instance: 1,
              },
            ],
          });
        }

        if (queryParams.get('ordering') === '-id') {
          return HttpResponse.json({ count: 1, results: [initialLog] });
        }

        return HttpResponse.json({ count: 1, results: [] });
      })
    );
    vi.useFakeTimers();

    try {
      render(
        <MemoryRouter initialEntries={['/activations/instances/1']}>
          <Routes>
            <Route
              path="/activations/instances/:instanceId"
              element={
                <ActivationInstanceEvents
                  toolbarFilters={[]}
                  filterState={{}}
                  isFollowModeEnabled={false}
                  setIsFollowModeEnabled={vi.fn()}
                  isRunning={true}
                  refreshToken={0}
                />
              }
            />
          </Routes>
        </MemoryRouter>
      );

      await vi.waitFor(() => {
        expect(screen.getByText('initial log')).toBeInTheDocument();
      });

      await vi.advanceTimersByTimeAsync(5000);

      await vi.waitFor(() => expect(screen.getByText('new log one')).toBeInTheDocument());

      expect(screen.getAllByText('initial log')).toHaveLength(1);
      const pollQuery = requestedQueryParams.find((queryParams) => queryParams.get('id__gt'));
      expect(pollQuery?.get('id__gt')).toBe('1');
      expect(pollQuery?.get('ordering')).toBe('id');
      expect(pollQuery?.get('page_size')).toBe('5000');
    } finally {
      vi.useRealTimers();
    }
  });

  it('should poll from zero when the initial response has no logs', async () => {
    server.use(
      http.get('*/activation-instances/1/logs/', ({ request }) => {
        const queryParams = new URL(request.url).searchParams;
        requestedQueryParams.push(queryParams);

        if (queryParams.get('id__gt') === '0') {
          return HttpResponse.json({
            count: 1,
            results: [{ id: 1, log: 'first log', log_timestamp: 100, activation_instance: 1 }],
          });
        }

        return HttpResponse.json({ count: 0, results: [] });
      })
    );
    vi.useFakeTimers();

    try {
      render(
        <MemoryRouter initialEntries={['/activations/instances/1']}>
          <Routes>
            <Route
              path="/activations/instances/:instanceId"
              element={
                <ActivationInstanceEvents
                  toolbarFilters={[]}
                  filterState={{}}
                  isFollowModeEnabled={false}
                  setIsFollowModeEnabled={vi.fn()}
                  isRunning={true}
                />
              }
            />
          </Routes>
        </MemoryRouter>
      );

      await vi.waitFor(() => expect(requestedQueryParams).toHaveLength(1));
      expect(requestedQueryParams[0].get('ordering')).toBe('-id');

      await vi.advanceTimersByTimeAsync(5000);

      await vi.waitFor(() => expect(screen.getByText('first log')).toBeInTheDocument());

      const pollQuery = requestedQueryParams.find((queryParams) => queryParams.get('id__gt'));
      expect(pollQuery?.get('id__gt')).toBe('0');
      expect(pollQuery?.get('ordering')).toBe('id');
    } finally {
      vi.useRealTimers();
    }
  });

  it('should recreate polling after a running instance is refreshed', async () => {
    let initialRequestCount = 0;
    server.use(
      http.get('*/activation-instances/1/logs/', ({ request }) => {
        const queryParams = new URL(request.url).searchParams;
        requestedQueryParams.push(queryParams);

        if (queryParams.get('id__gt') === '2') {
          return HttpResponse.json({
            count: 3,
            results: [
              { id: 3, log: 'polled after refresh', log_timestamp: 100, activation_instance: 1 },
            ],
          });
        }

        initialRequestCount += 1;
        const id = initialRequestCount === 1 ? 1 : 2;
        return HttpResponse.json({
          count: 1,
          results: [{ id, log: `initial log ${id}`, log_timestamp: 100, activation_instance: 1 }],
        });
      })
    );
    vi.useFakeTimers();

    try {
      const { rerender } = render(
        <MemoryRouter initialEntries={['/activations/instances/1']}>
          <Routes>
            <Route
              path="/activations/instances/:instanceId"
              element={
                <ActivationInstanceEvents
                  toolbarFilters={[]}
                  filterState={{}}
                  isFollowModeEnabled={false}
                  setIsFollowModeEnabled={vi.fn()}
                  isRunning={true}
                  refreshToken={0}
                />
              }
            />
          </Routes>
        </MemoryRouter>
      );

      await vi.waitFor(() => expect(screen.getByText('initial log 1')).toBeInTheDocument());

      rerender(
        <MemoryRouter initialEntries={['/activations/instances/1']}>
          <Routes>
            <Route
              path="/activations/instances/:instanceId"
              element={
                <ActivationInstanceEvents
                  toolbarFilters={[]}
                  filterState={{}}
                  isFollowModeEnabled={false}
                  setIsFollowModeEnabled={vi.fn()}
                  isRunning={true}
                  refreshToken={1}
                />
              }
            />
          </Routes>
        </MemoryRouter>
      );

      await vi.waitFor(() => expect(screen.getByText('initial log 2')).toBeInTheDocument());

      await vi.advanceTimersByTimeAsync(5000);

      await vi.waitFor(() => expect(screen.getByText('polled after refresh')).toBeInTheDocument());

      const pollQuery = requestedQueryParams.find(
        (queryParams) => queryParams.get('id__gt') === '2'
      );
      expect(pollQuery?.get('ordering')).toBe('id');
    } finally {
      vi.useRealTimers();
    }
  });

  it('should continue polling after a full response batch', async () => {
    const firstPollLogs = Array.from({ length: 5000 }, (_, index) => ({
      id: index + 2,
      log: `polled log ${index + 2}`,
      log_timestamp: 100,
      activation_instance: 1,
    }));
    let pollCount = 0;
    server.use(
      http.get('*/activation-instances/1/logs/', ({ request }) => {
        const queryParams = new URL(request.url).searchParams;
        requestedQueryParams.push(queryParams);

        if (queryParams.get('id__gt') === '5001') {
          return HttpResponse.json({
            count: 1,
            results: [
              { id: 5002, log: 'remainder log', log_timestamp: 100, activation_instance: 1 },
            ],
          });
        }
        if (queryParams.get('id__gt') === '1') {
          pollCount += 1;
          return HttpResponse.json({ count: 5001, results: firstPollLogs });
        }
        return HttpResponse.json({
          count: 1,
          results: [{ id: 1, log: 'initial log', log_timestamp: 100, activation_instance: 1 }],
        });
      })
    );
    vi.useFakeTimers();

    try {
      render(
        <MemoryRouter initialEntries={['/activations/instances/1']}>
          <Routes>
            <Route
              path="/activations/instances/:instanceId"
              element={
                <ActivationInstanceEvents
                  toolbarFilters={[]}
                  filterState={{}}
                  isFollowModeEnabled={false}
                  setIsFollowModeEnabled={vi.fn()}
                  isRunning={true}
                />
              }
            />
          </Routes>
        </MemoryRouter>
      );

      await vi.waitFor(() => expect(screen.getByText('initial log')).toBeInTheDocument());
      await vi.advanceTimersByTimeAsync(5000);
      await vi.waitFor(() => expect(pollCount).toBe(1));
      await vi.advanceTimersByTimeAsync(5000);
      await vi.waitFor(() => {
        expect(
          requestedQueryParams.some((queryParams) => queryParams.get('id__gt') === '5001')
        ).toBe(true);
      });
      const pollQueries = requestedQueryParams.filter(
        (queryParams) => queryParams.get('ordering') === 'id'
      );
      expect(pollQueries.map((queryParams) => queryParams.get('id__gt'))).toEqual(['1', '5001']);
      expect(requestedQueryParams.some((queryParams) => queryParams.get('log_timestamp__gt'))).toBe(
        false
      );
    } finally {
      vi.useRealTimers();
    }
  });

  it('should walk backward through multiple bounded batches without gaps or duplicates', async () => {
    const returnedIds: number[] = [];
    const makeLogs = (firstId: number, lastId: number) =>
      Array.from({ length: firstId - lastId + 1 }, (_, index) => {
        const id = firstId - index;
        return {
          id,
          log: `history log ${id}`,
          log_timestamp: 100,
          activation_instance: 1,
        };
      });

    server.use(
      http.get('*/activation-instances/1/logs/', ({ request }) => {
        const queryParams = new URL(request.url).searchParams;
        requestedQueryParams.push(queryParams);

        const oldestId = queryParams.get('id__lt');
        let response = { count: 2000, results: makeLogs(2000, 1) };

        if (oldestId === null) {
          response = { count: 17000, results: makeLogs(17000, 12001) };
        } else if (oldestId === '12001') {
          response = { count: 12000, results: makeLogs(12000, 7001) };
        } else if (oldestId === '7001') {
          response = { count: 7000, results: makeLogs(7000, 2001) };
        }

        returnedIds.push(...response.results.map((log) => log.id));
        return HttpResponse.json(response);
      })
    );

    render(
      <MemoryRouter initialEntries={['/activations/instances/1']}>
        <Routes>
          <Route
            path="/activations/instances/:instanceId"
            element={
              <ActivationInstanceEvents
                toolbarFilters={[]}
                filterState={{}}
                isFollowModeEnabled={false}
                setIsFollowModeEnabled={vi.fn()}
                isRunning={false}
              />
            }
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText('history log 12001')).toBeInTheDocument());
    const scrollContainer = screen.getByText('history log 12001').closest('pre')?.parentElement;
    expect(scrollContainer).toBeTruthy();

    const loadOlderBatch = async (expectedOldestId: number) => {
      scrollContainer?.dispatchEvent(new Event('scroll'));
      await waitFor(() => {
        expect(
          requestedQueryParams.some(
            (queryParams) => queryParams.get('id__lt') === String(expectedOldestId)
          )
        ).toBe(true);
      });
    };

    await loadOlderBatch(12001);
    await loadOlderBatch(7001);
    await loadOlderBatch(2001);

    const olderQueries = requestedQueryParams.filter((queryParams) => queryParams.get('id__lt'));
    expect(olderQueries.map((queryParams) => queryParams.get('id__lt'))).toEqual([
      '12001',
      '7001',
      '2001',
    ]);
    olderQueries.forEach((queryParams) => {
      expect(queryParams.get('ordering')).toBe('-id');
      expect(queryParams.get('page_size')).toBe('5000');
    });
    expect(returnedIds).toHaveLength(17000);
    expect(new Set(returnedIds).size).toBe(17000);
    expect([...returnedIds].sort((left, right) => left - right)).toEqual(
      Array.from({ length: 17000 }, (_, index) => index + 1)
    );

    scrollContainer?.dispatchEvent(new Event('scroll'));
    await new Promise((resolve) => setTimeout(resolve, 25));
    expect(requestedQueryParams.filter((queryParams) => queryParams.get('id__lt'))).toHaveLength(3);
  });

  it('should load older logs when scrolling to the top', async () => {
    server.use(
      http.get('*/activation-instances/1/logs/', ({ request }) => {
        const queryParams = new URL(request.url).searchParams;
        requestedQueryParams.push(queryParams);

        if (queryParams.get('id__lt') === '5001') {
          return HttpResponse.json({
            count: 3,
            results: [
              {
                id: 5001,
                log: 'oldest loaded log',
                log_timestamp: 100,
                activation_instance: 1,
              },
              {
                id: 5000,
                log: 'older log',
                log_timestamp: 100,
                activation_instance: 1,
              },
              {
                id: 4999,
                log: 'oldest log',
                log_timestamp: 100,
                activation_instance: 1,
              },
            ],
          });
        }
        return HttpResponse.json({
          count: 5003,
          results: [
            {
              id: 5003,
              log: 'newest log',
              log_timestamp: 100,
              activation_instance: 1,
            },
            {
              id: 5002,
              log: 'middle log',
              log_timestamp: 100,
              activation_instance: 1,
            },
            {
              id: 5001,
              log: 'oldest loaded log',
              log_timestamp: 100,
              activation_instance: 1,
            },
          ],
        });
      })
    );

    render(
      <MemoryRouter initialEntries={['/activations/instances/1']}>
        <Routes>
          <Route
            path="/activations/instances/:instanceId"
            element={
              <ActivationInstanceEvents
                toolbarFilters={toolbarFilters}
                filterState={{ log: ['filtered'] }}
                isFollowModeEnabled={false}
                setIsFollowModeEnabled={vi.fn()}
                isRunning={false}
                refreshToken={0}
              />
            }
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText('newest log')).toBeInTheDocument());

    const initiallyLoadedRow = screen.getByText('oldest loaded log').closest('.output-grid-row');
    expect(initiallyLoadedRow?.firstElementChild?.textContent).toBe('5001');

    const scrollContainer = screen.getByText('newest log').closest('pre')?.parentElement;
    expect(scrollContainer).toBeTruthy();
    scrollContainer?.dispatchEvent(new Event('scroll'));

    await waitFor(() => expect(screen.getByText('older log')).toBeInTheDocument());
    expect(screen.getAllByText('newest log')).toHaveLength(1);
    const olderQuery = requestedQueryParams.find((queryParams) => queryParams.get('id__lt'));
    expect(olderQuery?.get('id__lt')).toBe('5001');
    expect(olderQuery?.get('ordering')).toBe('-id');
    expect(olderQuery?.get('page_size')).toBe('5000');
    expect(requestedQueryParams.some((queryParams) => queryParams.get('log') === 'filtered')).toBe(
      true
    );
    expect(screen.getAllByText('oldest loaded log')).toHaveLength(1);
    expect(
      screen.getByText('oldest loaded log').closest('.output-grid-row')?.firstElementChild
        ?.textContent
    ).toBe('5001');
    expect(
      screen.getByText('older log').closest('.output-grid-row')?.firstElementChild?.textContent
    ).toBe('5000');
    expect(
      screen.getByText('oldest log').closest('.output-grid-row')?.firstElementChild?.textContent
    ).toBe('4999');
    expect(
      Array.from(document.querySelectorAll('.output-grid-row')).map(
        (row) => row.children[1]?.textContent
      )
    ).toEqual(['oldest log', 'older log', 'oldest loaded log', 'middle log', 'newest log']);
  });

  it('should handle an older-log request failure', async () => {
    server.use(
      http.get('*/activation-instances/1/logs/', ({ request }) => {
        const queryParams = new URL(request.url).searchParams;
        if (queryParams.get('id__lt')) {
          return HttpResponse.json({ detail: 'Unable to load older logs' }, { status: 500 });
        }
        return HttpResponse.json({
          count: 5001,
          results: [
            {
              id: 2,
              log: 'newest log before older-log failure',
              log_timestamp: 2,
              activation_instance: 1,
            },
          ],
        });
      })
    );

    render(
      <PageAlertToasterProvider>
        <MemoryRouter initialEntries={['/activations/instances/1']}>
          <Routes>
            <Route
              path="/activations/instances/:instanceId"
              element={
                <ActivationInstanceEvents
                  toolbarFilters={[]}
                  filterState={{}}
                  isFollowModeEnabled={false}
                  setIsFollowModeEnabled={vi.fn()}
                  isRunning={false}
                  refreshToken={0}
                />
              }
            />
          </Routes>
        </MemoryRouter>
      </PageAlertToasterProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('newest log before older-log failure')).toBeInTheDocument();
    });
    const scrollContainer = screen
      .getByText('newest log before older-log failure')
      .closest('pre')?.parentElement;
    expect(scrollContainer).toBeTruthy();
    scrollContainer?.dispatchEvent(new Event('scroll'));

    expect(await screen.findByText('Failed to load older logs')).toBeInTheDocument();
    expect(screen.getByText('Unable to load older logs')).toBeInTheDocument();
  });

  it('should handle an initial log request failure', async () => {
    server.use(
      http.get('*/activation-instances/1/logs/', () =>
        HttpResponse.json({ detail: 'Unable to load logs' }, { status: 500 })
      )
    );

    render(
      <PageAlertToasterProvider>
        <MemoryRouter initialEntries={['/activations/instances/1']}>
          <Routes>
            <Route
              path="/activations/instances/:instanceId"
              element={
                <ActivationInstanceEvents
                  toolbarFilters={[]}
                  filterState={{}}
                  isFollowModeEnabled={false}
                  setIsFollowModeEnabled={vi.fn()}
                  isRunning={false}
                  refreshToken={0}
                />
              }
            />
          </Routes>
        </MemoryRouter>
      </PageAlertToasterProvider>
    );

    expect(await screen.findByText('Failed to load logs')).toBeInTheDocument();
    expect(screen.getByText('Unable to load logs')).toBeInTheDocument();
  });

  it('should report one polling alert per failure streak and report a later streak', async () => {
    let pollAttempts = 0;
    server.use(
      http.get('*/activation-instances/1/logs/', ({ request }) => {
        const queryParams = new URL(request.url).searchParams;
        if (queryParams.get('id__gt')) {
          pollAttempts += 1;
          if (pollAttempts === 3) {
            return HttpResponse.json({
              count: 2,
              results: [{ id: 2, log: 'recovered log', log_timestamp: 1, activation_instance: 1 }],
            });
          }
          return HttpResponse.json(
            { detail: `Unable to poll logs (${pollAttempts})` },
            { status: 500 }
          );
        }
        if (queryParams.get('ordering') === '-id') {
          return HttpResponse.json({
            count: 1,
            results: [
              {
                id: 1,
                log: 'initial log for polling failure',
                log_timestamp: 1,
                activation_instance: 1,
              },
            ],
          });
        }
        return HttpResponse.json({ count: 1, results: [] });
      })
    );
    vi.useFakeTimers();

    render(
      <PageAlertToasterProvider>
        <MemoryRouter initialEntries={['/activations/instances/1']}>
          <Routes>
            <Route
              path="/activations/instances/:instanceId"
              element={
                <ActivationInstanceEvents
                  toolbarFilters={toolbarFilters}
                  filterState={{ log: ['filtered'] }}
                  isFollowModeEnabled={false}
                  setIsFollowModeEnabled={vi.fn()}
                  isRunning={true}
                  refreshToken={0}
                />
              }
            />
          </Routes>
        </MemoryRouter>
      </PageAlertToasterProvider>
    );

    await vi.waitFor(() => {
      expect(screen.getByText('initial log for polling failure')).toBeInTheDocument();
    });
    await vi.advanceTimersByTimeAsync(5000);
    await vi.waitFor(() => expect(pollAttempts).toBe(1));
    await vi.waitFor(() =>
      expect(screen.getAllByText('Live log updates are temporarily unavailable')).toHaveLength(1)
    );
    expect(screen.getByText('Unable to poll logs (1)')).toBeInTheDocument();

    await vi.advanceTimersByTimeAsync(5000);
    await vi.waitFor(() => expect(pollAttempts).toBe(2));
    await vi.waitFor(() =>
      expect(screen.getAllByText('Live log updates are temporarily unavailable')).toHaveLength(1)
    );

    await vi.advanceTimersByTimeAsync(5000);
    await vi.waitFor(() => expect(screen.getByText('recovered log')).toBeInTheDocument());

    await vi.advanceTimersByTimeAsync(5000);
    await vi.waitFor(() => expect(pollAttempts).toBe(4));
    await vi.waitFor(() =>
      expect(screen.getAllByText('Live log updates are temporarily unavailable')).toHaveLength(2)
    );
    vi.useRealTimers();
  });
});
