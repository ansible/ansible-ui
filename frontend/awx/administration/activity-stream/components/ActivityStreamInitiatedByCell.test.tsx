import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { ActivityStream } from '../../../interfaces/ActivityStream';
import { ActivityStreamInitiatedByCell } from './ActivityStreamInitiatedByCell';

vi.mock('@ansible/ansible-ui-framework', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@ansible/ansible-ui-framework')>();
  return {
    ...actual,
    useGetPageUrl:
      () => (routeId: string, opts?: { params?: Record<string, string | number | undefined> }) => {
        const id = opts?.params?.id;
        if (id !== undefined) return `/users/${id}`;
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
    summary_fields: {},
    ...overrides,
  }) as ActivityStream;

describe('ActivityStreamInitiatedByCell', () => {
  it('should render actor username as link when actor exists', () => {
    const activity = createActivity({
      summary_fields: {
        actor: { id: 5, username: 'admin' },
      } as ActivityStream['summary_fields'],
    });

    render(
      <MemoryRouter>
        <ActivityStreamInitiatedByCell item={activity} />
      </MemoryRouter>
    );

    expect(screen.getByTestId('admin-status')).toBeInTheDocument();
    expect(screen.getByText('admin')).toBeInTheDocument();
  });

  it('should render system when no actor', () => {
    const activity = createActivity({
      summary_fields: {},
    });

    render(
      <MemoryRouter>
        <ActivityStreamInitiatedByCell item={activity} />
      </MemoryRouter>
    );

    expect(screen.getByText('system')).toBeInTheDocument();
  });

  it('should render deleted text when actor exists but has no id', () => {
    const activity = createActivity({
      summary_fields: {
        actor: { username: 'deleted_user' },
      } as ActivityStream['summary_fields'],
    });

    render(
      <MemoryRouter>
        <ActivityStreamInitiatedByCell item={activity} />
      </MemoryRouter>
    );

    expect(screen.getByText(/deleted_user \(deleted\)/)).toBeInTheDocument();
  });

  it('should respect disableLinks option', () => {
    const activity = createActivity({
      summary_fields: {
        actor: { id: 6, username: 'viewer' },
      } as ActivityStream['summary_fields'],
    });

    render(
      <MemoryRouter>
        <ActivityStreamInitiatedByCell item={activity} options={{ disableLinks: true }} />
      </MemoryRouter>
    );

    expect(screen.getByTestId('viewer-status')).toBeInTheDocument();
    expect(screen.getByText('viewer')).toBeInTheDocument();
  });
});
