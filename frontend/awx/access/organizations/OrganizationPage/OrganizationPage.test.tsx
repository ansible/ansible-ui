import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { OrganizationPage } from './OrganizationPage';

const mockOrganization = {
  id: 1,
  name: 'Test Org',
  summary_fields: { user_capabilities: {} },
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

describe('OrganizationPage', () => {
  it('should display organization name in page header', async () => {
    render(
      <MemoryRouter initialEntries={['/organizations/1']}>
        <Routes>
          <Route path="/organizations/:id" element={<OrganizationPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('page-title')).toHaveTextContent('Test Org');
    });
  });
});
