import { render, screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { awxAPI } from '@ansible/awx-ui/common/api/awx-utils';
import { PlatformOrganization } from '../../../interfaces/PlatformOrganization';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import { CreatePlatformOrganization } from './CreatePlatformOrganization';

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

const mockOrganization: Partial<PlatformOrganization> = {
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

const server = setupServer(
  http.get(gatewayAPI`/organizations/`, () =>
    HttpResponse.json({ count: 0, results: [], next: null, previous: null })
  ),
  http.post(gatewayAPI`/organizations/`, () => HttpResponse.json(mockOrganization)),
  http.get(awxAPI`/organizations/*`, () =>
    HttpResponse.json({
      count: 1,
      results: [{ id: 1, name: 'Test Organization', ansible_id: 'ansible-123' }],
      next: null,
      previous: null,
    })
  ),
  http.post(awxAPI`/organizations/*/instance_groups/`, () => HttpResponse.json({ id: 1 })),
  http.post(awxAPI`/organizations/*/galaxy_credentials/`, () => HttpResponse.json({ id: 1 })),
  http.patch(awxAPI`/organizations/*/`, () => HttpResponse.json({ id: 1, max_hosts: 100 }))
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => {
  server.resetHandlers();
  mockNavigate.mockClear();
});
afterAll(() => server.close());

describe('CreatePlatformOrganization', () => {
  it('should render the organization wizard with title and first step', () => {
    render(
      <MemoryRouter>
        <CreatePlatformOrganization />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /create organization/i })).toBeInTheDocument();
    expect(screen.getAllByText('Organization details').length).toBeGreaterThan(0);
  });

  it('should render form fields on organization details step', () => {
    render(
      <MemoryRouter>
        <CreatePlatformOrganization />
      </MemoryRouter>
    );

    expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
  });

  it('should display wizard navigation steps', () => {
    render(
      <MemoryRouter>
        <CreatePlatformOrganization />
      </MemoryRouter>
    );

    expect(screen.getByText('Review')).toBeInTheDocument();
  });

  it('should have Next button on first step', () => {
    render(
      <MemoryRouter>
        <CreatePlatformOrganization />
      </MemoryRouter>
    );

    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
  });
});
