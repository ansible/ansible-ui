import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ExecutionEnvironmentActivity } from './ExecutionEnvironmentActivity';

const mockEmptyActivityResponse = {
  meta: {
    count: 0,
  },
  data: [],
  links: {
    first: null,
    last: null,
    next: null,
    previous: null,
  },
};

const mockActivityResponse = {
  meta: { count: 1 },
  data: [
    {
      id: 'history-1',
      added: [
        {
          pulp_id: '1',
          pulp_type: 'container.tag',
          manifest_digest: 'sha256:abc',
          tag_name: 'latest',
        },
      ],
      removed: [],
      number: 1,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
  ],
  links: mockEmptyActivityResponse.links,
};

describe('ExecutionEnvironmentActivity', () => {
  const server = setupServer(
    http.get(
      ({ request }) => {
        return (
          request.url.includes('/v3/plugin/execution-environments/repositories/') &&
          request.url.includes('/_content/history/')
        );
      },
      () => {
        return HttpResponse.json(mockEmptyActivityResponse);
      }
    )
  );

  beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  test('should display empty state when no activities exist', async () => {
    render(
      <MemoryRouter initialEntries={['/execution-environments/test-ee/activity']}>
        <Routes>
          <Route
            path="/execution-environments/:id/activity"
            element={<ExecutionEnvironmentActivity />}
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('No activities yet')).toBeInTheDocument();
    });

    expect(screen.getByText('Activities will appear once you push something')).toBeInTheDocument();
  });

  test('should render activity rows when history exists', async () => {
    server.use(
      http.get(
        ({ request }) =>
          request.url.includes('/v3/plugin/execution-environments/repositories/') &&
          request.url.includes('/_content/history/'),
        () => HttpResponse.json(mockActivityResponse)
      )
    );

    render(
      <MemoryRouter initialEntries={['/execution-environments/test-ee/activity']}>
        <Routes>
          <Route
            path="/execution-environments/:id/activity"
            element={<ExecutionEnvironmentActivity />}
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('latest')).toBeInTheDocument();
    });
    expect(screen.getByText(/was added to/i)).toBeInTheDocument();
  });

  test('should render tag move, removal, and manifest activity types', async () => {
    server.use(
      http.get(
        ({ request }) =>
          request.url.includes('/v3/plugin/execution-environments/repositories/') &&
          request.url.includes('/_content/history/'),
        () =>
          HttpResponse.json({
            meta: { count: 1 },
            data: [
              {
                id: 'history-2',
                added: [
                  {
                    pulp_id: '1',
                    pulp_type: 'container.tag',
                    manifest_digest: 'sha256:new',
                    tag_name: 'latest',
                  },
                  {
                    pulp_id: '2',
                    pulp_type: 'container.manifest',
                    manifest_digest: 'sha256:added-manifest',
                    tag_name: '',
                  },
                ],
                removed: [
                  {
                    pulp_id: '3',
                    pulp_type: 'container.tag',
                    manifest_digest: 'sha256:old',
                    tag_name: 'latest',
                  },
                  {
                    pulp_id: '4',
                    pulp_type: 'container.manifest',
                    manifest_digest: 'sha256:removed-manifest',
                    tag_name: '',
                  },
                  {
                    pulp_id: '5',
                    pulp_type: 'container.tag',
                    manifest_digest: 'sha256:gone',
                    tag_name: 'dev',
                  },
                ],
                number: 2,
                created_at: '2024-01-02T00:00:00Z',
                updated_at: '2024-01-02T00:00:00Z',
              },
            ],
            links: mockEmptyActivityResponse.links,
          })
      )
    );

    render(
      <MemoryRouter initialEntries={['/execution-environments/test-ee/activity']}>
        <Routes>
          <Route
            path="/execution-environments/:id/activity"
            element={<ExecutionEnvironmentActivity />}
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      const table = screen.getByTestId('activities-table');
      expect(table).toHaveTextContent('was moved to');
      expect(table).toHaveTextContent('was removed from');
      expect(table).toHaveTextContent('was added');
      expect(table).toHaveTextContent('was removed');
      expect(table).toHaveTextContent('test-ee was added');
    });
  });

  test('should show load more when additional history pages exist', async () => {
    server.use(
      http.get(
        ({ request }) =>
          request.url.includes('/v3/plugin/execution-environments/repositories/') &&
          request.url.includes('/_content/history/'),
        () =>
          HttpResponse.json({
            ...mockActivityResponse,
            links: { ...mockEmptyActivityResponse.links, next: '/next-page' },
          })
      )
    );

    render(
      <MemoryRouter initialEntries={['/execution-environments/test-ee/activity']}>
        <Routes>
          <Route
            path="/execution-environments/:id/activity"
            element={<ExecutionEnvironmentActivity />}
          />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByRole('button', { name: 'Load more' })).toBeInTheDocument();
  });

  test('should show error state when history request fails', async () => {
    server.use(
      http.get(
        ({ request }) =>
          request.url.includes('/v3/plugin/execution-environments/repositories/') &&
          request.url.includes('/_content/history/'),
        () => HttpResponse.json({ detail: 'History unavailable' }, { status: 500 })
      )
    );

    render(
      <MemoryRouter initialEntries={['/execution-environments/test-ee/activity']}>
        <Routes>
          <Route
            path="/execution-environments/:id/activity"
            element={<ExecutionEnvironmentActivity />}
          />
        </Routes>
      </MemoryRouter>
    );

    expect(
      await screen.findByText(/History unavailable|Something went wrong/i)
    ).toBeInTheDocument();
  });
});
