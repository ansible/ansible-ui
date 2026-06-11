import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { AwxRecentProjectsCard } from './AwxRecentProjectsCard';

const server = setupServer(
  http.get(
    ({ request }) => request.url.includes('projects') && !request.url.includes('options'),
    () => HttpResponse.json({ count: 0, results: [], next: null, previous: null })
  ),
  http.options(
    ({ request }) => request.url.includes('projects'),
    () => HttpResponse.json({ actions: { POST: {}, GET: {} } })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('AwxRecentProjectsCard', () => {
  it('should render Projects card with title and subtitle', async () => {
    render(
      <MemoryRouter>
        <AwxRecentProjectsCard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Projects')).toBeInTheDocument();
    });
    expect(screen.getByText('Recently updated projects')).toBeInTheDocument();
  });
});
