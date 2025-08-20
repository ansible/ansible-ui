import { awxAPI } from '@ansible/awx-ui/common/api/awx-utils';
import { Token } from '@ansible/awx-ui/interfaces/Token';
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, beforeAll, beforeEach, describe, expect, test } from 'vitest';
import { LegacyTokenDetails } from './LegacyTokenDetails';

describe('LegacyTokenDetails', () => {
  const mockToken: Token = {
    id: 1,
    type: 'Access Token',
    url: '/api/v2/tokens/1/',
    token: 'legacy-token-1',
    description: 'Legacy test token description',
    created: '2024-01-01T00:00:00Z',
    modified: '2024-01-01T00:00:00Z',
    user: 1,
    application: 1,
    scope: 'read',
    expires: '2024-12-31T00:00:00Z',
    last_used: null,
    summary_fields: {
      user: {
        id: 1,
        username: 'testuser',
        first_name: 'Test',
        last_name: 'User',
      },
      application: {
        id: 1,
        name: 'Legacy Test Application',
      },
    },
  };

  const server = setupServer(
    http.get(awxAPI`/tokens/1`, () => {
      return HttpResponse.json(mockToken);
    })
  );

  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterAll(() => server.close());

  beforeEach(() => {
    server.resetHandlers();
  });

  test('should render token details when token loads successfully', async () => {
    render(
      <MemoryRouter initialEntries={['/access/legacy-tokens/1']}>
        <Routes>
          <Route path="/access/legacy-tokens/:tokenid" element={<LegacyTokenDetails />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Legacy test token description')).toBeInTheDocument();
      expect(screen.getByText('Read')).toBeInTheDocument();
    });
  });

  test('should show error state when token loading fails', async () => {
    server.use(
      http.get(awxAPI`/tokens/1`, () => {
        return HttpResponse.json({ message: 'Token not found' }, { status: 404 });
      })
    );

    render(
      <MemoryRouter initialEntries={['/access/legacy-tokens/1']}>
        <Routes>
          <Route path="/access/legacy-tokens/:tokenid" element={<LegacyTokenDetails />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Not Found')).toBeInTheDocument();
      expect(screen.getByText('message: Token not found')).toBeInTheDocument();
    });
  });

  test('should render PageDetails with correct columns', async () => {
    render(
      <MemoryRouter initialEntries={['/access/legacy-tokens/1']}>
        <Routes>
          <Route path="/access/legacy-tokens/:tokenid" element={<LegacyTokenDetails />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Legacy test token description')).toBeInTheDocument();
      expect(screen.getByText('Read')).toBeInTheDocument();
    });
  });
});
