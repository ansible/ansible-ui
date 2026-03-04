/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { Organizations } from './Organizations';

const mockOrganizations = {
  count: 2,
  next: null,
  previous: null,
  page_size: 10,
  page: 1,
  results: [
    {
      id: 1,
      name: 'Test Organization 1',
      description: 'First test organization',
      created_at: '2024-07-28T18:29:28.512273Z',
      modified_at: '2024-07-28T18:29:28.512286Z',
    },
    {
      id: 2,
      name: 'Test Organization 2',
      description: 'Second test organization',
      created_at: '2024-07-28T18:32:34.992501Z',
      modified_at: '2024-07-28T18:32:34.992522Z',
    },
  ],
};

describe('Organizations', () => {
  const server = setupServer();

  beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('renders the organizations list', async () => {
    server.use(
      http.get('*/organizations/*', () => {
        return HttpResponse.json(mockOrganizations);
      }),
      http.options('*/organizations/', () => {
        return HttpResponse.json({ actions: { POST: {} } });
      })
    );

    render(
      <MemoryRouter>
        <Organizations />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Organizations')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Test Organization 1')).toBeInTheDocument();
    });
  });

  it('displays empty state', async () => {
    server.use(
      http.get('*/organizations/*', () => {
        return HttpResponse.json({ count: 0, results: [] });
      }),
      http.options('*/organizations/', () => {
        return HttpResponse.json({ actions: { POST: {} } });
      })
    );

    render(
      <MemoryRouter>
        <Organizations />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/no organizations created/i)).toBeInTheDocument();
    });
  });
});
