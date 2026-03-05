import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { awxAPI } from '../../common/api/awx-utils';
import { ManagementJobs } from './ManagementJobsList';

const mockManagementJobs = {
  count: 3,
  next: null,
  previous: null,
  results: [
    {
      id: 1,
      type: 'system_job_template',
      name: 'Cleanup Job Details',
      description: 'Remove job history older than X days',
      job_type: 'cleanup_jobs',
    },
    {
      id: 2,
      type: 'system_job_template',
      name: 'Cleanup Activity Stream',
      description: 'Remove activity stream entries older than X days',
      job_type: 'cleanup_activitystream',
    },
    {
      id: 4,
      type: 'system_job_template',
      name: 'Cleanup Expired Sessions',
      description: 'Remove expired browser sessions',
      job_type: 'cleanup_sessions',
    },
  ],
};

const server = setupServer(
  http.options(awxAPI`/system_job_templates/`, () => {
    return HttpResponse.json({
      actions: {},
    });
  }),
  http.get(awxAPI`/system_job_templates/`, () => {
    return HttpResponse.json(mockManagementJobs);
  })
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('ManagementJobs', () => {
  it('should render management jobs list', async () => {
    render(
      <MemoryRouter>
        <ManagementJobs />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Management Jobs')).toBeInTheDocument();
    });
  });

  it('should display management jobs in table', async () => {
    render(
      <MemoryRouter>
        <ManagementJobs />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Cleanup Job Details')).toBeInTheDocument();
      expect(screen.getByText('Cleanup Activity Stream')).toBeInTheDocument();
    });
  });
});
