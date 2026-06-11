import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { AwxRecentInventoriesCard } from './AwxRecentInventoriesCard';

const server = setupServer(
  http.get(
    ({ request }) => request.url.includes('inventories') && !request.url.includes('options'),
    () => HttpResponse.json({ count: 0, results: [], next: null, previous: null })
  ),
  http.options(
    ({ request }) => request.url.includes('inventories'),
    () => HttpResponse.json({ actions: { POST: {}, GET: {} } })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('AwxRecentInventoriesCard', () => {
  it('should render Inventories card with title and subtitle', async () => {
    render(
      <MemoryRouter>
        <AwxRecentInventoriesCard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Inventories')).toBeInTheDocument();
    });
    expect(screen.getByText('Recently updated inventories')).toBeInTheDocument();
  });
});
