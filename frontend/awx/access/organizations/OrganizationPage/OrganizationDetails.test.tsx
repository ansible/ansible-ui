import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { OrganizationDetails } from './OrganizationDetails';

const mockOrganization = {
  id: 1,
  name: 'Test Org',
  description: 'Test desc',
  custom_virtualenv: null,
  summary_fields: {
    default_environment: null,
    created_by: { id: 1, username: 'admin' },
    modified_by: { id: 1, username: 'admin' },
    user_capabilities: { edit: true, delete: true },
    object_roles: {},
    related_field_counts: {},
  },
};

const server = setupServer(
  http.get(
    ({ request }) =>
      request.url.includes('/organizations/') &&
      request.url.includes('/1') &&
      !request.url.includes('galaxy_credentials') &&
      !request.url.includes('instance_groups'),
    () => HttpResponse.json(mockOrganization)
  ),
  http.get(
    ({ request }) => request.url.includes('galaxy_credentials'),
    () => HttpResponse.json({ count: 0, results: [], next: null, previous: null })
  ),
  http.get(
    ({ request }) => request.url.includes('instance_groups'),
    () => HttpResponse.json({ count: 0, results: [], next: null, previous: null })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('OrganizationDetails', () => {
  it('should render organization name', async () => {
    render(
      <MemoryRouter initialEntries={['/organizations/1/details']}>
        <Routes>
          <Route path="/organizations/:id/details" element={<OrganizationDetails />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Org')).toBeInTheDocument();
    });
  });
});
