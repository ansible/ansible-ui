import { RequestError } from '@ansible/common-ui/crud/RequestError';
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { awxAPI } from '../../../common/api/awx-utils';
import { ScheduleAddWizard } from './ScheduleAddWizard';

const zones = {
  zones: ['America/New_York', 'UTC'],
  links: {},
};

const server = setupServer(
  http.options(awxAPI`/schedules/`, () =>
    HttpResponse.json({
      actions: {
        POST: {
          name: {
            pattern: '^[a-zA-Z0-9_-]+$',
            pattern_description: 'Valid schedule name',
          },
        },
      },
    })
  ),
  http.get(awxAPI`/schedules/zoneinfo/`, () => HttpResponse.json(zones)),
  http.post(awxAPI`/schedules/preview/`, () =>
    HttpResponse.json({
      local: ['2024-04-11T10:45:00-04:00'],
      utc: ['2024-04-11T14:45:00Z'],
    })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function renderAddWizard(props: { resourceEndPoint?: string; isTopLevelSchedule?: boolean } = {}) {
  render(
    <MemoryRouter initialEntries={['/schedules/create']}>
      <Routes>
        <Route path="/schedules/create" element={<ScheduleAddWizard {...props} />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('ScheduleAddWizard', () => {
  it('should render create schedule wizard with title and navigation', async () => {
    renderAddWizard({ isTopLevelSchedule: true });

    await waitFor(() => {
      expect(screen.getByTestId('page-title')).toHaveTextContent('Create schedule');
    });
    expect(screen.getByTestId('wizard-nav')).toBeInTheDocument();
    expect(screen.getByTestId('wizard-nav-item-details')).toBeInTheDocument();
    expect(screen.getByTestId('wizard-nav-item-rules')).toBeInTheDocument();
  });

  it('should render wizard when resourceEndPoint targets job templates', async () => {
    renderAddWizard({ resourceEndPoint: awxAPI`/job_templates/` });

    await waitFor(() => {
      expect(screen.getByTestId('page-title')).toHaveTextContent('Create schedule');
    });
  });

  it('should render wizard when resourceEndPoint targets workflow job templates', async () => {
    renderAddWizard({ resourceEndPoint: awxAPI`/workflow_job_templates/` });

    await waitFor(() => {
      expect(screen.getByTestId('page-title')).toHaveTextContent('Create schedule');
    });
  });

  it('should render wizard when resourceEndPoint targets inventory sources', async () => {
    renderAddWizard({ resourceEndPoint: awxAPI`/inventory_sources/` });

    await waitFor(() => {
      expect(screen.getByTestId('page-title')).toHaveTextContent('Create schedule');
    });
  });

  it('should render wizard when resourceEndPoint targets projects', async () => {
    renderAddWizard({ resourceEndPoint: awxAPI`/projects/` });

    await waitFor(() => {
      expect(screen.getByTestId('page-title')).toHaveTextContent('Create schedule');
    });
  });

  it('should render wizard when resourceEndPoint targets system job templates', async () => {
    renderAddWizard({ resourceEndPoint: awxAPI`/system_job_templates/` });

    await waitFor(() => {
      expect(screen.getByTestId('page-title')).toHaveTextContent('Create schedule');
    });
  });
});

describe('ScheduleAddWizard - Error Handling', () => {
  it('should handle missing resources error and format it correctly', () => {
    const fieldErrors = [
      {
        name: 'resources_needed_to_start',
        message: 'Job Template inventory is missing or undefined.',
      },
    ];

    const missingResource = fieldErrors.find((err) => err?.name === 'resources_needed_to_start');

    expect(missingResource).toBeDefined();
    expect(missingResource?.message).toBe('Job Template inventory is missing or undefined.');

    if (missingResource) {
      const errors = {
        __all__: [missingResource.message],
      };
      const requestError = new RequestError('', '', 400, '', errors);
      expect(requestError.json).toEqual({
        __all__: ['Job Template inventory is missing or undefined.'],
      });
      expect(requestError.statusCode).toBe(400);
    }
  });

  it('should re-throw other errors that are not missing resources', () => {
    const fieldErrors = [
      {
        name: 'some_other_error',
        message: 'Some other validation error',
      },
    ];

    const missingResource = fieldErrors.find((err) => err?.name === 'resources_needed_to_start');

    expect(missingResource).toBeUndefined();
  });

  it('should handle multiple field errors and only catch resources_needed_to_start', () => {
    const fieldErrors = [
      {
        name: 'name',
        message: 'Name is required',
      },
      {
        name: 'resources_needed_to_start',
        message: 'Job Template inventory is missing or undefined.',
      },
      {
        name: 'timezone',
        message: 'Invalid timezone',
      },
    ];

    const missingResource = fieldErrors.find((err) => err?.name === 'resources_needed_to_start');

    expect(missingResource).toBeDefined();
    expect(missingResource?.name).toBe('resources_needed_to_start');
    expect(missingResource?.message).toBe('Job Template inventory is missing or undefined.');
  });
});
