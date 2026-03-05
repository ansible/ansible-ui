import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { AwxActiveUserProvider } from '../../common/useAwxActiveUser';
import { awxAPI } from '../../common/api/awx-utils';
import { Instances } from './Instances';

const mockInstances = {
  count: 2,
  next: null,
  previous: null,
  results: [
    {
      id: 1,
      type: 'instance',
      hostname: 'controller-1',
      node_type: 'control',
      node_state: 'ready',
      enabled: true,
      managed_by_policy: true,
      capacity: 100,
      percent_capacity_remaining: 90,
      summary_fields: {},
    },
    {
      id: 2,
      type: 'instance',
      hostname: 'receptor-1',
      node_type: 'execution',
      node_state: 'ready',
      enabled: true,
      managed_by_policy: false,
      capacity: 50,
      percent_capacity_remaining: 80,
      summary_fields: {},
    },
  ],
};

const mockInstancesWithControl = {
  count: 1,
  next: null,
  previous: null,
  results: [
    {
      id: 2,
      type: 'instance',
      hostname: 'awx-control',
      node_type: 'control',
      node_state: 'ready',
      enabled: true,
      managed_by_policy: true,
      capacity: 0,
      percent_capacity_remaining: 0,
      summary_fields: {},
    },
  ],
};

const mockInstancesWithHop = {
  count: 1,
  next: null,
  previous: null,
  results: [
    {
      id: 2,
      type: 'instance',
      hostname: 'receptor-hop',
      node_type: 'hop',
      node_state: 'ready',
      enabled: true,
      managed_by_policy: true,
      capacity: 0,
      percent_capacity_remaining: 0,
      summary_fields: {},
    },
  ],
};

const mockEmptyInstances = {
  count: 0,
  next: null,
  previous: null,
  results: [],
};

const instancesOptionsWithPost = {
  actions: {
    POST: {
      name: {
        type: 'string',
        required: true,
        label: 'Name',
        max_length: 512,
        help_text: 'Name of this instance.',
        filterable: true,
      },
    },
  },
};

const instancesOptionsWithoutPost = {
  actions: {},
};

const server = setupServer(
  http.options(awxAPI`/instances/`, () => {
    return HttpResponse.json(instancesOptionsWithPost);
  }),
  http.get(awxAPI`/instances/`, () => {
    return HttpResponse.json(mockInstances);
  }),
  http.get(awxAPI`/settings/system/`, () => {
    return HttpResponse.json({ IS_K8S: true });
  }),
  http.get(awxAPI`/config/`, () => {
    return HttpResponse.json({});
  }),
  http.get(awxAPI`/me/`, () => {
    return HttpResponse.json({
      count: 1,
      results: [{ id: 1, username: 'admin', is_superuser: true, is_system_auditor: false }],
    });
  })
);

function renderInstances() {
  return render(
    <MemoryRouter initialEntries={['/instances']}>
      <AwxActiveUserProvider>
        <Instances />
      </AwxActiveUserProvider>
    </MemoryRouter>
  );
}

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Instances', () => {
  it('should render instances list with page title', async () => {
    renderInstances();

    await waitFor(() => {
      expect(screen.getByText('Instances')).toBeInTheDocument();
    });
  });

  it('should display page description', async () => {
    renderInstances();

    await waitFor(() => {
      expect(
        screen.getByText(
          'Ansible node instances dedicated for a particular purpose indicated by node type.'
        )
      ).toBeInTheDocument();
    });
  });

  it('should display instances in table', async () => {
    renderInstances();

    await waitFor(() => {
      expect(screen.getByText('controller-1')).toBeInTheDocument();
      expect(screen.getByText('receptor-1')).toBeInTheDocument();
    });
  });

  it('should show create instance and remove instance in actions when K8s and user has permission', async () => {
    renderInstances();

    await waitFor(() => {
      expect(screen.getByText('controller-1')).toBeInTheDocument();
    });

    const actionsDropdown = screen.getByTestId('actions-dropdown');
    await userEvent.click(actionsDropdown);

    await waitFor(() => {
      expect(screen.getByTestId('create-instance')).toBeInTheDocument();
      expect(screen.getByTestId('remove-instance')).toBeInTheDocument();
    });
  });

  it('should not show create instance or remove instance when non-K8s system', async () => {
    server.use(
      http.get(awxAPI`/settings/system/`, () => {
        return HttpResponse.json({ IS_K8S: false });
      })
    );

    renderInstances();

    await waitFor(() => {
      expect(screen.getByText('controller-1')).toBeInTheDocument();
    });

    const actionsDropdown = screen.getByTestId('actions-dropdown');
    await userEvent.click(actionsDropdown);

    await waitFor(() => {
      expect(screen.queryByTestId('create-instance')).not.toBeInTheDocument();
      expect(screen.queryByTestId('remove-instance')).not.toBeInTheDocument();
    });
  });

  it('should display empty state with create button when user has permission', async () => {
    server.use(
      http.get(awxAPI`/instances/`, () => {
        return HttpResponse.json(mockEmptyInstances);
      })
    );

    renderInstances();

    await waitFor(() => {
      expect(screen.getByText('There are currently no instances added')).toBeInTheDocument();
      expect(
        screen.getByText('Please create an instance by using the button below.')
      ).toBeInTheDocument();
      expect(screen.getByTestId('create-instance')).toBeInTheDocument();
    });
  });

  it('should display empty state without create button when user lacks permission', async () => {
    server.use(
      http.get(awxAPI`/instances/`, () => {
        return HttpResponse.json(mockEmptyInstances);
      }),
      http.options(awxAPI`/instances/`, () => {
        return HttpResponse.json(instancesOptionsWithoutPost);
      })
    );

    renderInstances();

    await waitFor(() => {
      expect(
        screen.getByText('You do not have permission to create an instance.')
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          'Please contact your organization administrator if there is an issue with your access.'
        )
      ).toBeInTheDocument();
      expect(screen.queryByTestId('create-instance')).not.toBeInTheDocument();
    });
  });

  it('should disable remove instance button when control node is selected', async () => {
    server.use(
      http.get(awxAPI`/instances/`, () => {
        return HttpResponse.json(mockInstancesWithControl);
      })
    );

    renderInstances();

    await waitFor(() => {
      expect(screen.getByText('awx-control')).toBeInTheDocument();
    });

    const checkboxes = screen.getAllByRole('checkbox');
    const rowCheckbox = checkboxes.find((cb) => cb.getAttribute('aria-label')?.includes('Select'));
    await userEvent.click(rowCheckbox ?? checkboxes[0]);

    const actionsDropdown = screen.getByTestId('actions-dropdown');
    await userEvent.click(actionsDropdown);

    const removeButton = screen.getByTestId('remove-instance');
    expect(removeButton).toHaveClass('pf-m-aria-disabled');
  });

  it('should enable remove instance button when execution node is selected', async () => {
    server.use(
      http.get(awxAPI`/instances/`, () => {
        return HttpResponse.json({
          count: 1,
          next: null,
          previous: null,
          results: [
            {
              id: 2,
              type: 'instance',
              hostname: 'receptor-execution',
              node_type: 'execution',
              node_state: 'ready',
              enabled: true,
              managed_by_policy: true,
              summary_fields: {},
            },
          ],
        });
      })
    );

    renderInstances();

    await waitFor(() => {
      expect(screen.getByText('receptor-execution')).toBeInTheDocument();
    });

    const checkboxes = screen.getAllByRole('checkbox');
    const rowCheckbox = checkboxes.find((cb) => cb.getAttribute('aria-label')?.includes('Select'));
    await userEvent.click(rowCheckbox ?? checkboxes[0]);

    const actionsDropdown = screen.getByTestId('actions-dropdown');
    await userEvent.click(actionsDropdown);

    const removeButton = screen.getByTestId('remove-instance');
    expect(removeButton).not.toHaveAttribute('aria-disabled');
  });

  it('should enable remove instance button when hop node is selected', async () => {
    server.use(
      http.get(awxAPI`/instances/`, () => {
        return HttpResponse.json(mockInstancesWithHop);
      })
    );

    renderInstances();

    await waitFor(() => {
      expect(screen.getByText('receptor-hop')).toBeInTheDocument();
    });

    const checkboxes = screen.getAllByRole('checkbox');
    const rowCheckbox = checkboxes.find((cb) => cb.getAttribute('aria-label')?.includes('Select'));
    await userEvent.click(rowCheckbox ?? checkboxes[0]);

    const actionsDropdown = screen.getByTestId('actions-dropdown');
    await userEvent.click(actionsDropdown);

    const removeButton = screen.getByTestId('remove-instance');
    expect(removeButton).not.toHaveAttribute('aria-disabled');
  });
});
