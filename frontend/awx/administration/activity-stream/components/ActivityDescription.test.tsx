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
        const inventoryType = opts?.params?.inventory_type;
        if (id !== undefined && inventoryType !== undefined) {
          return `/test/${routeId}/${id}?inventory_type=${inventoryType}`;
        }
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

  it('should render delete activity with inventory detail link', () => {
    const activity = createActivity({
      operation: 'delete',
      object1: 'inventory',
      summary_fields: {
        inventory: [{ id: '6', name: 'Removed inventory', kind: 'constructed' }],
      },
    });

    render(
      <MemoryRouter>
        <ActivityDescription activity={activity} />
      </MemoryRouter>
    );

    expect(screen.getByText('deleted inventory')).toBeInTheDocument();
    expect(screen.getByTestId('source-resource-detail')).toHaveTextContent('Removed inventory');
  });

  it('should render inventory activity when the inventory kind is missing', () => {
    const activity = createActivity({
      operation: 'update',
      object1: 'inventory',
      summary_fields: {
        inventory: [{ id: '3', name: 'Demo Inventory' }],
      },
    });

    render(
      <MemoryRouter>
        <ActivityDescription activity={activity} />
      </MemoryRouter>
    );

    expect(screen.getByRole('link', { name: 'Demo Inventory' })).toHaveAttribute(
      'href',
      '/test/awx-inventory-details/3?inventory_type=inventory'
    );
  });

  it('should use a host hostname when the activity has no host name', () => {
    const activity = createActivity({
      operation: 'create',
      object1: 'host',
      summary_fields: {
        host: [{ id: '5', hostname: 'node-5.example.test' }],
      },
    });

    render(
      <MemoryRouter>
        <ActivityDescription activity={activity} />
      </MemoryRouter>
    );

    expect(screen.getByRole('link', { name: 'node-5.example.test' })).toBeInTheDocument();
  });

  it('should render workflow job activity with its detail link', () => {
    const activity = createActivity({
      operation: 'create',
      object1: 'workflow_job',
      summary_fields: {
        workflow_job: [{ id: '7', name: 'Workflow job' }],
      },
    });

    render(
      <MemoryRouter>
        <ActivityDescription activity={activity} />
      </MemoryRouter>
    );

    expect(screen.getByRole('link', { name: 'Workflow job' })).toBeInTheDocument();
  });

  it('should fall back to a summary when an activity type has no route', () => {
    const activity = createActivity({
      operation: 'create',
      object1: 'schedule',
      summary_fields: {
        schedule: [{ id: '9', name: 'Demo Schedule' }],
      },
    });

    render(
      <MemoryRouter>
        <ActivityDescription activity={activity} />
      </MemoryRouter>
    );

    expect(screen.getByText('created schedule Demo Schedule')).toBeInTheDocument();
  });

  it('should render association and disassociation summaries without routes', () => {
    for (const operation of ['associate', 'disassociate']) {
      const activity = createActivity({
        operation,
        object1: 'schedule',
        object2: 'setting',
        summary_fields: {
          schedule: [{ id: '9', name: 'Demo Schedule' }],
          setting: [{ id: '10', name: 'Demo Setting' }],
        },
      });

      const { unmount } = render(
        <MemoryRouter>
          <ActivityDescription activity={activity} />
        </MemoryRouter>
      );

      const operationText = operation === 'associate' ? 'associated' : 'disassociated';
      expect(
        screen.getByText((content) => content.includes(`${operationText} schedule Demo Schedule`))
      ).toBeInTheDocument();
      unmount();
    }
  });

  it('should use the fallback summary for an unknown operation', () => {
    const activity = createActivity({ operation: 'archive' });

    render(
      <MemoryRouter>
        <ActivityDescription activity={activity} />
      </MemoryRouter>
    );

    expect(screen.getByText('Event summary not available')).toBeInTheDocument();
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
});
