import { render, screen, waitFor } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ScheduleFormWizard } from '../types';
import { ScheduleResourceInputs } from './ScheduleResourceInputs';

const { mockRequestGet } = vi.hoisted(() => ({
  mockRequestGet: vi.fn(),
}));

vi.mock('@ansible/common-ui/crud/Data', () => ({
  requestGet: mockRequestGet,
}));

vi.mock('../hooks/useGetTimezones', () => ({
  useGetTimezones: () => ({
    timeZones: [
      { label: 'UTC', value: 'UTC' },
      { label: 'America/New_York', value: 'America/New_York' },
    ],
    links: {},
  }),
}));

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

  return <FormProvider {...methods}>{children}</FormProvider>;
}

describe('ScheduleResourceInputs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

  it('does not render days_to_keep field for other management job template types', async () => {
    mockRequestGet.mockResolvedValue({
      id: 3,
      name: 'Cleanup Expired OAuth 2 Tokens',
      job_type: 'cleanup_tokens',
    });

    render(
      <TestWrapper
        defaultValues={{
          schedule_type: 'management_job_template',
          resourceId: 3,
        }}
      >
        <ScheduleResourceInputs />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(mockRequestGet).toHaveBeenCalled();
    });

    expect(screen.queryByTestId('schedule_days_to_keep')).not.toBeInTheDocument();
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
