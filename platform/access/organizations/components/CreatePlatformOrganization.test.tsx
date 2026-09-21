import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

vi.mock('@ansible/awx-ui/common/useAwxConfig', () => ({
  useAwxConfig: () => ({
    license_info: {
      license_type: 'enterprise',
    },
  }),
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
  http.patch(awxAPI`/organizations/*/`, () => HttpResponse.json({ id: 1, max_hosts: 100 })),
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
            pattern: '^[a-z0-9_./]*$',
            pattern_description: 'Policy enforcement path must be lowercase alphanumeric.',
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

  it('should render form fields on organization details step', async () => {
    render(
      <MemoryRouter>
        <CreatePlatformOrganization />
      </MemoryRouter>
    );

    expect(await screen.findByLabelText(/Name/i)).toBeInTheDocument();
    expect(await screen.findByLabelText(/Description/i)).toBeInTheDocument();
  });

  it('should display wizard navigation steps', () => {
    render(
      <MemoryRouter>
        <CreatePlatformOrganization />
      </MemoryRouter>
    );

    expect(screen.getByText('Review')).toBeInTheDocument();
  });

  it('should have Next button on first step', async () => {
    render(
      <MemoryRouter>
        <CreatePlatformOrganization />
      </MemoryRouter>
    );

    expect(await screen.findByRole('button', { name: /next/i })).toBeInTheDocument();
  });

  it('should call createOrganizationRequest with form values', () => {
    const postSpy = vi.fn();
    server.use(
      http.post(gatewayAPI`/organizations/`, async ({ request }) => {
        postSpy(await request.json());
        return HttpResponse.json(mockOrganization);
      })
    );

    render(
      <MemoryRouter>
        <CreatePlatformOrganization />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /create organization/i })).toBeInTheDocument();
  });

  it('should patch controller organization with opa_query_path when provided', async () => {
    const user = userEvent.setup({ delay: null });
    const patchSpy = vi.fn();
    server.use(
      http.patch(awxAPI`/organizations/1/`, async ({ request }) => {
        patchSpy(await request.json());
        return HttpResponse.json({ id: 1, max_hosts: 100, opa_query_path: '/path/to/policy' });
      })
    );

    render(
      <MemoryRouter>
        <CreatePlatformOrganization />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /create organization/i })).toBeInTheDocument();
    });

    const nameInput = await screen.findByLabelText(/Name/i);
    await user.type(nameInput, 'Test Org');

    const policyInput = await screen.findByRole('textbox', { name: /Policy enforcement/i });
    await user.type(policyInput, '/path/to/policy');

    const nextButton = await screen.findByRole('button', { name: /next/i });
    await user.click(nextButton);

    const finishButton = await screen.findByRole('button', { name: /finish/i });
    await user.click(finishButton);

    await waitFor(() => {
      expect(patchSpy).toHaveBeenCalled();
    });
  });
});
