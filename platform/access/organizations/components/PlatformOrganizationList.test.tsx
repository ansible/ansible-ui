/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { PlatformOrganizationList } from './PlatformOrganizationList';

const mockOrganizations = {
  count: 2,
  next: null,
  previous: null,
  results: [
    {
      id: 1,
      name: 'Default',
      description: 'Default organization',
      created_at: '2023-10-01T12:00:00Z',
      modified_at: '2023-10-02T12:00:00Z',
    },
    {
      id: 2,
      name: 'Test Org',
      description: 'Test organization',
      created_at: '2023-10-01T12:00:00Z',
      modified_at: '2023-10-02T12:00:00Z',
    },
  ],
};

describe('PlatformOrganizationList', () => {
  const server = setupServer();

  beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('renders the organizations list', async () => {
    server.use(
      http.get('*/organizations/*', () => {
        return HttpResponse.json(mockOrganizations);
      }),
      http.options('*/organizations/', () => {
        return HttpResponse.json({ actions: {} });
      })
    );

    render(
      <MemoryRouter>
        <PlatformOrganizationList />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Organizations')).toBeInTheDocument();
    });
  });

  it('displays empty state', async () => {
    server.use(
      http.get('*/organizations/*', () => {
        return HttpResponse.json({ count: 0, results: [] });
      }),
      http.options('*/organizations/', () => {
        return HttpResponse.json({ actions: {} });
      })
    );

    render(
      <MemoryRouter>
        <PlatformOrganizationList />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByText(/do not have permission to create an organization/i)
      ).toBeInTheDocument();
    });
  });

  it('exports the PlatformOrganizationList component', () => {
    expect(PlatformOrganizationList).toBeDefined();
    expect(typeof PlatformOrganizationList).toBe('function');
  });
});
