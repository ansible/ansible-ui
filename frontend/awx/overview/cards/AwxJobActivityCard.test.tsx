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
});
