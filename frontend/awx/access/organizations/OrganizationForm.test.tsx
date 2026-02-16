import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { CreateOrganization } from './OrganizationForm';

const mockOrganizationsOptions = { actions: { GET: {}, POST: {} } };
const mockInstanceGroups = { count: 0, results: [], next: null, previous: null };
const mockExecutionEnvironments = { count: 0, results: [], next: null, previous: null };

const server = setupServer(
  http.options(
    ({ request }) => request.url.includes('/organizations/'),
    () => HttpResponse.json(mockOrganizationsOptions)
  ),
  http.options(
    ({ request }) => request.url.includes('/instance_groups/'),
    () => HttpResponse.json({ actions: { GET: {} } })
  ),
  http.options(
    ({ request }) => request.url.includes('/execution_environments/'),
    () => HttpResponse.json({ actions: { GET: {} } })
  ),
  http.get(
    ({ request }) =>
      request.url.includes('/instance_groups/') && !request.url.includes('/organizations/'),
    () => HttpResponse.json(mockInstanceGroups)
  ),
  http.get(
    ({ request }) => request.url.includes('/execution_environments/'),
    () => HttpResponse.json(mockExecutionEnvironments)
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('OrganizationForm', () => {
  describe('CreateOrganization', () => {
    it('should render create organization page with title and Name field', async () => {
      render(
        <MemoryRouter initialEntries={['/organizations/create']}>
          <Routes>
            <Route path="/organizations/create" element={<CreateOrganization />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('page-title')).toHaveTextContent('Create organization');
      });

      expect(screen.getByTestId('name-form-group')).toBeInTheDocument();
    });
  });
});
