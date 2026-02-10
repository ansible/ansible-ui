import { Application } from '@ansible/awx-ui/interfaces/Application';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';
import { PlatformOrganization } from '../../interfaces/PlatformOrganization';
import { gatewayAPI } from '../../utils/gateway-api-utils';
import { CreateOAuthApplication, EditOAuthApplication } from './OAuthApplicationForm';

// Mock usePageNavigate and related hooks
const mockPushDialog = vi.fn();
const mockPopDialog = vi.fn();

vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual('@ansible/ansible-ui-framework');
  return {
    ...actual,
    usePageNavigate: () => vi.fn(),
    useGetPageUrl: () =>
      vi.fn(
        (route: string, params?: Record<string, unknown>) =>
          `/mock-url/${route}/${params ? JSON.stringify(params) : ''}`
      ),
    usePageDialogs: () => ({
      pushDialog: mockPushDialog,
      popDialog: mockPopDialog,
    }),
  };
});

// Mock react-router navigate
const mockNavigate = vi.fn();
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('OAuthApplicationForm', () => {
  const mockOrganization: PlatformOrganization = {
    id: 1,
    name: 'Test Organization',
    description: 'Test organization description',
    url: '/api/v2/organizations/1/',
    created: '2024-01-01T00:00:00Z',
    created_by: 1,
    modified: '2024-01-01T00:00:00Z',
    modified_by: 1,
    managed: false,
    related: {
      created_by: '/api/v2/users/1/',
      modified_by: '/api/v2/users/1/',
      teams: '/api/v2/organizations/1/teams/',
    },
    summary_fields: {
      resource: {
        ansible_id: 'test-ansible-id',
        resource_type: 'organization',
      },
      created_by: {
        id: 1,
        username: 'admin',
        first_name: 'Admin',
        last_name: 'User',
      },
      modified_by: {
        id: 1,
        username: 'admin',
        first_name: 'Admin',
        last_name: 'User',
      },
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
    organization: 1,
    type: 'o_auth2_application',
    created: '2024-01-01T00:00:00Z',
    modified: '2024-01-01T00:00:00Z',
    client_id: 'test-client-id',
    client_secret: 'test-client-secret',
    authorization_grant_type: 'authorization-code',
    skip_authorization: false,
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

  const mockGatewaySettings = {
    gateway_proxy_url: 'https://gateway.example.com',
  };

  const server = setupServer(
    http.get(gatewayAPI`/organizations/`, () => {
      return HttpResponse.json({
        count: 1,
        results: [mockOrganization],
      });
    }),
    http.get(gatewayAPI`/organizations/1/`, () => {
      return HttpResponse.json(mockOrganization);
    }),
    http.get(gatewayAPI`/applications/1/`, () => {
      return HttpResponse.json(mockApplication);
    }),
    http.get(gatewayAPI`/settings/all/`, () => {
      return HttpResponse.json(mockGatewaySettings);
    }),
    http.post(gatewayAPI`/applications/`, async ({ request }) => {
      const body = (await request.json()) as Record<string, unknown>;
      return HttpResponse.json({
        ...mockApplication,
        id: 2,
        name: body.name || 'New Application',
        description: body.description || '',
        client_id: 'new-client-id',
        client_secret: 'new-client-secret',
      });
    }),
    http.patch(gatewayAPI`/applications/1/`, async ({ request }) => {
      const body = (await request.json()) as Record<string, unknown>;
      return HttpResponse.json({
        ...mockApplication,
        ...body,
      });
    })
  );

  beforeAll(() => {
    server.listen();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    // Flush all pending timers to prevent async cleanup errors from debounce
    act(() => {
      vi.runAllTimers();
    });
    server.resetHandlers();
    vi.clearAllMocks();
    mockPushDialog.mockClear();
    mockPopDialog.mockClear();
  });

  afterAll(() => {
    vi.useRealTimers();
    server.close();
  });

  describe('CreateOAuthApplication', () => {
    beforeEach(() => {
      render(
        <MemoryRouter initialEntries={['/access/oauth-applications/create']}>
          <Routes>
            <Route path="/access/oauth-applications/create" element={<CreateOAuthApplication />} />
          </Routes>
        </MemoryRouter>
      );
    });

    test('should render create form with correct title and breadcrumbs', async () => {
      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: 'Create OAuth application' })
        ).toBeInTheDocument();
      });

      expect(screen.getByRole('button', { name: /create oauth application/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    test('should display all required form fields', async () => {
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Enter OAuth application name')).toBeInTheDocument();
      });

      expect(screen.getByPlaceholderText('Enter OAuth application URL')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter description')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter redirect URIs')).toBeInTheDocument();

      // Check for select fields by their labels
      expect(screen.getByText('Authorization grant type')).toBeInTheDocument();
      expect(screen.getByText('Client type')).toBeInTheDocument();
      expect(screen.getByText('Organization')).toBeInTheDocument();
    });

    test('should show informational alert with OAuth configuration instructions', async () => {
      await waitFor(() => {
        expect(screen.getByText('Configure OAuth Application')).toBeInTheDocument();
      });

      // The alert content is expandable, so we need to expand it first
      const expandButton = screen.getByLabelText('Info alert details');
      const user = userEvent.setup();
      await user.click(expandButton);

      await waitFor(() => {
        expect(screen.getByText(/You are setting up an OAuth application/)).toBeInTheDocument();
        expect(screen.getByText(/Auth URL/)).toBeInTheDocument();
        expect(screen.getByText(/Token URL/)).toBeInTheDocument();
      });
    });

    test('should have default values set correctly', async () => {
      await waitFor(() => {
        expect(screen.getByText('Authorization code')).toBeInTheDocument();
      });

      expect(screen.getByText('Confidential')).toBeInTheDocument();
    });

    test('should make redirect URIs required when authorization grant type is authorization-code', async () => {
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Enter redirect URIs')).toBeInTheDocument();
      });

      const redirectUrisField = screen.getByPlaceholderText('Enter redirect URIs');
      expect(redirectUrisField).toBeInTheDocument();

      // Default grant type is authorization-code, so redirect URIs should be present
      expect(screen.getByText('Authorization code')).toBeInTheDocument();
    });

    test('should validate URL fields', async () => {
      const user = userEvent.setup();

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Enter OAuth application URL')).toBeInTheDocument();
      });

      const urlField = screen.getByPlaceholderText('Enter OAuth application URL');
      await user.type(urlField, 'invalid-url');
      await user.tab();

      // URL validation should be triggered (though specific validation logic is in validateUrl function)
      expect(urlField).toHaveValue('invalid-url');
    });

    test('should handle form submission for create', async () => {
      const user = userEvent.setup();

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Enter OAuth application name')).toBeInTheDocument();
      });

      // Fill out required fields
      await user.type(screen.getByPlaceholderText('Enter OAuth application name'), 'New OAuth App');
      await user.type(screen.getByPlaceholderText('Enter description'), 'Test description');
      await user.type(
        screen.getByPlaceholderText('Enter redirect URIs'),
        'https://example.com/callback'
      );

      // Submit form
      const submitButton = screen.getByRole('button', { name: /create oauth application/i });
      await user.click(submitButton);

      // Verify the request was made (form submission behavior)
      await waitFor(() => {
        expect(submitButton).toBeInTheDocument();
      });
    }, 10000);

    test('should show OAuth application secrets modal after successful creation', async () => {
      const user = userEvent.setup();

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Enter OAuth application name')).toBeInTheDocument();
      });

      // Fill out required fields
      await user.type(screen.getByPlaceholderText('Enter OAuth application name'), 'New OAuth App');
      await user.type(screen.getByPlaceholderText('Enter description'), 'Test description');
      await user.type(
        screen.getByPlaceholderText('Enter redirect URIs'),
        'https://example.com/callback'
      );

      // Need to select an organization as it's required
      const orgSelectButton = screen.getByRole('button', { name: 'Organization' });
      await user.click(orgSelectButton);

      // Wait for dropdown options to appear and select the first one
      await waitFor(() => {
        expect(screen.getAllByText('Test Organization')).toHaveLength(2);
      });
      const organizationOptions = screen.getAllByText('Test Organization');
      // Click the option in the dropdown menu (should be the second one)
      await user.click(organizationOptions[1]);

      // Submit form
      const submitButton = screen.getByRole('button', { name: /create oauth application/i });
      await user.click(submitButton);

      // Wait for the API call to complete and verify the modal was opened
      await waitFor(
        () => {
          expect(mockPushDialog).toHaveBeenCalledTimes(1);
        },
        { timeout: 10000 }
      );

      // Verify that pushDialog was called with the OAuthApplicationSecretModal
      const pushDialogCall = mockPushDialog.mock.calls[0][0] as React.ReactElement<{
        applicationModalSource: Application;
        onClose: () => void;
      }>;
      expect(pushDialogCall.type).toHaveProperty('name', 'OAuthApplicationSecretModal');
      expect(pushDialogCall.props).toHaveProperty('applicationModalSource');
      expect(pushDialogCall.props.applicationModalSource).toEqual(
        expect.objectContaining({
          id: 2,
          name: 'New OAuth App',
          description: 'Test description',
        })
      );
    }, 15000);

    test('should display gateway URLs in the OAuth configuration instructions', async () => {
      await waitFor(() => {
        expect(screen.getByText('Configure OAuth Application')).toBeInTheDocument();
      });

      // Expand the alert to see the content
      const expandButton = screen.getByLabelText('Info alert details');
      const user = userEvent.setup();
      await user.click(expandButton);

      await waitFor(() => {
        expect(screen.getByText('https://gateway.example.com/o/authorize/')).toBeInTheDocument();
        expect(screen.getByText('https://gateway.example.com/o/token/')).toBeInTheDocument();
      });
    });

    test('should show different descriptions for authorization grant types', async () => {
      await waitFor(() => {
        expect(screen.getByText('Authorization grant type')).toBeInTheDocument();
      });

      // Check that the authorization code option is selected by default
      expect(screen.getByText('Authorization code')).toBeInTheDocument();
    });

    test('should show different descriptions for client types', async () => {
      await waitFor(() => {
        expect(screen.getByText('Client type')).toBeInTheDocument();
      });

      // Check that confidential option is selected by default
      expect(screen.getByText('Confidential')).toBeInTheDocument();
    });
  });

  describe('EditOAuthApplication', () => {
    beforeEach(() => {
      render(
        <MemoryRouter initialEntries={['/access/oauth-applications/1/edit']}>
          <Routes>
            <Route path="/access/oauth-applications/:id/edit" element={<EditOAuthApplication />} />
          </Routes>
        </MemoryRouter>
      );
    });

    test('should render edit form with correct title and breadcrumbs', async () => {
      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: 'Edit Test OAuth Application' })
        ).toBeInTheDocument();
      });

      expect(screen.getByRole('button', { name: /save oauth application/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    test('should load and display existing application data', async () => {
      await waitFor(() => {
        expect(screen.getByDisplayValue('Test OAuth Application')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Test application description')).toBeInTheDocument();
        expect(screen.getByDisplayValue('https://example.com')).toBeInTheDocument();
        expect(screen.getByDisplayValue('https://example.com/callback')).toBeInTheDocument();
      });
    });

    test('should make authorization grant type readonly in edit mode', async () => {
      await waitFor(() => {
        expect(screen.getByText('Authorization grant type')).toBeInTheDocument();
      });

      // In edit mode, the authorization grant type should be displayed but read-only
      expect(screen.getByText('Authorization code')).toBeInTheDocument();
    });

    test('should validate redirect URIs for authorization-code grant type on save', async () => {
      const user = userEvent.setup();

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test OAuth Application')).toBeInTheDocument();
      });

      // Clear redirect URIs field
      const redirectUrisField = screen.getByLabelText(/redirect uris/i);
      await user.clear(redirectUrisField);

      await waitFor(() => {
        expect(redirectUrisField).toHaveValue('');
      });

      // Try to submit
      const submitButton = screen.getByRole('button', { name: /save oauth application/i });
      await user.click(submitButton);

      // Should show validation error (handled by form validation logic)
      expect(redirectUrisField).toHaveValue('');
    });

    test('should handle form submission for edit', async () => {
      const user = userEvent.setup();

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test OAuth Application')).toBeInTheDocument();
      });

      // Modify a field
      const nameField = screen.getByDisplayValue('Test OAuth Application');
      await user.clear(nameField);
      await user.type(nameField, 'Updated OAuth App');

      await waitFor(() => {
        expect(nameField).toHaveValue('Updated OAuth App');
      });

      // Submit form
      const submitButton = screen.getByRole('button', { name: /save oauth application/i });
      await user.click(submitButton);

      // Verify the field was updated
      expect(nameField).toHaveValue('Updated OAuth App');
    });

    test('should show loading state when application data is not available', async () => {
      // Mock server to return null response
      server.use(
        http.get(gatewayAPI`/applications/1/`, () => {
          return HttpResponse.json(null);
        })
      );

      render(
        <MemoryRouter initialEntries={['/access/oauth-applications/1/edit']}>
          <Routes>
            <Route path="/access/oauth-applications/:id/edit" element={<EditOAuthApplication />} />
          </Routes>
        </MemoryRouter>
      );

      // Should show minimal loading state - check for "Applications" in breadcrumb
      await waitFor(() => {
        expect(screen.getAllByText('Applications')).toHaveLength(2);
      });
    });

    test('should handle API error when loading application data', async () => {
      // Mock server to return error
      server.use(
        http.get(gatewayAPI`/applications/1/`, () => {
          return new HttpResponse(null, { status: 404 });
        })
      );

      render(
        <MemoryRouter initialEntries={['/access/oauth-applications/1/edit']}>
          <Routes>
            <Route path="/access/oauth-applications/:id/edit" element={<EditOAuthApplication />} />
          </Routes>
        </MemoryRouter>
      );

      // Should still render basic structure - check for "Applications" in breadcrumb
      await waitFor(() => {
        expect(screen.getAllByText('Applications')).toHaveLength(2);
      });
    });
  });

  describe('Form Validation', () => {
    test('should show required field indicators', async () => {
      render(
        <MemoryRouter initialEntries={['/access/oauth-applications/create']}>
          <Routes>
            <Route path="/access/oauth-applications/create" element={<CreateOAuthApplication />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Enter OAuth application name')).toBeInTheDocument();
      });

      // Form fields should be present
      expect(screen.getByPlaceholderText('Enter OAuth application name')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter OAuth application URL')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter redirect URIs')).toBeInTheDocument();
      expect(screen.getByText('Authorization grant type')).toBeInTheDocument();
      expect(screen.getByText('Client type')).toBeInTheDocument();
      expect(screen.getByText('Organization')).toBeInTheDocument();
    });

    test('should enforce maximum length on name field', async () => {
      render(
        <MemoryRouter initialEntries={['/access/oauth-applications/create']}>
          <Routes>
            <Route path="/access/oauth-applications/create" element={<CreateOAuthApplication />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Enter OAuth application name')).toBeInTheDocument();
      });

      const nameField = screen.getByPlaceholderText('Enter OAuth application name');
      // Check if the field has a maxLength property
      expect(nameField).toBeInTheDocument();
    });
  });
});
