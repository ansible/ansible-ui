/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { awxAPI } from '../../../common/api/awx-utils';
import { SchedulesList } from '../../../views/schedules/SchedulesList';
import { AwxRoute } from '../../../main/AwxRoutes';

const mockSchedulesResponse = {
  count: 0,
  next: null,
  previous: null,
  results: [],
};

const server = setupServer(
  http.options(
    ({ request }) =>
      request.url.includes('/system_job_templates/') || request.url.includes('schedules'),
    () => HttpResponse.json({ actions: { GET: {}, POST: {} } })
  ),
  http.get(
    ({ request }) =>
      request.url.includes('/system_job_templates/') && request.url.includes('/schedules'),
    () => HttpResponse.json(mockSchedulesResponse)
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

/**
 * Tests the Management Job Schedules tab. The route at
 * /administration/management_jobs/:id/schedules renders SchedulesList
 * with sublistEndpoint for system_job_templates, not ManagementJobSchedules.
 */
describe('ManagementJobSchedules', () => {
  test('should render schedules list with empty state', async () => {
    render(
      <MemoryRouter initialEntries={['/administration/management_jobs/1/schedules']}>
        <Routes>
          <Route
            path="/administration/management_jobs/:id/*"
            element={
              <SchedulesList
                createSchedulePageId={AwxRoute.ManagementJobScheduleCreate}
                sublistEndpoint={awxAPI`/system_job_templates`}
                resourceType="management-jobs"
              />
            }
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('No schedules yet')).toBeInTheDocument();
    });
  });
});
