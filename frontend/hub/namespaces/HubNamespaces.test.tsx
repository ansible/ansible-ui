import { render, screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { hubAPI } from '../common/api/formatPath';
import { AllNamespaces, CommonNamespaces, MyNamespaces, Namespaces } from './HubNamespaces';

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
          <CommonNamespaces url={hubAPI`/_ui/v1/namespaces/`} />
        </MemoryRouter>
      );

      expect(await screen.findByText('test_namespace')).toBeInTheDocument();
      expect(screen.getByText('another_namespace')).toBeInTheDocument();
    });
  });
});
