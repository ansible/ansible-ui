import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from 'vitest';
import { HubNamespace } from './HubNamespace';
import { AllNamespaces } from './HubNamespaces';

const mockNamespaces: HubNamespace[] = [
  {
    pulp_href: '/api/galaxy/_ui/v1/namespaces/test_namespace/',
    id: 1,
    name: 'test_namespace',
    company: 'test company',
    email: 'test@example.com',
    avatar_url: 'https://example.com/avatar.png',
    description: 'test description',
    links: [
      {
        name: 'test link',
        url: 'https://test.com',
      },
    ],
    groups: [
      {
        id: 1,
        name: 'test-group',
        object_roles: [],
      },
    ],
    related_fields: {},
    resources: '',
  },
];

const mockNamespacesResponse = {
  meta: {
    count: 1,
  },
  data: mockNamespaces,
};

vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual('@ansible/ansible-ui-framework');
  return {
    ...actual,
    usePageNavigate: () => vi.fn(),
    useGetPageUrl: () => (route: string) => `/mock-url/${route}`,
  };
});

vi.mock('../common/useHubContext', () => ({
  useHubContext: () => ({
    featureFlags: {},
    settings: {},
    user: null,
    hasPermission: () => true,
  }),
}));

vi.mock('./hooks/useHubNamespaceActions', () => ({
  useHubNamespaceActions: () => [],
}));

vi.mock('./hooks/useHubNamespaceToolbarActions', () => ({
  useHubNamespaceToolbarActions: () => [],
}));

describe('HubNamespaces', () => {
  const server = setupServer(
    http.get(
      ({ request }) => {
        return request.url.includes('/_ui/v1/namespaces/');
      },
      () => {
        return HttpResponse.json(mockNamespacesResponse);
      }
    )
  );

  beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
  afterAll(() => server.close());
  afterEach(() => server.resetHandlers());

  test('should render namespaces in table view', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <AllNamespaces />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('test_namespace')).toBeInTheDocument();
    });

    const tableViewButton = screen.getByTestId('table-view');
    await user.click(tableViewButton);

    await waitFor(() => {
      expect(screen.getByRole('row', { name: /test_namespace/i })).toBeInTheDocument();
    });
  });

  test('should switch between table, card, and list views', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <AllNamespaces />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('test_namespace')).toBeInTheDocument();
    });

    // Switch to table view
    const tableViewButton = screen.getByTestId('table-view');
    await user.click(tableViewButton);

    await waitFor(() => {
      expect(screen.getByText('test_namespace')).toBeInTheDocument();
    });

    // Switch to card view (default view)
    const cardViewButton = screen.getByTestId('card-view');
    await user.click(cardViewButton);

    await waitFor(() => {
      expect(screen.getByText('test_namespace')).toBeInTheDocument();
    });

    // Switch to list view
    const listViewButton = screen.getByTestId('list-view');
    await user.click(listViewButton);

    await waitFor(() => {
      expect(screen.getByText('test_namespace')).toBeInTheDocument();
    });
  });

  test('should render empty state when no namespaces', async () => {
    server.use(
      http.get(
        ({ request }) => {
          return request.url.includes('/_ui/v1/namespaces/');
        },
        () => {
          return HttpResponse.json({ meta: { count: 0 }, data: [] });
        }
      )
    );

    render(
      <MemoryRouter>
        <AllNamespaces />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('No namespaces yet')).toBeInTheDocument();
    });

    expect(screen.getByText('To get started, create an namespace.')).toBeInTheDocument();
    expect(screen.getByText('Create namespace')).toBeInTheDocument();
  });

  test('should handle error state', async () => {
    server.use(
      http.get(
        ({ request }) => {
          return request.url.includes('/_ui/v1/namespaces/');
        },
        () => {
          return HttpResponse.error();
        }
      )
    );

    render(
      <MemoryRouter>
        <AllNamespaces />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Error loading namespaces')).toBeInTheDocument();
    });
  });
});
