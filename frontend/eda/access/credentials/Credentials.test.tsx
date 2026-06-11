/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { Credentials } from './Credentials';

const mockCredentials = {
  count: 2,
  next: null,
  previous: null,
  page_size: 10,
  page: 1,
  results: [
    {
      id: 1,
      name: 'EDA Credential 1',
      description: 'Test credential',
      username: 'admin',
      credential_type: {
        id: 1,
        name: 'Container Registry',
      },
      created_at: '2023-07-28T18:29:28.512273Z',
      modified_at: '2023-07-28T18:29:28.512286Z',
    },
    {
      id: 2,
      name: 'EDA Credential 2',
      description: 'Another credential',
      username: 'user',
      credential_type: {
        id: 2,
        name: 'GitHub Personal Access Token',
      },
      created_at: '2023-07-28T18:32:34.992501Z',
      modified_at: '2023-07-28T18:32:34.992522Z',
    },
  ],
};

describe('Credentials', () => {
  const server = setupServer();

  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('renders the credentials list', async () => {
    server.use(
      http.get('*/eda-credentials/*', () => {
        return HttpResponse.json(mockCredentials);
      })
    );

    render(
      <MemoryRouter>
        <Credentials />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Credentials')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('EDA Credential 1')).toBeInTheDocument();
    });
  });

  it('displays empty state when no credentials exist and no permission', async () => {
    server.use(
      http.get('*/eda-credentials/*', () => {
        return HttpResponse.json({ count: 0, results: [] });
      })
    );

    render(
      <MemoryRouter>
        <Credentials />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByText(/You do not have permission to create a credential/)
      ).toBeInTheDocument();
    });
  });
});
