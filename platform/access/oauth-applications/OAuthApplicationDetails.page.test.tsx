import { Application } from '@ansible/awx-ui/interfaces/Application';
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';
import { resetTestSwrCache, SwrTestWrapper } from '../../../framework/test-utils/swrTestWrapper';
import { gatewayAPI } from '../../utils/gateway-api-utils';

type UseGetItemResult = {
  data: Application | undefined;
};

const mockUseGetItem = vi.fn<() => UseGetItemResult>();
vi.mock('@ansible/common-ui/crud/useGet', () => ({
  useGetItem: (): UseGetItemResult => mockUseGetItem(),
}));

const mockOptionsResponse = {
  actions: {
    POST: {},
  },
};

const mockApplication: Application = {
  id: 1,
  name: 'Test OAuth Application',
  description: 'Test application description',
  url: '/api/v2/applications/1/',
  app_url: 'https://example.com',
  client_type: 'confidential',
  redirect_uris: 'https://example.com/callback',
  post_logout_redirect_uris: 'https://example.com/logout',
  organization: 1,
  type: 'o_auth2_application',
  created: '2024-01-01T00:00:00Z',
  modified: '2024-01-01T00:00:00Z',
  client_id: 'test-client-id',
  client_secret: 'test-client-secret',
  authorization_grant_type: 'authorization-code',
  skip_authorization: false,
  pkce_required: true,
  algorithm: '',
  summary_fields: {
    user_capabilities: {
      edit: true,
      delete: true,
    },
    organization: {
      id: 1,
      name: 'Test Organization',
      description: 'Test organization description',
    },
  },
};

const server = setupServer(
  http.options(gatewayAPI`/applications/`, () => HttpResponse.json(mockOptionsResponse))
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => {
  server.resetHandlers();
  resetTestSwrCache();
  vi.clearAllMocks();
});
afterAll(() => server.close());

import { OAuthApplicationDetails } from './OAuthApplicationDetails';

describe('OAuthApplicationDetails page', () => {
  beforeEach(() => {
    mockUseGetItem.mockReset();
  });

  test('renders nothing while application is loading', () => {
    mockUseGetItem.mockReturnValue({ data: undefined });
    const { container } = render(
      <MemoryRouter initialEntries={['/applications/1/details']}>
        <Routes>
          <Route
            path="/applications/:applicationId/details"
            element={<OAuthApplicationDetails />}
          />
        </Routes>
      </MemoryRouter>,
      { wrapper: SwrTestWrapper }
    );
    expect(container).toBeEmptyDOMElement();
  });

  test('renders detail content when application loads', async () => {
    mockUseGetItem.mockReturnValue({ data: mockApplication });
    render(
      <MemoryRouter initialEntries={['/applications/1/details']}>
        <Routes>
          <Route
            path="/applications/:applicationId/details"
            element={<OAuthApplicationDetails />}
          />
        </Routes>
      </MemoryRouter>,
      { wrapper: SwrTestWrapper }
    );

    await waitFor(() => {
      expect(screen.getByText('Test OAuth Application')).toBeInTheDocument();
    });
  });
});
