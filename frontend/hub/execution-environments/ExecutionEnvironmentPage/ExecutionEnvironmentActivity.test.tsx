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
});
