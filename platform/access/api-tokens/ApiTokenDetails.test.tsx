import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterAll, beforeAll, beforeEach, describe, expect, test } from 'vitest';
import { Token } from '../../interfaces/Token';
import { gatewayAPI } from '../../utils/gateway-api-utils';
import { ApiTokenDetails } from './ApiTokenDetails';

describe('ApiTokenDetails', () => {
  const mockToken: Token = {
    id: 1,
    type: 'o_auth2_access_token',
    url: '/api/v2/tokens/1/',
    token: 'test-token-1',
    description: 'Test token description',
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
        name: 'Test Application',
      },
    },
  };

  const server = setupServer(
    http.get(gatewayAPI`/tokens/1`, () => {
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
      <MemoryRouter initialEntries={['/access/api-tokens/1']}>
        <Routes>
          <Route path="/access/api-tokens/:tokenid" element={<ApiTokenDetails />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test token description')).toBeInTheDocument();
      expect(screen.getByText('Read')).toBeInTheDocument();
    });
  });

  test('should show error state when token loading fails', async () => {
    server.use(
      http.get(gatewayAPI`/tokens/1`, () => {
        return HttpResponse.json({ message: 'Token not found' }, { status: 404 });
      })
    );

    render(
      <MemoryRouter initialEntries={['/access/api-tokens/1']}>
        <Routes>
          <Route path="/access/api-tokens/:tokenid" element={<ApiTokenDetails />} />
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
      <MemoryRouter initialEntries={['/access/api-tokens/1']}>
        <Routes>
          <Route path="/access/api-tokens/:tokenid" element={<ApiTokenDetails />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      // Check that the token details are displayed
      expect(screen.getByText('Test token description')).toBeInTheDocument();
      expect(screen.getByText('Read')).toBeInTheDocument();
    });
  });
});
