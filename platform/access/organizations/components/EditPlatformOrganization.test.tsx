import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { awxAPI } from '@ansible/awx-ui/common/api/awx-utils';
import { PlatformOrganization } from '../../../interfaces/PlatformOrganization';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import { EditPlatformOrganization } from './EditPlatformOrganization';

const mockNavigate = vi.fn();
const mockAddAlert = vi.fn();

vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual('@ansible/ansible-ui-framework');
  return {
    ...actual,
    usePageNavigate: () => mockNavigate,
    usePageAlertToaster: () => ({ addAlert: mockAddAlert }),
  };
});

vi.mock('../../../main/GatewayServices', () => ({
  useHasAwxService: () => true,
}));

const mockPlatformOrganization: Partial<PlatformOrganization> = {
  id: 1,
  name: 'Test Organization',
  description: 'Test Description',
  summary_fields: {
    resource: {
      ansible_id: 'ansible-123',
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

const mockControllerOrganization = {
  id: 100,
  name: 'Test Organization',
  ansible_id: 'ansible-123',
  max_hosts: 100,
};

const mockInstanceGroups = [
  { id: 1, name: 'Instance Group 1' },
  { id: 2, name: 'Instance Group 2' },
];

const mockGalaxyCredentials = [
  { id: 10, name: 'Galaxy Cred 1' },
  { id: 20, name: 'Galaxy Cred 2' },
];

const server = setupServer(
  http.get(gatewayAPI`/organizations/1/`, () => HttpResponse.json(mockPlatformOrganization)),
  http.get(awxAPI`/organizations/`, ({ request }) => {
    const url = new URL(request.url);
    if (url.searchParams.get('resource__ansible_id') === 'ansible-123') {
      return HttpResponse.json({
        count: 1,
        results: [mockControllerOrganization],
        next: null,
        previous: null,
      });
    }
    return HttpResponse.json({ count: 0, results: [], next: null, previous: null });
  }),
  http.get(awxAPI`/organizations/100/galaxy_credentials/`, () =>
    HttpResponse.json({ results: mockGalaxyCredentials })
  ),
  http.get(awxAPI`/organizations/100/instance_groups/`, () =>
    HttpResponse.json({ results: mockInstanceGroups })
  ),
  http.patch(gatewayAPI`/organizations/1/`, () => HttpResponse.json(mockPlatformOrganization)),
  http.patch(awxAPI`/organizations/100/`, () => HttpResponse.json(mockControllerOrganization)),
  http.post(awxAPI`/organizations/100/instance_groups/`, () => HttpResponse.json({ id: 1 })),
  http.post(awxAPI`/organizations/100/galaxy_credentials/`, () => HttpResponse.json({ id: 10 }))
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => {
  server.resetHandlers();
  mockNavigate.mockClear();
  mockAddAlert.mockClear();
});
afterAll(() => server.close());

describe('EditPlatformOrganization', () => {
  it('should load and display organization data from URL params', async () => {
    render(
      <MemoryRouter initialEntries={['/organizations/1/edit']}>
        <Routes>
          <Route path="/organizations/:id/edit" element={<EditPlatformOrganization />} />
        </Routes>
      </MemoryRouter>
    );

    // Verify organization name and description are loaded from API
    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Organization')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument();
    });
  });

  it('should load organization with different ID from URL params', async () => {
    const differentOrg = {
      ...mockPlatformOrganization,
      id: 2,
      name: 'Different Organization',
      description: 'Different Description',
      summary_fields: {
        ...mockPlatformOrganization.summary_fields,
        resource: {
          ansible_id: 'ansible-456',
          resource_type: 'organization',
        },
      },
    };

    server.use(
      http.get(gatewayAPI`/organizations/2/`, () => HttpResponse.json(differentOrg)),
      http.get(awxAPI`/organizations/`, ({ request }) => {
        const url = new URL(request.url);
        if (url.searchParams.get('resource__ansible_id') === 'ansible-456') {
          return HttpResponse.json({
            count: 1,
            results: [{ ...mockControllerOrganization, ansible_id: 'ansible-456' }],
            next: null,
            previous: null,
          });
        }
        return HttpResponse.json({ count: 0, results: [], next: null, previous: null });
      })
    );

    render(
      <MemoryRouter initialEntries={['/organizations/2/edit']}>
        <Routes>
          <Route path="/organizations/:id/edit" element={<EditPlatformOrganization />} />
        </Routes>
      </MemoryRouter>
    );

    // Verify the different organization was loaded
    await waitFor(() => {
      expect(screen.getByDisplayValue('Different Organization')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Different Description')).toBeInTheDocument();
    });
  });

  it('should render form fields after data loads', async () => {
    render(
      <MemoryRouter initialEntries={['/organizations/1/edit']}>
        <Routes>
          <Route path="/organizations/:id/edit" element={<EditPlatformOrganization />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    });
  });

  it('should display edit organization wizard steps', async () => {
    render(
      <MemoryRouter initialEntries={['/organizations/1/edit']}>
        <Routes>
          <Route path="/organizations/:id/edit" element={<EditPlatformOrganization />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getAllByText('Organization details').length).toBeGreaterThan(0);
    });

    expect(screen.getByText('Review')).toBeInTheDocument();
  });
});
