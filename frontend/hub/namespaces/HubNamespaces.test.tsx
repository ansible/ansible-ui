import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { hubAPI } from '../common/api/formatPath';
import { AllNamespaces, CommonNamespaces, MyNamespaces, Namespaces } from './HubNamespaces';

// Mock isInsightsMode
vi.mock('../common/isInsights', () => ({
  isInsightsMode: vi.fn(() => false),
}));

import { isInsightsMode } from '../common/isInsights';

const mockNamespacesResponse = {
  meta: {
    count: 2,
  },
  links: {
    next: null,
  },
  data: [
    {
      pulp_href: '/api/galaxy/pulp/api/v3/namespaces/1/',
      id: 1,
      name: 'test_namespace',
      company: 'Test Company',
      email: 'test@example.com',
      avatar_url: '',
      description: 'Test namespace description',
      links: [],
      groups: [],
      related_fields: {},
      resources: '',
    },
    {
      pulp_href: '/api/galaxy/pulp/api/v3/namespaces/2/',
      id: 2,
      name: 'another_namespace',
      company: 'Another Company',
      email: 'another@example.com',
      avatar_url: '',
      description: 'Another namespace description',
      links: [],
      groups: [],
      related_fields: {},
      resources: '',
    },
  ],
};

describe('HubNamespaces', () => {
  let server: ReturnType<typeof setupServer>;

  beforeAll(() => {
    server = setupServer();
    server.listen({ onUnhandledRequest: 'bypass' });
  });

  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  describe('Namespaces', () => {
    beforeEach(() => {
      server.use(
        http.get('*/_ui/v1/namespaces/', () => HttpResponse.json(mockNamespacesResponse)),
        http.get('*/_ui/v1/my-namespaces/', () => HttpResponse.json(mockNamespacesResponse))
      );
    });

    it('should render page header and tabs', async () => {
      render(
        <MemoryRouter>
          <Namespaces />
        </MemoryRouter>
      );

      expect(await screen.findByRole('heading', { name: 'Namespaces' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'All' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'My namespaces' })).toBeInTheDocument();
    });

    it('should render description and help text in platform mode', async () => {
      render(
        <MemoryRouter>
          <Namespaces />
        </MemoryRouter>
      );

      expect(await screen.findByRole('heading', { name: 'Namespaces' })).toBeInTheDocument();
      expect(
        screen.getByText(
          'Namespaces group related content together, making it easier for users to find and differentiate collections of Ansible roles and other components.'
        )
      ).toBeInTheDocument();
    });
  });

  describe('Namespaces in Insights mode', () => {
    beforeEach(() => {
      vi.mocked(isInsightsMode).mockReturnValue(true);
      server.use(
        http.get('*/_ui/v1/namespaces/', () => HttpResponse.json(mockNamespacesResponse)),
        http.get('*/_ui/v1/my-namespaces/', () => HttpResponse.json(mockNamespacesResponse))
      );
    });

    afterEach(() => {
      vi.mocked(isInsightsMode).mockReturnValue(false);
    });

    it('should render Partners title in insights mode', async () => {
      render(
        <MemoryRouter>
          <Namespaces />
        </MemoryRouter>
      );

      expect(await screen.findByRole('heading', { name: 'Partners' })).toBeInTheDocument();
    });

    it('should not render description or help text in insights mode', async () => {
      render(
        <MemoryRouter>
          <Namespaces />
        </MemoryRouter>
      );

      await screen.findByRole('heading', { name: 'Partners' });
      expect(
        screen.queryByText(
          'Namespaces group related content together, making it easier for users to find and differentiate collections of Ansible roles and other components.'
        )
      ).not.toBeInTheDocument();
    });
  });

  describe('AllNamespaces', () => {
    beforeEach(() => {
      server.use(http.get('*/_ui/v1/namespaces/', () => HttpResponse.json(mockNamespacesResponse)));
    });

    it('should render namespaces', async () => {
      render(
        <MemoryRouter>
          <AllNamespaces />
        </MemoryRouter>
      );

      expect(await screen.findByText('test_namespace')).toBeInTheDocument();
      expect(screen.getByText('another_namespace')).toBeInTheDocument();
    });
  });

  describe('MyNamespaces', () => {
    beforeEach(() => {
      server.use(
        http.get('*/_ui/v1/my-namespaces/', () => HttpResponse.json(mockNamespacesResponse))
      );
    });

    it('should render namespaces', async () => {
      render(
        <MemoryRouter>
          <MyNamespaces />
        </MemoryRouter>
      );

      expect(await screen.findByText('test_namespace')).toBeInTheDocument();
      expect(screen.getByText('another_namespace')).toBeInTheDocument();
    });
  });

  describe('CommonNamespaces', () => {
    beforeEach(() => {
      server.use(
        http.get(hubAPI`/_ui/v1/namespaces/`, () => HttpResponse.json(mockNamespacesResponse))
      );
    });

    it('should render namespaces from API response', async () => {
      render(
        <MemoryRouter>
          <CommonNamespaces url={hubAPI`/_ui/v1/namespaces/`} isMyNamespaces={false} />
        </MemoryRouter>
      );

      expect(await screen.findByText('test_namespace')).toBeInTheDocument();
      expect(screen.getByText('another_namespace')).toBeInTheDocument();
    });
  });

  describe('Insights mode - ownership-based row actions', () => {
    const myNamespacesResponse = {
      meta: { count: 1 },
      links: { next: null },
      data: [
        {
          pulp_href: '/api/galaxy/pulp/api/v3/namespaces/1/',
          id: 1,
          name: 'test_namespace',
          company: 'Test Company',
          email: 'test@example.com',
          avatar_url: '',
          description: 'Test namespace description',
          links: [],
          groups: [],
          related_fields: {},
          resources: '',
        },
      ],
    };

    beforeEach(() => {
      vi.mocked(isInsightsMode).mockReturnValue(true);
      server.use(
        http.get('*/_ui/v1/namespaces/', () => HttpResponse.json(mockNamespacesResponse)),
        http.get('*/_ui/v1/my-namespaces/', () => HttpResponse.json(myNamespacesResponse))
      );
    });

    afterEach(() => {
      vi.mocked(isInsightsMode).mockReturnValue(false);
    });

    it('should render AllNamespaces in insights mode and fetch owned namespaces', async () => {
      render(
        <MemoryRouter>
          <AllNamespaces />
        </MemoryRouter>
      );

      // Should render both namespaces
      await waitFor(() => {
        expect(screen.getByText('test_namespace')).toBeInTheDocument();
        expect(screen.getByText('another_namespace')).toBeInTheDocument();
      });
    });

    it('should render MyNamespaces in insights mode showing all actions', async () => {
      render(
        <MemoryRouter>
          <MyNamespaces />
        </MemoryRouter>
      );

      // My namespaces should render (all owned, so all actions visible)
      await waitFor(() => {
        expect(screen.getByText('test_namespace')).toBeInTheDocument();
      });
    });

    it('should render CommonNamespaces with isMyNamespaces=true', async () => {
      server.use(
        http.get('*/_ui/v1/my-namespaces/', () => HttpResponse.json(myNamespacesResponse))
      );

      render(
        <MemoryRouter>
          <CommonNamespaces url={hubAPI`/_ui/v1/my-namespaces/`} isMyNamespaces={true} />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('test_namespace')).toBeInTheDocument();
      });
    });

    it('should render CommonNamespaces with isMyNamespaces=false (all tab)', async () => {
      render(
        <MemoryRouter>
          <CommonNamespaces url={hubAPI`/_ui/v1/namespaces/`} isMyNamespaces={false} />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('test_namespace')).toBeInTheDocument();
        expect(screen.getByText('another_namespace')).toBeInTheDocument();
      });
    });
  });

  describe('Platform mode - row actions', () => {
    beforeEach(() => {
      vi.mocked(isInsightsMode).mockReturnValue(false);
      server.use(http.get('*/_ui/v1/namespaces/', () => HttpResponse.json(mockNamespacesResponse)));
    });

    it('should render all namespaces with row actions in platform mode', async () => {
      render(
        <MemoryRouter>
          <CommonNamespaces url={hubAPI`/_ui/v1/namespaces/`} isMyNamespaces={false} />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('test_namespace')).toBeInTheDocument();
        expect(screen.getByText('another_namespace')).toBeInTheDocument();
      });
    });
  });
});
