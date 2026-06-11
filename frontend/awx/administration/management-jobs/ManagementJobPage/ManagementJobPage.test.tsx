/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Navigate, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { AwxActiveUserProvider } from '../../../common/useAwxActiveUser';
import { ManagementJobPage } from './ManagementJobPage';

const mockSystemJobTemplate = {
  id: 1,
  name: 'Cleanup Job Details',
  type: 'system_job_template',
};

const mockOrganizationsResponse = {
  count: 0,
  next: null,
  previous: null,
  results: [],
};

const mockSchedulesResponse = {
  count: 0,
  next: null,
  previous: null,
  results: [],
};

const server = setupServer(
  http.options(
    ({ request }) => request.url.includes('/system_job_templates/'),
    () => HttpResponse.json({ actions: { GET: {} } })
  ),
  http.get(
    ({ request }) =>
      request.url.includes('/system_job_templates/1/') && !request.url.includes('/schedules'),
    () => HttpResponse.json(mockSystemJobTemplate)
  ),
  http.get(
    ({ request }) =>
      request.url.includes('/system_job_templates/') && request.url.includes('/schedules'),
    () => HttpResponse.json(mockSchedulesResponse)
  ),
  http.get(
    ({ request }) => request.url.includes('/organizations/') && request.url.includes('role_level'),
    () => HttpResponse.json(mockOrganizationsResponse)
  ),
  http.get(
    ({ request }) => request.url.includes('/me/'),
    () =>
      HttpResponse.json({
        count: 1,
        next: null,
        previous: null,
        results: [{ id: 1, username: 'admin', is_superuser: true }],
      })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('ManagementJobPage', () => {
  test('should render page with system job template name as title', async () => {
    render(
      <MemoryRouter initialEntries={['/administration/management_jobs/1/schedules']}>
        <AwxActiveUserProvider>
          <Routes>
            <Route path="/administration/management_jobs/:id" element={<ManagementJobPage />}>
              <Route
                path="schedules"
                element={<div data-testid="schedules-tab">Schedules Tab</div>}
              />
              <Route path="" element={<Navigate to="schedules" replace />} />
            </Route>
          </Routes>
        </AwxActiveUserProvider>
      </MemoryRouter>
    );

    await waitFor(
      () => {
        expect(screen.getByTestId('page-title')).toBeInTheDocument();
        expect(screen.getByTestId('page-title')).toHaveTextContent('Cleanup Job Details');
      },
      { timeout: 10000 }
    );

    expect(screen.getByTestId('schedules-tab')).toBeInTheDocument();
  });
});
