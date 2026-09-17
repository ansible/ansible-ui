import { type IToolbarFilter, ToolbarFilterType } from '@ansible/ansible-ui-framework';
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

    if (queryParams.get('page') === '2') {
      return HttpResponse.json({
        count: 5001,
        results: [
          {
            id: 5001,
            log: 'newest filtered log',
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

  it('should fetch the filtered last page of logs in chronological order', async () => {
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

    await waitFor(() => {
      expect(screen.getByText('newest filtered log')).toBeInTheDocument();
    });

    const logOutput = screen.getByText('newest filtered log').closest('pre')?.parentElement;
    expect(logOutput?.parentElement?.tagName).toBe('SECTION');
    expect(logOutput?.parentElement).not.toHaveClass('pf-v6-c-page__main-body');

    expect(requestedQueryParams).toHaveLength(2);
    expect(requestedQueryParams[0].get('page_size')).toBe('1');
    expect(requestedQueryParams[0].get('log')).toBe('filtered');
    expect(requestedQueryParams[1].get('page')).toBe('2');
    expect(requestedQueryParams[1].get('page_size')).toBe('5000');
    expect(requestedQueryParams[1].get('log')).toBe('filtered');

    expect(screen.getByRole('button', { name: 'Scroll first' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Scroll last' })).toBeInTheDocument();
  });

  it('should poll from the newest timestamp and skip duplicate logs', async () => {
    server.use(
      http.get('*/activation-instances/1/logs/', ({ request }) => {
        const queryParams = new URL(request.url).searchParams;
        const initialLog = {
          id: 1,
          log: 'initial log',
          log_timestamp: 1,
          activation_instance: 1,
        };

        if (queryParams.get('log_timestamp__gt') === '1') {
          return HttpResponse.json({
            count: 2,
            results: [
              initialLog,
              {
                id: 2,
                log: 'new log',
                log_timestamp: 2,
                activation_instance: 1,
              },
            ],
          });
        }

        if (queryParams.get('page') === '1') {
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

      await vi.waitFor(() => {
        expect(screen.getByText('new log')).toBeInTheDocument();
      });

      expect(screen.getAllByText('initial log')).toHaveLength(1);
    } finally {
      vi.useRealTimers();
    }
  });
});
