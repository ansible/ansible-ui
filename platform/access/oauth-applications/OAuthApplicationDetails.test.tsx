import { Application } from '@ansible/awx-ui/interfaces/Application';
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { resetTestSwrCache, SwrTestWrapper } from '../../../framework/test-utils/swrTestWrapper';
import { gatewayAPI } from '../../utils/gateway-api-utils';
import { ApplicationDetailInner } from './OAuthApplicationDetails';

const mockOptionsResponse = {
  actions: {
    POST: {
      algorithm: {
        type: 'choice',
        choices: [
          { value: '', display_name: 'No OIDC support' },
          { value: 'RS256', display_name: 'RSA with SHA-2 256' },
          { value: 'HS256', display_name: 'HMAC with SHA-2 256' },
        ],
      },
      client_type: {
        type: 'choice',
        choices: [
          { value: 'confidential', display_name: 'Confidential' },
          { value: 'public', display_name: 'Public' },
        ],
      },
      authorization_grant_type: {
        type: 'choice',
        choices: [
          { value: 'authorization-code', display_name: 'Authorization code' },
          { value: 'password', display_name: 'Resource owner password-based' },
        ],
      },
    },
  },
};

const server = setupServer(
  http.options(gatewayAPI`/applications/`, () => {
    return HttpResponse.json(mockOptionsResponse);
  })
);

beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  resetTestSwrCache();
});
afterAll(() => server.close());

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

describe('ApplicationDetailInner', () => {
  test('should display application name', () => {
    render(<ApplicationDetailInner application={mockApplication} />, { wrapper: SwrTestWrapper });
    expect(screen.getByText('Test OAuth Application')).toBeInTheDocument();
  });

  test('should display organization name', () => {
    render(<ApplicationDetailInner application={mockApplication} />, { wrapper: SwrTestWrapper });
    expect(screen.getByText('Test Organization')).toBeInTheDocument();
  });

  test('should display application URL', () => {
    render(<ApplicationDetailInner application={mockApplication} />, { wrapper: SwrTestWrapper });
    expect(screen.getByText('https://example.com')).toBeInTheDocument();
  });

  test('should display description', () => {
    render(<ApplicationDetailInner application={mockApplication} />, { wrapper: SwrTestWrapper });
    expect(screen.getByText('Test application description')).toBeInTheDocument();
  });

  test('should display authorization grant type from OPTIONS choices', async () => {
    render(<ApplicationDetailInner application={mockApplication} />, { wrapper: SwrTestWrapper });
    await waitFor(() => {
      expect(screen.getByText('Authorization code')).toBeInTheDocument();
    });
  });

  test('should display client type from OPTIONS choices', async () => {
    render(<ApplicationDetailInner application={mockApplication} />, { wrapper: SwrTestWrapper });
    await waitFor(() => {
      expect(screen.getByText('Confidential')).toBeInTheDocument();
    });
  });

  test('should display redirect URIs', () => {
    render(<ApplicationDetailInner application={mockApplication} />, { wrapper: SwrTestWrapper });
    expect(screen.getByText('https://example.com/callback')).toBeInTheDocument();
  });

  test('should display post logout redirect URIs', () => {
    render(<ApplicationDetailInner application={mockApplication} />, { wrapper: SwrTestWrapper });
    expect(screen.getByText('https://example.com/logout')).toBeInTheDocument();
  });

  test('should display "No OIDC support" when algorithm is empty', async () => {
    render(<ApplicationDetailInner application={{ ...mockApplication, algorithm: '' }} />, {
      wrapper: SwrTestWrapper,
    });
    await waitFor(() => {
      expect(screen.getByText('No OIDC support')).toBeInTheDocument();
    });
  });

  test('should display "RSA with SHA-2 256" when algorithm is RS256', async () => {
    render(<ApplicationDetailInner application={{ ...mockApplication, algorithm: 'RS256' }} />, {
      wrapper: SwrTestWrapper,
    });
    await waitFor(() => {
      expect(screen.getByText('RSA with SHA-2 256')).toBeInTheDocument();
    });
  });

  test('should display "HMAC with SHA-2 256" when algorithm is HS256', async () => {
    render(<ApplicationDetailInner application={{ ...mockApplication, algorithm: 'HS256' }} />, {
      wrapper: SwrTestWrapper,
    });
    await waitFor(() => {
      expect(screen.getByText('HMAC with SHA-2 256')).toBeInTheDocument();
    });
  });

  test('should display "No" when skip_authorization is false', () => {
    render(
      <ApplicationDetailInner application={{ ...mockApplication, skip_authorization: false }} />,
      { wrapper: SwrTestWrapper }
    );
    expect(screen.getByTestId('skip-authorization')).toHaveTextContent('No');
  });

  test('should display "Yes" when skip_authorization is true', () => {
    render(
      <ApplicationDetailInner application={{ ...mockApplication, skip_authorization: true }} />,
      { wrapper: SwrTestWrapper }
    );
    expect(screen.getByTestId('skip-authorization')).toHaveTextContent('Yes');
  });

  test('should display "No" when pkce_required is false', () => {
    render(<ApplicationDetailInner application={{ ...mockApplication, pkce_required: false }} />, {
      wrapper: SwrTestWrapper,
    });
    expect(screen.getByTestId('pkce-required')).toHaveTextContent('No');
  });

  test('should display "Yes" when pkce_required is true', () => {
    render(<ApplicationDetailInner application={{ ...mockApplication, pkce_required: true }} />, {
      wrapper: SwrTestWrapper,
    });
    expect(screen.getByTestId('pkce-required')).toHaveTextContent('Yes');
  });

  test('should fall back to raw values when OPTIONS is unavailable', async () => {
    server.use(
      http.options(gatewayAPI`/applications/`, () => {
        return new HttpResponse(null, { status: 403 });
      })
    );

    render(<ApplicationDetailInner application={mockApplication} />, { wrapper: SwrTestWrapper });

    // Without OPTIONS data, getChoiceLabel falls back to the raw API value
    await waitFor(() => {
      expect(screen.getByText('authorization-code')).toBeInTheDocument();
    });
    expect(screen.getByText('confidential')).toBeInTheDocument();
  });
});
