import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { ActivityStream } from '../../../interfaces/ActivityStream';
import { ActivityDescription } from './ActivityDescription';

vi.mock('@ansible/ansible-ui-framework', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@ansible/ansible-ui-framework')>();
  return {
    ...actual,
    useGetPageUrl:
      () => (routeId: string, opts?: { params?: Record<string, string | number | undefined> }) => {
        const id = opts?.params?.id;
        if (id !== undefined) return `/test/${routeId}/${id}`;
        return `/test/${routeId}`;
      },
  };
});

const createActivity = (overrides: Partial<ActivityStream> = {}): ActivityStream =>
  ({
    id: 1,
    operation: 'create',
    object1: 'job',
    object2: 'job',
    timestamp: '2024-01-01T00:00:00Z',
    summary_fields: {
      job: [{ id: 1, name: 'Test Job', status: 'success' }],
    },
    ...overrides,
  }) as ActivityStream;

describe('ActivityDescription', () => {
  it('should render create job description with link', () => {
    const activity = createActivity({
      operation: 'create',
      object1: 'job',
      summary_fields: {
        job: [{ id: '1', name: 'Test Job', status: 'success' }],
      },
    });

    render(
      <MemoryRouter>
        <ActivityDescription activity={activity} />
      </MemoryRouter>
    );

    expect(screen.getByText('Test Job')).toBeInTheDocument();
    expect(screen.getByText('created job')).toBeInTheDocument();
    expect(screen.getByTestId('source-resource-detail')).toBeInTheDocument();
  });

  it('should render update activity description', () => {
    const activity = createActivity({
      operation: 'update',
      object1: 'project',
      summary_fields: {
        project: [{ id: '2', name: 'My Project' }],
      },
    });

    render(
      <MemoryRouter>
        <ActivityDescription activity={activity} />
      </MemoryRouter>
    );

    expect(screen.getByText('updated project')).toBeInTheDocument();
  });

  it('should render disassociate activity with role', () => {
    const activity = createActivity({
      operation: 'disassociate',
      object1: 'user',
      object2: 'team',
      summary_fields: {
        user: [{ id: '3', username: 'john' }],
        team: [{ id: '4', name: 'Dev Team' }],
        role: [{ role_field: 'Admin' }],
      },
    });

    render(
      <MemoryRouter>
        <ActivityDescription activity={activity} />
      </MemoryRouter>
    );

    expect(
      screen.getByText((content) => content.includes('disassociated user'))
    ).toBeInTheDocument();
  });

  it('should include the role name from changes.role_definition when summary_fields.role is absent', () => {
    const activity = createActivity({
      operation: 'associate',
      object1: 'inventory',
      object2: 'user',
      summary_fields: {
        inventory: [{ id: '5', name: 'prod-inventory' }],
        user: [{ id: '3', username: 'johndoe' }],
      },
      changes: {
        inventory: '',
        id: 5,
        object1_pk: 5,
        name: 'prod-inventory',
        role_definition: 'Inventory Admin',
      },
    });

    render(
      <MemoryRouter>
        <ActivityDescription activity={activity} />
      </MemoryRouter>
    );

    expect(
      screen.getByText((content) => content.includes('Inventory Admin role'))
    ).toBeInTheDocument();
  });
});
