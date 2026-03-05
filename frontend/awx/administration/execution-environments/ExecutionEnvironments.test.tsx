import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { awxAPI } from '../../common/api/awx-utils';
import { ExecutionEnvironments } from './ExecutionEnvironments';

const mockExecutionEnvironments = {
  count: 2,
  next: null,
  previous: null,
  results: [
    {
      id: 1,
      type: 'execution_environment',
      name: 'Control Plane EE',
      description: '',
      image: 'quay.io/ansible/awx-ee:latest',
      managed: true,
      pull: '',
      credential: null,
      organization: null,
      summary_fields: {
        user_capabilities: { edit: false, delete: false },
      },
    },
    {
      id: 2,
      type: 'execution_environment',
      name: 'Custom EE',
      description: 'A custom execution environment',
      image: 'quay.io/custom/ee:v1',
      managed: false,
      pull: 'always',
      credential: null,
      organization: 1,
      summary_fields: {
        user_capabilities: { edit: true, delete: true },
        organization: { id: 1, name: 'Default' },
      },
    },
  ],
};

const emptyExecutionEnvironments = {
  count: 0,
  next: null,
  previous: null,
  results: [],
};

const optionsWithCreatePermission = {
  actions: {
    POST: {
      name: { type: 'string', required: true, label: 'Name', max_length: 255 },
    },
  },
};

const optionsWithoutCreatePermission = {
  actions: {},
};

const server = setupServer(
  http.options(awxAPI`/execution_environments/`, () => {
    return HttpResponse.json(optionsWithoutCreatePermission);
  }),
  http.get(awxAPI`/execution_environments/`, () => {
    return HttpResponse.json(mockExecutionEnvironments);
  }),
  http.get(awxAPI`/config/`, () => {
    return HttpResponse.json({ version: '4.5.0' });
  })
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('ExecutionEnvironments', () => {
  it('should render execution environments list', async () => {
    render(
      <MemoryRouter>
        <ExecutionEnvironments />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Execution Environments')).toBeInTheDocument();
    });
  });

  it('should display execution environments in table', async () => {
    render(
      <MemoryRouter>
        <ExecutionEnvironments />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Control Plane EE')).toBeInTheDocument();
      expect(screen.getByText('Custom EE')).toBeInTheDocument();
    });
  });

  it('should display error state when execution environments fail to load', async () => {
    server.use(
      http.get(awxAPI`/execution_environments/`, () => {
        return HttpResponse.json({ detail: 'Server error' }, { status: 500 });
      })
    );

    render(
      <MemoryRouter>
        <ExecutionEnvironments />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Error loading execution environments')).toBeInTheDocument();
    });
  });

  it('should display empty state with create button when user has permission', async () => {
    server.use(
      http.get(awxAPI`/execution_environments/`, () => {
        return HttpResponse.json(emptyExecutionEnvironments);
      }),
      http.options(awxAPI`/execution_environments/`, () => {
        return HttpResponse.json(optionsWithCreatePermission);
      })
    );

    render(
      <MemoryRouter>
        <ExecutionEnvironments />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('No execution environments yet')).toBeInTheDocument();
      expect(
        screen.getByText('To get started, create an execution environment.')
      ).toBeInTheDocument();
      expect(
        screen.getByRole('link', { name: /Create execution environment/ })
      ).toBeInTheDocument();
    });
  });

  it('should display empty state without create button when user lacks permission', async () => {
    server.use(
      http.get(awxAPI`/execution_environments/`, () => {
        return HttpResponse.json(emptyExecutionEnvironments);
      }),
      http.options(awxAPI`/execution_environments/`, () => {
        return HttpResponse.json(optionsWithoutCreatePermission);
      })
    );

    render(
      <MemoryRouter>
        <ExecutionEnvironments />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByText('You do not have permission to create an execution environment.')
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          'Please contact your organization administrator if there is an issue with your access.'
        )
      ).toBeInTheDocument();
    });
  });

  it('should have create button disabled when user lacks permission', async () => {
    render(
      <MemoryRouter>
        <ExecutionEnvironments />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Control Plane EE')).toBeInTheDocument();
    });

    const createButton = screen.getByRole('button', { name: /Create execution environment/ });
    expect(createButton).toHaveAttribute('aria-disabled', 'true');
  });
});
