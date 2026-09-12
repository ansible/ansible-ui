import { render, screen, waitFor } from '@testing-library/react';
import { PageWizardContext } from '@ansible/ansible-ui-framework/PageWizard/PageWizardProvider';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { awxAPI } from '../../../common/api/awx-utils';
import { ScheduleFormWizard } from '../types';
import { ScheduleResourceInputs } from './ScheduleResourceInputs';

const mockUseGetTimezones = vi.hoisted(() =>
  vi.fn<
    () => {
      timeZones: { label: string; value: string }[];
      links?: Record<string, string>;
    }
  >(() => ({
    timeZones: [
      { label: 'UTC', value: 'UTC' },
      { label: 'America/New_York', value: 'America/New_York' },
    ],
    links: { 'US/Eastern': 'America/New_York' },
  }))
);

vi.mock('../hooks/useGetTimezones', () => ({
  useGetTimezones: mockUseGetTimezones,
}));

function ScheduleDaysToKeepProbe() {
  const value = useWatch<ScheduleFormWizard, 'schedule_days_to_keep'>({
    name: 'schedule_days_to_keep',
  });
  return (
    <span data-testid="schedule-days-state">{value === undefined ? 'removed' : 'present'}</span>
  );
}

function TestWrapper({
  children,
  defaultValues,
}: {
  children: React.ReactNode;
  defaultValues?: Partial<ScheduleFormWizard>;
}) {
  const methods = useForm<ScheduleFormWizard>({
    defaultValues: {
      name: '',
      description: '',
      timezone: 'UTC',
      schedule_type: '',
      resourceId: null,
      ...defaultValues,
    },
  });

  return (
    <PageWizardContext.Provider value={{ setWizardData: vi.fn() } as never}>
      <FormProvider {...methods}>{children}</FormProvider>
    </PageWizardContext.Provider>
  );
}

describe('ScheduleResourceInputs', () => {
  const server = setupServer();

  beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseGetTimezones.mockImplementation(() => ({
      timeZones: [
        { label: 'UTC', value: 'UTC' },
        { label: 'America/New_York', value: 'America/New_York' },
      ],
      links: { 'US/Eastern': 'America/New_York' },
    }));
  });

  it('renders all common fields', () => {
    render(
      <TestWrapper>
        <ScheduleResourceInputs />
      </TestWrapper>
    );

    expect(screen.getByRole('textbox', { name: 'Schedule name' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Description' })).toBeInTheDocument();
    expect(screen.getByTestId('startDateTime-form-group')).toBeInTheDocument();
    expect(screen.getByTestId('timezone')).toBeInTheDocument();
  });

  it('renders labels when the resource does not prompt for labels', () => {
    render(
      <TestWrapper defaultValues={{ launch_config: { ask_labels_on_launch: false } as never }}>
        <ScheduleResourceInputs />
      </TestWrapper>
    );

    expect(screen.getByText('Labels')).toBeInTheDocument();
  });

  it('does not render labels when the resource prompts for labels', () => {
    render(
      <TestWrapper defaultValues={{ launch_config: { ask_labels_on_launch: true } as never }}>
        <ScheduleResourceInputs />
      </TestWrapper>
    );

    expect(screen.queryByText('Labels')).not.toBeInTheDocument();
  });

  it('updates wizard data and warns when many labels are selected', async () => {
    render(
      <TestWrapper
        defaultValues={{
          prompt: {
            labels: Array.from({ length: 81 }, (_, index) => ({
              id: index,
              name: `label-${index}`,
            })),
          } as never,
          launch_config: null,
          resource: {
            id: 1,
            ask_labels_on_launch: false,
            summary_fields: { organization: { id: 42 } },
          } as never,
        }}
      >
        <ScheduleResourceInputs />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Many labels selected')).toBeInTheDocument();
    });
    expect(screen.getByText(/This schedule has 81 labels/)).toBeInTheDocument();
  });

  it('clears the timezone warning when timezone links are unavailable', () => {
    mockUseGetTimezones.mockImplementation(() => ({ timeZones: [], links: undefined }));

    render(
      <TestWrapper defaultValues={{ timezone: 'US/Eastern' }}>
        <ScheduleResourceInputs />
      </TestWrapper>
    );

    expect(
      screen.queryByText(
        'Warning: US/Eastern is a link to America/New_York and will be saved as that.'
      )
    ).not.toBeInTheDocument();
  });

  it('shows a warning when the selected timezone is a link', () => {
    render(
      <TestWrapper defaultValues={{ timezone: 'US/Eastern' }}>
        <ScheduleResourceInputs />
      </TestWrapper>
    );

    expect(
      screen.getByText(
        'Warning: US/Eastern is a link to America/New_York and will be saved as that.'
      )
    ).toBeInTheDocument();
  });

  it('does not render days_to_keep field by default', () => {
    render(
      <TestWrapper>
        <ScheduleResourceInputs />
      </TestWrapper>
    );

    expect(screen.queryByTestId('schedule_days_to_keep')).not.toBeInTheDocument();
  });

  it('does not render days_to_keep field for job template schedule type', () => {
    render(
      <TestWrapper
        defaultValues={{
          schedule_type: 'job_template',
          resourceId: 1,
        }}
      >
        <ScheduleResourceInputs />
      </TestWrapper>
    );

    expect(screen.queryByTestId('schedule_days_to_keep')).not.toBeInTheDocument();
  });

  it('does not render days_to_keep field for project schedule type', () => {
    render(
      <TestWrapper
        defaultValues={{
          schedule_type: 'project',
          resourceId: 1,
        }}
      >
        <ScheduleResourceInputs />
      </TestWrapper>
    );

    expect(screen.queryByTestId('schedule_days_to_keep')).not.toBeInTheDocument();
  });

  it('does not render days_to_keep field for inventory_source schedule type', () => {
    render(
      <TestWrapper
        defaultValues={{
          schedule_type: 'inventory_source',
          resourceId: 1,
        }}
      >
        <ScheduleResourceInputs />
      </TestWrapper>
    );

    expect(screen.queryByTestId('schedule_days_to_keep')).not.toBeInTheDocument();
  });

  it('should render days_to_keep field for cleanup_jobs management job', async () => {
    server.use(
      http.get(awxAPI`/system_job_templates/:id/`, () => {
        return HttpResponse.json({
          id: 1,
          name: 'Cleanup Job Details',
          job_type: 'cleanup_jobs',
        });
      })
    );

    render(
      <TestWrapper
        defaultValues={{
          schedule_type: 'system_job_template',
          resourceId: 1,
        }}
      >
        <ScheduleResourceInputs />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByRole('spinbutton', { name: 'Days of data to keep' })).toBeInTheDocument();
    });
  });

  it('should render days_to_keep field for cleanup_activitystream management job', async () => {
    server.use(
      http.get(awxAPI`/system_job_templates/:id/`, () => {
        return HttpResponse.json({
          id: 2,
          name: 'Cleanup Activity Stream',
          job_type: 'cleanup_activitystream',
        });
      })
    );

    render(
      <TestWrapper
        defaultValues={{
          schedule_type: 'system_job_template',
          resourceId: 2,
        }}
      >
        <ScheduleResourceInputs />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByRole('spinbutton', { name: 'Days of data to keep' })).toBeInTheDocument();
    });
  });

  it('should not render days_to_keep field for other management job template types', async () => {
    server.use(
      http.get(awxAPI`/system_job_templates/:id/`, () => {
        return HttpResponse.json({
          id: 3,
          name: 'Cleanup Expired OAuth 2 Tokens',
          job_type: 'cleanup_tokens',
        });
      })
    );

    render(
      <TestWrapper
        defaultValues={{
          schedule_type: 'system_job_template',
          resourceId: 3,
          schedule_days_to_keep: 10,
        }}
      >
        <ScheduleResourceInputs />
        <ScheduleDaysToKeepProbe />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId('schedule-days-state')).toHaveTextContent('removed');
    });
  });

  it('marks schedule name as required', () => {
    render(
      <TestWrapper>
        <ScheduleResourceInputs />
      </TestWrapper>
    );

    const nameFormGroup = screen.getByTestId('name-form-group');
    expect(nameFormGroup.querySelector('.pf-v6-c-form__label-required')).toBeInTheDocument();
  });

  it('marks start date/time as required', () => {
    render(
      <TestWrapper>
        <ScheduleResourceInputs />
      </TestWrapper>
    );

    const startDateGroup = screen.getByTestId('startDateTime-form-group');
    expect(startDateGroup.querySelector('.pf-v6-c-form__label-required')).toBeInTheDocument();
  });

  it('marks timezone as required', () => {
    render(
      <TestWrapper>
        <ScheduleResourceInputs />
      </TestWrapper>
    );

    const timezoneFormGroup = screen.getByTestId('timezone-form-group');
    expect(timezoneFormGroup.querySelector('.pf-v6-c-form__label-required')).toBeInTheDocument();
  });

  it('does not mark description as required', () => {
    render(
      <TestWrapper>
        <ScheduleResourceInputs />
      </TestWrapper>
    );

    const descriptionInput = screen.getByRole('textbox', { name: 'Description' });
    expect(descriptionInput).not.toBeRequired();
  });
});
