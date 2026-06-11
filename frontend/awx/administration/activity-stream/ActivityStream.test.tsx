import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { SWRConfig } from 'swr';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { awxAPI } from '../../common/api/awx-utils';
import { ActivityStreams } from './ActivityStream';

const emptyListFixture = {
  count: 0,
  next: null,
  previous: null,
  results: [],
};

const mockActivityStreamOptions = {
  name: 'Activity Stream List',
  actions: {
    GET: {
      id: { type: 'integer', label: 'ID', filterable: true },
      type: { type: 'choice', label: 'Type', choices: [['activity_stream', 'Activity Stream']] },
      url: { type: 'string', label: 'Url', filterable: false },
      related: { type: 'object', label: 'Related', filterable: false },
      summary_fields: { type: 'object', label: 'Summary fields', filterable: false },
      timestamp: { type: 'datetime', label: 'Timestamp', filterable: true },
      operation: {
        type: 'choice',
        label: 'Operation',
        filterable: true,
        choices: [
          ['create', 'Entity Created'],
          ['update', 'Entity Updated'],
          ['delete', 'Entity Deleted'],
          ['associate', 'Entity Associated with another Entity'],
          ['disassociate', 'Entity was Disassociated with another Entity'],
        ],
      },
      changes: { type: 'json', label: 'Changes', filterable: true },
      object1: { type: 'string', label: 'Object1', filterable: true },
      object2: { type: 'string', label: 'Object2', filterable: true },
      object_association: { type: 'field', label: 'Object association', filterable: false },
      action_node: { type: 'string', label: 'Action node', filterable: true },
      object_type: { type: 'field', label: 'Object type', filterable: false },
    },
  },
  search_fields: ['changes'],
};

const activityStreamFixture = {
  count: 54,
  next: '/api/v2/activity_stream/?page=2',
  previous: null,
  results: [
    {
      id: 1,
      type: 'activity_stream',
      url: '/api/v2/activity_stream/1/',
      related: { user: ['/api/v2/users/1/'] },
      summary_fields: {
        user: [{ id: 1, username: 'admin', first_name: '', last_name: '' }],
      },
      timestamp: '2024-01-02T20:57:49.354607Z',
      operation: 'create',
      changes: {
        username: 'admin',
        first_name: '',
        last_name: '',
        email: 'admin@localhost',
        is_superuser: true,
        password: 'hidden',
        id: 1,
      },
      object1: 'user',
      object2: '',
      object_association: '',
      action_node: 'awx_1',
      object_type: '',
    },
  ],
};

function TestWrapper({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig value={{ provider: () => new Map() }}>
      <MemoryRouter>{children}</MemoryRouter>
    </SWRConfig>
  );
}

const server = setupServer(
  http.options(awxAPI`/activity_stream/`, () => HttpResponse.json(mockActivityStreamOptions)),
  http.get(
    ({ request }) => request.url.includes('activity_stream'),
    ({ request }) => {
      if (request.url.includes('or__object1__in=job') || request.url.includes('object1__in=job'))
        return HttpResponse.json({ count: 0, next: null, previous: null, results: [] });
      return HttpResponse.json(activityStreamFixture);
    }
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('ActivityStream', () => {
  it('should display error when activity stream fails to load', async () => {
    server.use(
      http.get(
        ({ request }) => request.url.includes('activity_stream'),
        () => new HttpResponse(null, { status: 500 })
      )
    );

    render(
      <TestWrapper>
        <ActivityStreams />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Error loading activity stream')).toBeInTheDocument();
    });
  });

  it('should display empty state when there are no activity streams', async () => {
    server.use(
      http.get(
        ({ request }) => request.url.includes('activity_stream'),
        () => HttpResponse.json(emptyListFixture)
      )
    );

    render(
      <TestWrapper>
        <ActivityStreams />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Activity Stream')).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByText('There are currently no activity streams')).toBeInTheDocument();
    });
  });

  it('should display activity stream list with rows', async () => {
    render(
      <TestWrapper>
        <ActivityStreams />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Activity Stream')).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getAllByText(/admin/).length).toBeGreaterThan(0);
    });
  });

  it('should show filter controls when filters are expanded', async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <ActivityStreams />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getAllByText(/admin/).length).toBeGreaterThan(0);
    });

    const filtersGroup = document.getElementById('filters');
    expect(filtersGroup).toBeInTheDocument();
    await user.click(
      within(filtersGroup as HTMLElement).getByRole('button', { name: 'Show Filters' })
    );
    expect(screen.getByTestId('filter')).toBeInTheDocument();
    expect(document.getElementById('filter-input')).toBeInTheDocument();
  });
});
