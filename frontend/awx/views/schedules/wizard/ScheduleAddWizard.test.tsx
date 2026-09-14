import { SwrTestWrapper } from '@ansible/ansible-ui-framework/test-utils/swrTestWrapper';
import { RequestError } from '@ansible/common-ui/crud/RequestError';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { awxAPI } from '../../../common/api/awx-utils';
import { ScheduleAddWizard } from './ScheduleAddWizard';

const mockRequestGet = vi.hoisted(() =>
  vi.fn((url: string) => {
    if (url.includes('/launch/')) {
      return Promise.resolve({
        ask_credential_on_launch: false,
        survey_enabled: false,
        defaults: { credentials: [], job_tags: '', skip_tags: '' },
      });
    }
    if (url.includes('/job_templates/')) {
      return Promise.resolve({ id: 100, name: 'Mock Job Template', type: 'job_template' });
    }
    return Promise.reject(new Error(`Unexpected requestGet: ${url}`));
  })
);

vi.mock('@ansible/common-ui/crud/Data', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@ansible/common-ui/crud/Data')>();
  return {
    ...actual,
    requestGet: (url: string, signal?: AbortSignal) => mockRequestGet(url, signal),
  };
});

const zones = {
  zones: ['America/New_York', 'UTC'],
  links: {},
};

const schedulesOptionsHandler = vi.fn(() =>
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
);

const server = setupServer(
  http.options(awxAPI`/schedules/`, schedulesOptionsHandler),
  http.options(awxAPI`/job_templates/`, () => HttpResponse.json({ actions: { POST: {} } })),
  http.options(awxAPI`/job_templates/:id/`, () => HttpResponse.json({ actions: { POST: {} } })),
  http.get(awxAPI`/job_templates/:id/`, () =>
    HttpResponse.json({ id: 100, name: 'Mock Job Template', type: 'job_template' })
  ),
  http.get(awxAPI`/job_templates/:id/launch/`, () =>
    HttpResponse.json({
      ask_credential_on_launch: false,
      survey_enabled: false,
      defaults: { credentials: [], job_tags: '', skip_tags: '' },
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
afterEach(() => {
  server.resetHandlers();
  schedulesOptionsHandler.mockClear();
  mockRequestGet.mockClear();
});
afterAll(() => server.close());

function renderAddWizard(props: { resourceEndPoint?: string; isTopLevelSchedule?: boolean } = {}) {
  render(
    <SwrTestWrapper>
      <MemoryRouter initialEntries={['/schedules/create']}>
        <Routes>
          <Route path="/schedules/create" element={<ScheduleAddWizard {...props} />} />
        </Routes>
      </MemoryRouter>
    </SwrTestWrapper>
  );
}

function renderJobTemplateNestedAddWizard() {
  render(
    <SwrTestWrapper>
      <MemoryRouter initialEntries={['/templates/job-template/100/schedules/create']}>
        <Routes>
          <Route
            path="/templates/job-template/:id/schedules/create"
            element={<ScheduleAddWizard resourceEndPoint={awxAPI`/job_templates/`} />}
          />
        </Routes>
      </MemoryRouter>
    </SwrTestWrapper>
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

  it('should apply schedule name pattern validation from OPTIONS metadata', async () => {
    renderJobTemplateNestedAddWizard();

    await waitFor(() => {
      expect(schedulesOptionsHandler).toHaveBeenCalled();
    });
    await waitFor(() => {
      expect(mockRequestGet).toHaveBeenCalled();
    });

    await waitFor(() => {
      const nameInput = screen.getByRole('textbox', { name: 'Schedule name' });
      fireEvent.change(nameInput, { target: { value: 'invalid@name' } });
      fireEvent.blur(nameInput);
      expect(screen.getByText('Valid schedule name')).toBeInTheDocument();
    });
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
