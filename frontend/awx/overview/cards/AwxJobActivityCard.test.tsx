import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { AwxJobActivityCard } from './AwxJobActivityCard';

const mockJobChartData = {
  jobs: {
    failed: [],
    successful: [[Math.floor(Date.now() / 1000), 5]],
    canceled: [],
    error: [],
  },
};

const server = setupServer(
  http.get(
    ({ request }) => request.url.includes('dashboard/graphs/jobs'),
    () => HttpResponse.json(mockJobChartData)
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('AwxJobActivityCard', () => {
  it('should render Job Activity card', async () => {
    render(
      <MemoryRouter>
        <AwxJobActivityCard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Job Activity')).toBeInTheDocument();
    });
  });

  it('should render the current-day chart category from UTC graph buckets', async () => {
    const previousDay = Math.floor(Date.UTC(2025, 8, 30) / 1000);
    const currentDay = Math.floor(Date.UTC(2025, 9, 1) / 1000);

    server.use(
      http.get(
        ({ request }) => request.url.includes('dashboard/graphs/jobs'),
        () =>
          HttpResponse.json({
            jobs: {
              successful: [
                [previousDay, 2],
                [currentDay, 11],
              ],
              failed: [[currentDay, 1]],
              canceled: [],
              error: [],
            },
          })
      )
    );

    render(
      <MemoryRouter>
        <AwxJobActivityCard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('10/1')).toBeInTheDocument();
    });
  });
});
