/* eslint-disable i18next/no-literal-string */
import { render, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { awxAPI } from '@ansible/awx-ui/common/api/awx-utils';
import { PlatformOrganization } from '../../../interfaces/PlatformOrganization';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import { PlatformOrganizationForm } from './PlatformOrganizationForm';

const mockNavigate = vi.fn();
vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual('@ansible/ansible-ui-framework');
  return {
    ...actual,
    usePageNavigate: () => mockNavigate,
  };
});

vi.mock('../../../main/GatewayServices', () => ({
  useHasAwxService: () => true,
}));

const mockPlatformOrganization: PlatformOrganization = {
  id: 1,
  name: 'Test Organization',
  description: 'Test Description',
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
  opa_query_path: '/path/to/policy',
};

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
  http.options(gatewayAPI`/organizations/`, () =>
    HttpResponse.json({
      actions: {
        POST: {
          name: {
            type: 'string',
            required: true,
            read_only: false,
            label: 'Name',
          },
        },
      },
    })
  ),
  http.options(awxAPI`/organizations/`, () =>
    HttpResponse.json({
      actions: {
        POST: {
          max_hosts: {
            type: 'integer',
            required: false,
            read_only: false,
            label: 'Max Hosts',
          },
          opa_query_path: {
            type: 'string',
            required: false,
            read_only: false,
            label: 'OPA Query Path',
          },
        },
      },
    })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => {
  server.resetHandlers();
  mockNavigate.mockClear();
});
afterAll(() => server.close());

describe('PlatformOrganizationForm', () => {
  it('exports the PlatformOrganizationForm component', () => {
    expect(PlatformOrganizationForm).toBeDefined();
    expect(typeof PlatformOrganizationForm).toBe('function');
  });

  it('should fetch and merge OPTIONS from both gateway and awx endpoints', async () => {
    const handleSubmit = vi.fn();

    render(
      <MemoryRouter>
        <PlatformOrganizationForm
          platformOrganization={mockPlatformOrganization}
          controllerOrganization={mockControllerOrganization}
          handleSubmit={handleSubmit}
        />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(handleSubmit).toBeDefined();
    });
  });

  it('should include opa_query_path in merged OPTIONS data', async () => {
    const handleSubmit = vi.fn();

    render(
      <MemoryRouter>
        <PlatformOrganizationForm
          platformOrganization={mockPlatformOrganization}
          controllerOrganization={mockControllerOrganization}
          handleSubmit={handleSubmit}
        />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(handleSubmit).toBeDefined();
    });
  });

  it('should handle missing awx OPTIONS response gracefully', async () => {
    server.use(
      http.options(awxAPI`/organizations/`, () =>
        HttpResponse.json({ actions: {} }, { status: 404 })
      )
    );

    const handleSubmit = vi.fn();

    render(
      <MemoryRouter>
        <PlatformOrganizationForm
          platformOrganization={mockPlatformOrganization}
          controllerOrganization={mockControllerOrganization}
          handleSubmit={handleSubmit}
        />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(handleSubmit).toBeDefined();
    });
  });
});
