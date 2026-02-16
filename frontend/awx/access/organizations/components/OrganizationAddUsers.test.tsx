import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { OrganizationAddUsers } from './OrganizationAddUsers';

const mockOrganization = {
  id: 1,
  name: 'Test Org',
  description: '',
  custom_virtualenv: null,
  summary_fields: { user_capabilities: {} },
};

const server = setupServer(
  http.get(
    ({ request }) => request.url.includes('/organizations/') && request.url.includes('/1/'),
    () => HttpResponse.json(mockOrganization)
  ),
  http.options(
    ({ request }) => request.url.includes('/users/') && !request.url.includes('organizations'),
    () => HttpResponse.json({ actions: { GET: {} } })
  ),
  http.get(
    ({ request }) => request.url.includes('/users/') && !request.url.includes('organizations'),
    () => HttpResponse.json({ count: 0, results: [], next: null, previous: null })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('OrganizationAddUsers', () => {
  it('should render wizard with Select user(s) step', { timeout: 15000 }, async () => {
    render(
      <MemoryRouter initialEntries={['/organizations/1/user-access/add']}>
        <Routes>
          <Route path="/organizations/:id/user-access/add" element={<OrganizationAddUsers />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(
      () => {
        expect(screen.getByTestId('wizard')).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });
});
