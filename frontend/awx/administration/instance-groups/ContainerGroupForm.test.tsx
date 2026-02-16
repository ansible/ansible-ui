import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { awxAPI } from '../../common/api/awx-utils';
import { CreateContainerGroup, EditContainerGroup } from './ContainerGroupForm';

vi.mock('@ansible/ansible-ui-framework/components/DataEditor', () => {
  const FakeDataEditor = vi.fn(
    (props: Record<string, string | number | boolean | (() => void) | undefined>) => (
      <textarea
        id={props.id as string}
        name={props.name as string}
        value={props.value as string}
        onChange={props.onChange as () => void}
        data-testid={props.id as string}
      />
    )
  );
  return { DataEditor: FakeDataEditor };
});

const instanceGroupOptions = {
  name: 'Instance Groups',
  actions: {
    POST: {
      name: { type: 'string', required: true, label: 'Name', max_length: 250 },
      credential: { type: 'id', required: false, label: 'Credential' },
      max_concurrent_jobs: { type: 'integer', default: 0 },
      max_forks: { type: 'integer', default: 0 },
      is_container_group: { type: 'boolean' },
      pod_spec_override: {
        type: 'string',
        default: {
          apiVersion: 'v1',
          kind: 'Pod',
          metadata: { namespace: 'dev-ui' },
          spec: {
            serviceAccountName: 'default',
            automountServiceAccountToken: false,
            containers: [
              {
                image: 'quay.io/ansible/awx-ee:latest',
                name: 'worker',
                args: ['ansible-runner', 'worker', '--private-data-dir=/runner'],
                resources: { requests: { cpu: '250m', memory: '100Mi' } },
              },
            ],
          },
        },
      },
    },
  },
};

const mockCredentials = {
  count: 2,
  next: null,
  previous: null,
  results: [
    {
      id: 187,
      name: 'E2E Credential ARWM',
      kind: 'kubernetes_bearer_token',
      credential_type: 17,
      summary_fields: {
        credential_type: { id: 17, name: 'Kubernetes/OpenShift API Bearer Token' },
      },
    },
    {
      id: 23,
      name: 'Other Credential',
      kind: 'ssh',
      credential_type: 1,
      summary_fields: {
        credential_type: { id: 1, name: 'Machine' },
      },
    },
  ],
};

const mockContainerGroup = {
  id: 1,
  type: 'instance_group',
  name: 'Test Container Group',
  max_concurrent_jobs: 23,
  max_forks: 12,
  is_container_group: true,
  credential: null,
  pod_spec_override: '',
  summary_fields: {
    user_capabilities: { edit: true, delete: true },
  },
};

const server = setupServer(
  http.options(awxAPI`/instance_groups/`, () => HttpResponse.json(instanceGroupOptions)),
  http.get(awxAPI`/instance_groups/1/`, () => HttpResponse.json(mockContainerGroup)),
  http.get(
    ({ request }) => request.url.includes('/credentials/'),
    () => HttpResponse.json(mockCredentials)
  ),
  http.options(
    ({ request }) => request.url.includes('/credentials/'),
    () => HttpResponse.json({ actions: {} })
  ),
  http.get(
    ({ request }) => request.url.includes('/credential_types/'),
    () =>
      HttpResponse.json({
        count: 1,
        results: [
          {
            id: 17,
            name: 'Kubernetes/OpenShift API Bearer Token',
            kind: 'kubernetes_bearer_token',
          },
        ],
      })
  ),
  http.post(awxAPI`/instance_groups/`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json(
      {
        id: 999,
        ...body,
      },
      { status: 201 }
    );
  }),
  http.patch(awxAPI`/instance_groups/1/`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({
      ...mockContainerGroup,
      ...body,
    });
  })
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('ContainerGroupForm', () => {
  describe('CreateContainerGroup', () => {
    it('should render create form with correct title', async () => {
      render(
        <MemoryRouter initialEntries={['/instance-groups/container-group/create']}>
          <Routes>
            <Route
              path="/instance-groups/container-group/create"
              element={<CreateContainerGroup />}
            />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('page-title')).toHaveTextContent('Create container group');
      });
    });

    it('should display form fields', async () => {
      render(
        <MemoryRouter initialEntries={['/instance-groups/container-group/create']}>
          <Routes>
            <Route
              path="/instance-groups/container-group/create"
              element={<CreateContainerGroup />}
            />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('name')).toBeInTheDocument();
      });

      expect(screen.getByTestId('credential')).toBeInTheDocument();
      expect(screen.getByTestId('max-concurrent-jobs')).toBeInTheDocument();
      expect(screen.getByTestId('max-forks')).toBeInTheDocument();
    });
  });

  describe('EditContainerGroup', () => {
    it('should render edit form with correct title', async () => {
      render(
        <MemoryRouter initialEntries={['/instance-groups/container-group/1/edit']}>
          <Routes>
            <Route
              path="/instance-groups/container-group/:id/edit"
              element={<EditContainerGroup />}
            />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('page-title')).toHaveTextContent('Edit Test Container Group');
      });
    });

    it('should preload form with current values', async () => {
      render(
        <MemoryRouter initialEntries={['/instance-groups/container-group/1/edit']}>
          <Routes>
            <Route
              path="/instance-groups/container-group/:id/edit"
              element={<EditContainerGroup />}
            />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('name')).toHaveValue('Test Container Group');
      });

      expect(screen.getByTestId('max-concurrent-jobs')).toHaveValue(23);
      expect(screen.getByTestId('max-forks')).toHaveValue(12);
    });

    it('should submit edit form with correct body', async () => {
      const user = userEvent.setup();
      let patchBody: Record<string, unknown> = {};

      server.use(
        http.patch(awxAPI`/instance_groups/1/`, async ({ request }) => {
          patchBody = (await request.json()) as Record<string, unknown>;
          return HttpResponse.json({
            ...mockContainerGroup,
            ...patchBody,
          });
        })
      );

      render(
        <MemoryRouter initialEntries={['/instance-groups/container-group/1/edit']}>
          <Routes>
            <Route
              path="/instance-groups/container-group/:id/edit"
              element={<EditContainerGroup />}
            />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('name')).toHaveValue('Test Container Group');
      });

      await user.clear(screen.getByTestId('name'));
      await user.type(screen.getByTestId('name'), 'Test name- edited');
      await user.clear(screen.getByTestId('max-concurrent-jobs'));
      await user.type(screen.getByTestId('max-concurrent-jobs'), '3');
      await user.clear(screen.getByTestId('max-forks'));
      await user.type(screen.getByTestId('max-forks'), '4');

      await user.click(screen.getByRole('button', { name: /^Save container group$/ }));

      await waitFor(() => {
        expect(patchBody).toMatchObject({
          name: 'Test name- edited',
          max_concurrent_jobs: 3,
          max_forks: 4,
        });
      });
    });
  });
});
