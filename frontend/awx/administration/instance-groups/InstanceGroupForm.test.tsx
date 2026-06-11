import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { awxAPI } from '../../common/api/awx-utils';
import { CreateInstanceGroup, EditInstanceGroup } from './InstanceGroupForm';

const mockInstanceGroup = {
  id: 1,
  type: 'instance_group',
  name: 'controlplane',
  policy_instance_minimum: 0,
  policy_instance_percentage: 100,
  max_concurrent_jobs: 23,
  max_forks: 12,
  is_container_group: false,
  summary_fields: {
    user_capabilities: { edit: true, delete: true },
  },
};

const server = setupServer(
  http.get(awxAPI`/instance_groups/1/`, () => HttpResponse.json(mockInstanceGroup)),
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
      ...mockInstanceGroup,
      ...body,
    });
  })
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('InstanceGroupForm', () => {
  describe('CreateInstanceGroup', () => {
    it('should render create form with correct title', async () => {
      render(
        <MemoryRouter initialEntries={['/instance-groups/instance-group/create']}>
          <Routes>
            <Route
              path="/instance-groups/instance-group/create"
              element={<CreateInstanceGroup />}
            />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('page-title')).toHaveTextContent('Create instance group');
      });
    });

    it('should display form fields', async () => {
      render(
        <MemoryRouter initialEntries={['/instance-groups/instance-group/create']}>
          <Routes>
            <Route
              path="/instance-groups/instance-group/create"
              element={<CreateInstanceGroup />}
            />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('name')).toBeInTheDocument();
      });

      expect(screen.getByTestId('policy-instance-minimum')).toBeInTheDocument();
      expect(screen.getByTestId('policy-instance-percentage')).toBeInTheDocument();
      expect(screen.getByTestId('max-concurrent-jobs')).toBeInTheDocument();
      expect(screen.getByTestId('max-forks')).toBeInTheDocument();
    });

    it('should submit create form with correct body', async () => {
      const user = userEvent.setup();
      let postBody: Record<string, unknown> = {};

      server.use(
        http.post(awxAPI`/instance_groups/`, async ({ request }) => {
          postBody = (await request.json()) as Record<string, unknown>;
          return HttpResponse.json(
            {
              id: 999,
              ...postBody,
            },
            { status: 201 }
          );
        })
      );

      render(
        <MemoryRouter initialEntries={['/instance-groups/instance-group/create']}>
          <Routes>
            <Route
              path="/instance-groups/instance-group/create"
              element={<CreateInstanceGroup />}
            />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('name')).toBeInTheDocument();
      });

      await user.type(screen.getByTestId('name'), 'Test name');
      await user.clear(screen.getByTestId('policy-instance-minimum'));
      await user.type(screen.getByTestId('policy-instance-minimum'), '1');
      await user.clear(screen.getByTestId('policy-instance-percentage'));
      await user.type(screen.getByTestId('policy-instance-percentage'), '2');
      await user.clear(screen.getByTestId('max-concurrent-jobs'));
      await user.type(screen.getByTestId('max-concurrent-jobs'), '3');
      await user.clear(screen.getByTestId('max-forks'));
      await user.type(screen.getByTestId('max-forks'), '4');

      await user.click(screen.getByRole('button', { name: /^Create instance group$/ }));

      await waitFor(() => {
        expect(postBody).toEqual({
          name: 'Test name',
          policy_instance_minimum: 1,
          policy_instance_percentage: 2,
          max_concurrent_jobs: 3,
          max_forks: 4,
        });
      });
    });
  });

  describe('EditInstanceGroup', () => {
    it('should render edit form with correct title', async () => {
      render(
        <MemoryRouter initialEntries={['/instance-groups/instance-group/1/edit']}>
          <Routes>
            <Route
              path="/instance-groups/instance-group/:id/edit"
              element={<EditInstanceGroup />}
            />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('page-title')).toHaveTextContent('Edit controlplane');
      });
    });

    it('should preload form with current values', async () => {
      render(
        <MemoryRouter initialEntries={['/instance-groups/instance-group/1/edit']}>
          <Routes>
            <Route
              path="/instance-groups/instance-group/:id/edit"
              element={<EditInstanceGroup />}
            />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('name')).toHaveValue('controlplane');
      });

      expect(screen.getByTestId('policy-instance-minimum')).toHaveValue(0);
      expect(screen.getByTestId('policy-instance-percentage')).toHaveValue(100);
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
            ...mockInstanceGroup,
            ...patchBody,
          });
        })
      );

      render(
        <MemoryRouter initialEntries={['/instance-groups/instance-group/1/edit']}>
          <Routes>
            <Route
              path="/instance-groups/instance-group/:id/edit"
              element={<EditInstanceGroup />}
            />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('name')).toHaveValue('controlplane');
      });

      await user.clear(screen.getByTestId('name'));
      await user.type(screen.getByTestId('name'), 'Test name- edited');
      await user.clear(screen.getByTestId('policy-instance-minimum'));
      await user.type(screen.getByTestId('policy-instance-minimum'), '1');
      await user.clear(screen.getByTestId('policy-instance-percentage'));
      await user.type(screen.getByTestId('policy-instance-percentage'), '2');
      await user.clear(screen.getByTestId('max-concurrent-jobs'));
      await user.type(screen.getByTestId('max-concurrent-jobs'), '3');
      await user.clear(screen.getByTestId('max-forks'));
      await user.type(screen.getByTestId('max-forks'), '4');

      await user.click(screen.getByTestId('Submit'));

      await waitFor(() => {
        expect(patchBody).toMatchObject({
          name: 'Test name- edited',
          policy_instance_minimum: 1,
          policy_instance_percentage: 2,
          max_concurrent_jobs: 3,
          max_forks: 4,
        });
      });
    });
  });
});
