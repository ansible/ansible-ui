import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from 'vitest';
import { HubNamespace } from '../HubNamespace';
import { HubNamespaceDetails } from './HubNamespaceDetails';

const mockNamespace: HubNamespace = {
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
};

vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual('@ansible/ansible-ui-framework');
  return {
    ...actual,
    usePageNavigate: () => vi.fn(),
    useGetPageUrl: () => (route: string) => `/mock-url/${route}`,
  };
});

describe('HubNamespaceDetails', () => {
  const server = setupServer(
    http.get(
      ({ request }) => {
        return request.url.includes('/_ui/v1/namespaces/');
      },
      () => {
        return HttpResponse.json(mockNamespace);
      }
    )
  );

  beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
  afterAll(() => server.close());
  afterEach(() => server.resetHandlers());

  test('should render loading state initially', () => {
    render(
      <MemoryRouter initialEntries={['/namespaces/test_namespace/details']}>
        <Routes>
          <Route path="/namespaces/:id/details" element={<HubNamespaceDetails />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('should show namespace details tab', async () => {
    render(
      <MemoryRouter initialEntries={['/namespaces/test_namespace/details']}>
        <Routes>
          <Route path="/namespaces/:id/details" element={<HubNamespaceDetails />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('name')).toBeInTheDocument();
    });

    expect(screen.getByTestId('name')).toHaveTextContent('test_namespace');
    expect(screen.getByTestId('description')).toHaveTextContent('test description');
    expect(screen.getByTestId('company')).toHaveTextContent('test company');
    expect(screen.getByTestId('key-value-list-title')).toHaveTextContent('Useful links');
    expect(screen.getByTestId('item-key-0')).toHaveTextContent('test link');
    const linkUrl = 'https://test.com';
    expect(screen.getByTestId(`item-value-${linkUrl}`)).toHaveTextContent(linkUrl);
  });

  test('should render namespace without links', async () => {
    const namespaceWithoutLinks = {
      ...mockNamespace,
      links: [],
    };

    server.use(
      http.get(
        ({ request }) => {
          return request.url.includes('/_ui/v1/namespaces/');
        },
        () => {
          return HttpResponse.json(namespaceWithoutLinks);
        }
      )
    );

    render(
      <MemoryRouter initialEntries={['/namespaces/test_namespace/details']}>
        <Routes>
          <Route path="/namespaces/:id/details" element={<HubNamespaceDetails />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('name')).toBeInTheDocument();
    });

    expect(screen.queryByTestId('key-value-list-title')).not.toBeInTheDocument();
  });

  test('should render namespace with resources', async () => {
    const namespaceWithResources = {
      ...mockNamespace,
      resources: 'name: example_namespace',
    };

    server.use(
      http.get(
        ({ request }) => {
          return request.url.includes('/_ui/v1/namespaces/');
        },
        () => {
          return HttpResponse.json(namespaceWithResources);
        }
      )
    );

    render(
      <MemoryRouter initialEntries={['/namespaces/test_namespace/details']}>
        <Routes>
          <Route path="/namespaces/:id/details" element={<HubNamespaceDetails />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('name: example_namespace')).toBeInTheDocument();
    });
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
      <MemoryRouter initialEntries={['/namespaces/test_namespace/details']}>
        <Routes>
          <Route path="/namespaces/:id/details" element={<HubNamespaceDetails />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      const refreshButton = screen.queryByRole('button', { name: /refresh/i });
      expect(refreshButton).toBeTruthy();
    });
  });
});
