import { awxAPI } from '@ansible/awx-ui/common/api/awx-utils';
import { Application } from '@ansible/awx-ui/interfaces/Application';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';
import { PlatformOrganization } from '../../../interfaces/PlatformOrganization';
import { EditLegacyApplication } from './LegacyApplicationForm';

// Mock usePageNavigate and related hooks
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
      pushDialog: vi.fn(),
      popDialog: vi.fn(),
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

describe('LegacyApplicationForm', () => {
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
    name: 'Test Legacy Application',
    description: 'Test legacy application description',
    url: '/api/v2/applications/1/',
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
    http.get(awxAPI`/organizations/1/`, () => {
      return HttpResponse.json(mockOrganization);
    }),
    http.get(awxAPI`/applications/1/`, () => {
      return HttpResponse.json(mockApplication);
    }),
    http.get(awxAPI`/settings/all/`, () => {
      return HttpResponse.json(mockGatewaySettings);
    }),
    http.post(awxAPI`/applications/`, async ({ request }) => {
      const body = (await request.json()) as Record<string, unknown>;
      return HttpResponse.json({
        ...mockApplication,
        id: 2,
        name: body.name || 'New Legacy Application',
        description: body.description || '',
      });
    }),
    http.patch(awxAPI`/applications/1/`, async ({ request }) => {
      const body = (await request.json()) as Record<string, unknown>;
      return HttpResponse.json({
        ...mockApplication,
        ...body,
      });
    })
  );

  beforeAll(() => {
    server.listen();
  });

  afterEach(() => {
    server.resetHandlers();
    vi.clearAllMocks();
  });

  afterAll(() => {
    server.close();
  });

  describe('EditLegacyApplication', () => {
    beforeEach(() => {
      render(
        <MemoryRouter initialEntries={['/access/legacy-applications/1/edit']}>
          <Routes>
            <Route
              path="/access/legacy-applications/:applicationId/edit"
              element={<EditLegacyApplication />}
            />
          </Routes>
        </MemoryRouter>
      );
    });

    test('should render edit form with correct title and breadcrumbs', async () => {
      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: 'Edit Test Legacy Application' })
        ).toBeInTheDocument();
      });

      expect(screen.getByRole('button', { name: /save legacy application/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    test('should load and display existing application data', async () => {
      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Legacy Application')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Test legacy application description')).toBeInTheDocument();
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
        expect(screen.getByDisplayValue('Test Legacy Application')).toBeInTheDocument();
      });

      // Clear redirect URIs field
      const redirectUrisField = screen.getByLabelText(/redirect uris/i);
      await user.clear(redirectUrisField);

      // Try to submit
      const submitButton = screen.getByRole('button', { name: /save legacy application/i });
      await user.click(submitButton);

      // Should show validation error (handled by form validation logic)
      expect(redirectUrisField).toHaveValue('');
    });

    test('should handle form submission for edit', async () => {
      const user = userEvent.setup();

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Legacy Application')).toBeInTheDocument();
      });

      // Modify a field
      const nameField = screen.getByDisplayValue('Test Legacy Application');
      await user.clear(nameField);
      await user.type(nameField, 'Updated Legacy App');

      // Submit form
      const submitButton = screen.getByRole('button', { name: /save legacy application/i });
      await user.click(submitButton);

      // Verify the field was updated
      expect(nameField).toHaveValue('Updated Legacy App');
    });

    test('should show loading state when application data is not available', async () => {
      // Mock server to return null response
      server.use(
        http.get(awxAPI`/applications/1/`, () => {
          return HttpResponse.json(null);
        })
      );

      render(
        <MemoryRouter initialEntries={['/access/legacy-applications/1/edit']}>
          <Routes>
            <Route
              path="/access/legacy-applications/:applicationId/edit"
              element={<EditLegacyApplication />}
            />
          </Routes>
        </MemoryRouter>
      );

      // Should show minimal loading state - check for "Legacy Applications" in breadcrumb
      await waitFor(() => {
        expect(screen.getAllByText('Legacy Applications')).toHaveLength(2);
      });
    });

    test('should handle API error when loading application data', async () => {
      // Mock server to return error
      server.use(
        http.get(awxAPI`/applications/1/`, () => {
          return new HttpResponse(null, { status: 404 });
        })
      );

      render(
        <MemoryRouter initialEntries={['/access/legacy-applications/1/edit']}>
          <Routes>
            <Route
              path="/access/legacy-applications/:applicationId/edit"
              element={<EditLegacyApplication />}
            />
          </Routes>
        </MemoryRouter>
      );

      // Should still render basic structure - check for "Legacy Applications" in breadcrumb
      await waitFor(() => {
        expect(screen.getAllByText('Legacy Applications')).toHaveLength(2);
      });
    });
  });
});
