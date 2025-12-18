import { render, screen, waitFor } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { awxAPI } from '../../../common/api/awx-utils';
import { ScheduleFormWizard } from '../types';
import { ScheduleSelectStep } from './ScheduleSelectStep';

const { mockSetStepData, mockSetWizardData } = vi.hoisted(() => ({
  mockSetStepData: vi.fn(),
  mockSetWizardData: vi.fn(),
}));

const { mockGetSchedulePromptValues } = vi.hoisted(() => ({
  mockGetSchedulePromptValues: vi.fn(),
}));

const { mockAlertToaster } = vi.hoisted(() => ({
  mockAlertToaster: {
    addAlert: vi.fn(),
  },
}));

vi.mock('@ansible/ansible-ui-framework/PageWizard/PageWizardProvider', () => ({
  usePageWizard: () => ({
    setStepData: mockSetStepData,
    setWizardData: mockSetWizardData,
  }),
}));

vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual('@ansible/ansible-ui-framework');
  return {
    ...actual,
    usePageAlertToaster: () => mockAlertToaster,
  };
});

vi.mock('../hooks/useGetSchedulePromptValues', () => ({
  useGetSchedulePromptValues: () => mockGetSchedulePromptValues,
}));

function TestWrapper({
  children,
  defaultValues,
  route = '/schedules/add',
  path = '/schedules/add',
}: {
  children: React.ReactNode;
  defaultValues?: Partial<ScheduleFormWizard>;
  route?: string;
  path?: string;
}) {
  const methods = useForm<ScheduleFormWizard>({
    defaultValues: {
      schedule_type: '',
      resourceId: null,
      name: '',
      description: '',
      timezone: 'UTC',
      startDateTime: { date: '', time: '' },
      rules: [],
      exceptions: [],
      launch_config: null,
      prompt: {} as never,
      schedule_days_to_keep: 0,
      survey: {},
      enabled: true,
      resource: {} as never,
      ...defaultValues,
    },
  });

  return (
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path={path} element={<FormProvider {...methods}>{children}</FormProvider>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('ScheduleSelectStep', () => {
  const server = setupServer(
    // Default handler for launch endpoints that may be called by useEffect
    http.get(awxAPI`/job_templates/:id/launch/`, () => {
      return HttpResponse.json({
        ask_credential_on_launch: false,
        ask_instance_groups_on_launch: false,
        ask_labels_on_launch: false,
        survey_enabled: false,
        defaults: {},
      });
    }),
    http.get(awxAPI`/workflow_job_templates/:id/launch/`, () => {
      return HttpResponse.json({
        ask_credential_on_launch: false,
        ask_instance_groups_on_launch: false,
        ask_labels_on_launch: false,
        survey_enabled: false,
        defaults: {},
      });
    }),
    http.get(awxAPI`/schedules/zoneinfo/`, () => {
      return HttpResponse.json({
        zones: ['UTC', 'America/New_York', 'Europe/London'],
        links: {},
      });
    }),
    http.options(awxAPI`/system_job_templates/`, () => {
      return HttpResponse.json({});
    })
  );

  beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  beforeEach(() => {
    vi.clearAllMocks();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
    mockSetStepData.mockImplementation((fn) => (typeof fn === 'function' ? fn({}) : fn));
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
    mockSetWizardData.mockImplementation((fn) => (typeof fn === 'function' ? fn({}) : fn));
  });

  describe('when isTopLevelSchedule is true', () => {
    it('should render ScheduleTypeInputs', () => {
      render(
        <TestWrapper>
          <ScheduleSelectStep isTopLevelSchedule={true} />
        </TestWrapper>
      );

      expect(screen.getByRole('button', { name: /resource type/i })).toBeInTheDocument();
    });

    it('should not render ScheduleResourceInputs when no resourceId is set', () => {
      render(
        <TestWrapper>
          <ScheduleSelectStep isTopLevelSchedule={true} />
        </TestWrapper>
      );

      expect(screen.getByRole('button', { name: /resource type/i })).toBeInTheDocument();
      expect(screen.queryByRole('textbox', { name: /schedule name/i })).not.toBeInTheDocument();
    });

    it('should render ScheduleResourceInputs when resourceId is set', () => {
      render(
        <TestWrapper defaultValues={{ resourceId: 123 }}>
          <ScheduleSelectStep isTopLevelSchedule={true} />
        </TestWrapper>
      );

      expect(screen.getByRole('button', { name: /resource type/i })).toBeInTheDocument();
      expect(screen.getByRole('textbox', { name: /schedule name/i })).toBeInTheDocument();
    });

    it('should render ScheduleResourceInputs when resource.id is set', () => {
      render(
        <TestWrapper defaultValues={{ resource: { id: 456 } as never }}>
          <ScheduleSelectStep isTopLevelSchedule={true} />
        </TestWrapper>
      );

      expect(screen.getByRole('button', { name: /resource type/i })).toBeInTheDocument();
      expect(screen.getByRole('textbox', { name: /schedule name/i })).toBeInTheDocument();
    });

    it('should render days to keep field when resource is cleanup_activitystream management job', async () => {
      server.use(
        http.get(awxAPI`/system_job_templates/123/`, () => {
          return HttpResponse.json({
            id: 123,
            job_type: 'cleanup_activitystream',
          });
        })
      );

      render(
        <TestWrapper
          defaultValues={{
            resourceId: 123,
            resource: { id: 123, job_type: 'cleanup_activitystream' } as never,
            schedule_type: 'system_job_template',
          }}
        >
          <ScheduleSelectStep isTopLevelSchedule={true} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(
          screen.getByRole('spinbutton', { name: /days of data to keep/i })
        ).toBeInTheDocument();
      });
    });

    it('should render days to keep field when resource is cleanup_jobs management job', async () => {
      server.use(
        http.get(awxAPI`/system_job_templates/123/`, () => {
          return HttpResponse.json({
            id: 123,
            job_type: 'cleanup_jobs',
          });
        })
      );

      render(
        <TestWrapper
          defaultValues={{
            resourceId: 123,
            resource: { id: 123, job_type: 'cleanup_jobs' } as never,
            schedule_type: 'system_job_template',
          }}
        >
          <ScheduleSelectStep isTopLevelSchedule={true} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(
          screen.getByRole('spinbutton', { name: /days of data to keep/i })
        ).toBeInTheDocument();
      });
    });

    it('should not render days to keep field for non-management jobs', async () => {
      server.use(
        http.get(awxAPI`/system_job_templates/123/`, () => {
          return HttpResponse.json({
            id: 123,
            job_type: 'run',
          });
        })
      );

      render(
        <TestWrapper
          defaultValues={{
            resourceId: 123,
            resource: { id: 123, job_type: 'run' } as never,
            schedule_type: 'system_job_template',
          }}
        >
          <ScheduleSelectStep isTopLevelSchedule={true} />
        </TestWrapper>
      );

      // Wait a bit to ensure the component has rendered
      await waitFor(() => {
        expect(screen.getByRole('textbox', { name: /schedule name/i })).toBeInTheDocument();
      });

      expect(
        screen.queryByRole('spinbutton', { name: /days of data to keep/i })
      ).not.toBeInTheDocument();
    });
  });

  describe('when isTopLevelSchedule is false or undefined', () => {
    it('should render ScheduleResourceInputs when resourceId is set', () => {
      render(
        <TestWrapper defaultValues={{ resourceId: 123 }}>
          <ScheduleSelectStep />
        </TestWrapper>
      );

      expect(screen.queryByRole('button', { name: /resource type/i })).not.toBeInTheDocument();
      expect(screen.getByRole('textbox', { name: /schedule name/i })).toBeInTheDocument();
    });

    it('should render ScheduleResourceInputs when resource.id is set', () => {
      render(
        <TestWrapper defaultValues={{ resource: { id: 456 } as never }}>
          <ScheduleSelectStep />
        </TestWrapper>
      );

      expect(screen.queryByRole('button', { name: /resource type/i })).not.toBeInTheDocument();
      expect(screen.getByRole('textbox', { name: /schedule name/i })).toBeInTheDocument();
    });
  });

  describe('prompt step update effect', () => {
    it('should fetch job template launch config for job_template type', async () => {
      server.use(
        http.get(awxAPI`/job_templates/123/`, () => {
          return HttpResponse.json({
            id: 123,
            type: 'job_template',
            name: 'Test Template',
          });
        }),
        http.get(awxAPI`/job_templates/123/launch/`, () => {
          return HttpResponse.json({
            ask_credential_on_launch: false,
            ask_instance_groups_on_launch: false,
            ask_labels_on_launch: false,
            survey_enabled: false,
            defaults: {},
          });
        })
      );

      mockGetSchedulePromptValues.mockResolvedValue({});

      render(
        <TestWrapper
          defaultValues={{
            resourceId: 123,
            schedule_type: 'job_template',
          }}
        >
          <ScheduleSelectStep />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(mockSetStepData).toHaveBeenCalled();
      });
    });

    it('should fetch workflow job template launch config for workflow_job_template type', async () => {
      server.use(
        http.get(awxAPI`/workflow_job_templates/123/`, () => {
          return HttpResponse.json({
            id: 123,
            type: 'workflow_job_template',
            name: 'Test Workflow',
          });
        }),
        http.get(awxAPI`/workflow_job_templates/123/launch/`, () => {
          return HttpResponse.json({
            ask_credential_on_launch: false,
            ask_instance_groups_on_launch: false,
            ask_labels_on_launch: false,
            survey_enabled: false,
            defaults: {},
          });
        })
      );

      mockGetSchedulePromptValues.mockResolvedValue({});

      render(
        <TestWrapper
          defaultValues={{
            resourceId: 123,
            schedule_type: 'workflow_job_template',
          }}
        >
          <ScheduleSelectStep />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(mockSetStepData).toHaveBeenCalled();
      });
    });

    it('should fetch schedule credentials when schedule_id is provided and ask_credential_on_launch is true', async () => {
      server.use(
        http.get(awxAPI`/job_templates/123/`, () => {
          return HttpResponse.json({
            id: 123,
            type: 'job_template',
            name: 'Test Template',
          });
        }),
        http.get(awxAPI`/job_templates/123/launch/`, () => {
          return HttpResponse.json({
            ask_credential_on_launch: true,
            ask_instance_groups_on_launch: false,
            ask_labels_on_launch: false,
            survey_enabled: false,
            defaults: {},
          });
        }),
        http.get(awxAPI`/schedules/789/credentials/`, () => {
          return HttpResponse.json({
            results: [{ id: 1, name: 'Test Credential' }],
          });
        })
      );

      mockGetSchedulePromptValues.mockResolvedValue({});

      render(
        <TestWrapper
          route="/job-templates/123/schedules/789/edit"
          path="/job-templates/:id/schedules/:schedule_id/edit"
          defaultValues={{
            resourceId: 123,
            schedule_type: 'job_template',
          }}
        >
          <ScheduleSelectStep />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(mockGetSchedulePromptValues).toHaveBeenCalled();
      });
    });

    it('should fetch schedule instance groups when schedule_id is provided and ask_instance_groups_on_launch is true', async () => {
      server.use(
        http.get(awxAPI`/job_templates/123/`, () => {
          return HttpResponse.json({
            id: 123,
            type: 'job_template',
            name: 'Test Template',
          });
        }),
        http.get(awxAPI`/job_templates/123/launch/`, () => {
          return HttpResponse.json({
            ask_credential_on_launch: false,
            ask_instance_groups_on_launch: true,
            ask_labels_on_launch: false,
            survey_enabled: false,
            defaults: {},
          });
        }),
        http.get(awxAPI`/schedules/789/instance_groups/`, () => {
          return HttpResponse.json({
            results: [{ id: 1, name: 'Test Instance Group' }],
          });
        })
      );

      mockGetSchedulePromptValues.mockResolvedValue({});

      render(
        <TestWrapper
          route="/job-templates/123/schedules/789/edit"
          path="/job-templates/:id/schedules/:schedule_id/edit"
          defaultValues={{
            resourceId: 123,
            schedule_type: 'job_template',
          }}
        >
          <ScheduleSelectStep />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(mockGetSchedulePromptValues).toHaveBeenCalled();
      });
    });

    it('should fetch schedule labels when schedule_id is provided and ask_labels_on_launch is true', async () => {
      server.use(
        http.get(awxAPI`/job_templates/123/`, () => {
          return HttpResponse.json({
            id: 123,
            type: 'job_template',
            name: 'Test Template',
          });
        }),
        http.get(awxAPI`/job_templates/123/launch/`, () => {
          return HttpResponse.json({
            ask_credential_on_launch: false,
            ask_instance_groups_on_launch: false,
            ask_labels_on_launch: true,
            survey_enabled: false,
            defaults: {},
          });
        }),
        http.get(awxAPI`/schedules/789/labels/`, () => {
          return HttpResponse.json({
            results: [{ id: 1, name: 'Test Label' }],
          });
        })
      );

      mockGetSchedulePromptValues.mockResolvedValue({});

      render(
        <TestWrapper
          route="/job-templates/123/schedules/789/edit"
          path="/job-templates/:id/schedules/:schedule_id/edit"
          defaultValues={{
            resourceId: 123,
            schedule_type: 'job_template',
          }}
        >
          <ScheduleSelectStep />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(mockGetSchedulePromptValues).toHaveBeenCalled();
      });
    });

    it('should fetch survey spec and schedule data when schedule_id is provided and survey_enabled is true', async () => {
      server.use(
        http.get(awxAPI`/job_templates/123/`, () => {
          return HttpResponse.json({
            id: 123,
            type: 'job_template',
            name: 'Test Template',
          });
        }),
        http.get(awxAPI`/job_templates/123/launch/`, () => {
          return HttpResponse.json({
            ask_credential_on_launch: false,
            ask_instance_groups_on_launch: false,
            ask_labels_on_launch: false,
            survey_enabled: true,
            defaults: {},
          });
        }),
        http.get(awxAPI`/job_templates/123/survey_spec/`, () => {
          return HttpResponse.json({
            spec: [{ variable: 'test_var' }],
          });
        }),
        http.get(awxAPI`/schedules/789/`, () => {
          return HttpResponse.json({
            id: 789,
            extra_data: { test_var: 'test_value' },
          });
        })
      );

      mockGetSchedulePromptValues.mockResolvedValue({});

      render(
        <TestWrapper
          route="/job-templates/123/schedules/789/edit"
          path="/job-templates/:id/schedules/:schedule_id/edit"
          defaultValues={{
            resourceId: 123,
            schedule_type: 'job_template',
          }}
        >
          <ScheduleSelectStep />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(mockGetSchedulePromptValues).toHaveBeenCalled();
      });
    });

    it('should call getSchedulePromptValues with correct parameters', async () => {
      server.use(
        http.get(awxAPI`/job_templates/123/`, () => {
          return HttpResponse.json({
            id: 123,
            type: 'job_template',
            name: 'Test Template',
          });
        }),
        http.get(awxAPI`/job_templates/123/launch/`, () => {
          return HttpResponse.json({
            ask_credential_on_launch: false,
            ask_instance_groups_on_launch: false,
            ask_labels_on_launch: false,
            survey_enabled: false,
            defaults: {},
          });
        })
      );

      mockGetSchedulePromptValues.mockResolvedValue({});

      render(
        <TestWrapper
          defaultValues={{
            resourceId: 123,
            schedule_type: 'job_template',
          }}
        >
          <ScheduleSelectStep />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(mockGetSchedulePromptValues).toHaveBeenCalledWith(
          expect.objectContaining({
            ask_credential_on_launch: false,
            ask_instance_groups_on_launch: false,
            ask_labels_on_launch: false,
            survey_enabled: false,
          }),
          [],
          [],
          [],
          undefined
        );
      });
    });

    it('should update step data with prompt values and launch config', async () => {
      server.use(
        http.get(awxAPI`/job_templates/123/`, () => {
          return HttpResponse.json({
            id: 123,
            type: 'job_template',
            name: 'Test Template',
          });
        }),
        http.get(awxAPI`/job_templates/123/launch/`, () => {
          return HttpResponse.json({
            ask_credential_on_launch: false,
            ask_instance_groups_on_launch: false,
            ask_labels_on_launch: false,
            survey_enabled: false,
            defaults: { verbosity: 2 },
          });
        })
      );

      const mockPromptValues = { verbosity: 2 };
      mockGetSchedulePromptValues.mockResolvedValue(mockPromptValues);

      render(
        <TestWrapper
          defaultValues={{
            resourceId: 123,
            schedule_type: 'job_template',
          }}
        >
          <ScheduleSelectStep />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(mockSetStepData).toHaveBeenCalled();
      });
    });

    it('should show error alert when prompt step update fails', async () => {
      server.use(
        http.get(awxAPI`/job_templates/123/`, () => {
          return HttpResponse.json({ detail: 'Network error' }, { status: 500 });
        })
      );

      render(
        <TestWrapper
          defaultValues={{
            resourceId: 123,
            schedule_type: 'job_template',
          }}
        >
          <ScheduleSelectStep />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(mockAlertToaster.addAlert).toHaveBeenCalledWith(
          expect.objectContaining({
            variant: 'danger',
            timeout: 5000,
          })
        );
      });
    });

    it('should extract survey answers from extra_data when survey is enabled', async () => {
      server.use(
        http.get(awxAPI`/job_templates/123/`, () => {
          return HttpResponse.json({
            id: 123,
            type: 'job_template',
            name: 'Test Template',
          });
        }),
        http.get(awxAPI`/job_templates/123/launch/`, () => {
          return HttpResponse.json({
            ask_credential_on_launch: false,
            ask_instance_groups_on_launch: false,
            ask_labels_on_launch: false,
            survey_enabled: true,
            defaults: {},
          });
        }),
        http.get(awxAPI`/job_templates/123/survey_spec/`, () => {
          return HttpResponse.json({
            spec: [
              { variable: 'string_var' },
              { variable: 'number_var' },
              { variable: 'array_var' },
            ],
          });
        }),
        http.get(awxAPI`/schedules/789/`, () => {
          return HttpResponse.json({
            id: 789,
            extra_data: {
              string_var: 'test_string',
              number_var: 42,
              array_var: ['item1', 'item2'],
              other_var: 'should_be_ignored',
            },
          });
        })
      );

      mockGetSchedulePromptValues.mockResolvedValue({});

      render(
        <TestWrapper
          route="/job-templates/123/schedules/789/edit"
          path="/job-templates/:id/schedules/:schedule_id/edit"
          defaultValues={{
            resourceId: 123,
            schedule_type: 'job_template',
          }}
        >
          <ScheduleSelectStep />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(mockSetStepData).toHaveBeenCalled();
      });
    });

    it('should not include survey answers when survey spec is empty', async () => {
      server.use(
        http.get(awxAPI`/job_templates/123/`, () => {
          return HttpResponse.json({
            id: 123,
            type: 'job_template',
            name: 'Test Template',
          });
        }),
        http.get(awxAPI`/job_templates/123/launch/`, () => {
          return HttpResponse.json({
            ask_credential_on_launch: false,
            ask_instance_groups_on_launch: false,
            ask_labels_on_launch: false,
            survey_enabled: true,
            defaults: {},
          });
        }),
        http.get(awxAPI`/job_templates/123/survey_spec/`, () => {
          return HttpResponse.json({
            spec: [],
          });
        }),
        http.get(awxAPI`/schedules/789/`, () => {
          return HttpResponse.json({
            id: 789,
            extra_data: {},
          });
        })
      );

      mockGetSchedulePromptValues.mockResolvedValue({});

      render(
        <TestWrapper
          route="/job-templates/123/schedules/789/edit"
          path="/job-templates/:id/schedules/:schedule_id/edit"
          defaultValues={{
            resourceId: 123,
            schedule_type: 'job_template',
          }}
        >
          <ScheduleSelectStep />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(mockSetStepData).toHaveBeenCalled();
      });
    });
  });
});
