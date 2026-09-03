import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { awxAPI } from '../../../common/api/awx-utils';
import {
  LaunchConfiguration,
  LaunchConfigCredential,
} from '../../../interfaces/LaunchConfiguration';
import { JobTemplate } from '../../../interfaces/JobTemplate';
import { LaunchTemplate, LaunchWizard } from './TemplateLaunchWizard';

const mockAddAlert = vi.fn();

vi.mock('@ansible/ansible-ui-framework', async () => ({
  ...(await vi.importActual('@ansible/ansible-ui-framework')),
  usePageAlertToaster: () => ({ addAlert: mockAddAlert }),
}));

vi.mock('../hooks/useLabelPayload', () => ({
  useLabelPayload: vi.fn(() => vi.fn(() => Promise.resolve([]))),
}));

const mockTemplate = {
  id: 1,
  name: 'Test Template',
  type: 'job_template',
  summary_fields: {
    labels: { count: 0, results: [] },
    organization: { id: 1, name: 'Default', description: '' },
    credentials: [],
    user_capabilities: { edit: true, start: true },
  },
} as unknown as JobTemplate;

const makeConfig = (overrides: Partial<LaunchConfiguration> = {}): LaunchConfiguration => ({
  can_start_without_user_input: true,
  passwords_needed_to_start: [],
  ask_scm_branch_on_launch: false,
  ask_variables_on_launch: false,
  ask_tags_on_launch: false,
  ask_diff_mode_on_launch: false,
  ask_skip_tags_on_launch: false,
  ask_job_type_on_launch: false,
  ask_limit_on_launch: false,
  ask_verbosity_on_launch: false,
  ask_inventory_on_launch: false,
  ask_credential_on_launch: false,
  ask_execution_environment_on_launch: false,
  ask_labels_on_launch: false,
  ask_forks_on_launch: false,
  ask_job_slice_count_on_launch: false,
  ask_timeout_on_launch: false,
  ask_instance_groups_on_launch: false,
  survey_enabled: false,
  variables_needed_to_start: [],
  credential_needed_to_start: false,
  inventory_needed_to_start: false,
  credential_passwords: {
    ssh_password: '',
    become_password: '',
    ssh_key_unlock: '',
    vault_password: '',
  },
  defaults: {
    inventory: { name: '', id: 0 },
    limit: '',
    labels: [],
    scm_branch: '',
    job_tags: '',
    skip_tags: '',
    extra_vars: '',
    diff_mode: false,
    job_type: 'run',
    verbosity: 0,
    credentials: [],
    execution_environment: {},
    forks: 0,
    job_slice_count: 1,
    timeout: 0,
    instance_groups: [],
  },
  job_template_data: { name: 'Test Template', id: 1, description: '' },
  unified_job_template_object: {
    name: 'Test Template',
    id: 1,
    description: '',
    survey_enabled: false,
  },
  ...overrides,
});

const baseDefaults = {
  inventory: { name: '', id: 0 as number },
  limit: '',
  labels: [] as { id: number; name: string }[],
  scm_branch: '',
  job_tags: '',
  skip_tags: '',
  extra_vars: '',
  diff_mode: false,
  job_type: 'run',
  verbosity: 0 as const,
  credentials: [] as LaunchConfigCredential[],
  execution_environment: {} as Record<string, never>,
  forks: 0,
  job_slice_count: 1,
  timeout: 0,
  instance_groups: [] as [],
};

const mockWJT = {
  id: 1,
  name: 'Test WJT',
  type: 'workflow_job_template',
  summary_fields: {
    labels: { count: 0, results: [] },
    organization: { id: 1, name: 'Default', description: '' },
    credentials: [],
    user_capabilities: { edit: true, start: true },
  },
} as unknown as JobTemplate;

const server = setupServer(
  http.get(awxAPI`/job_templates/1/`, () => HttpResponse.json(mockTemplate)),
  http.get(awxAPI`/job_templates/1/launch/`, () => HttpResponse.json(makeConfig())),
  http.get(awxAPI`/labels/`, () => HttpResponse.json({ count: 0, results: [], next: null }))
);

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('TemplateLaunchWizard', () => {
  describe('LaunchTemplate', () => {
    it('should render the launch wizard after loading template and config', async () => {
      render(
        <MemoryRouter initialEntries={['/job-templates/1/launch']}>
          <Routes>
            <Route
              path="/job-templates/:id/launch"
              element={<LaunchTemplate jobType="job_templates" />}
            />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Prompt on Launch')).toBeInTheDocument();
      });
    });

    it('should render the Review step when all prompt steps are hidden', async () => {
      render(
        <MemoryRouter initialEntries={['/job-templates/1/launch']}>
          <Routes>
            <Route
              path="/job-templates/:id/launch"
              element={<LaunchTemplate jobType="job_templates" />}
            />
          </Routes>
        </MemoryRouter>
      );

      // All ask_* flags are false, so only Review step should be visible
      await waitFor(() => {
        expect(screen.getAllByText('Review').length).toBeGreaterThan(0);
      });
    });

    it(
      'should skip createLabelPayload and POST launch when ask_labels_on_launch is false',
      { timeout: 15000 },
      async () => {
        const { useLabelPayload } = await import('../hooks/useLabelPayload');
        const mockCreateLabelPayload = vi.fn(() => Promise.resolve([]));
        vi.mocked(useLabelPayload).mockReturnValue(mockCreateLabelPayload);

        let launchPosted = false;
        server.use(
          http.post(awxAPI`/job_templates/1/launch/`, () => {
            launchPosted = true;
            return HttpResponse.json({ id: 100, type: 'job' });
          })
        );

        const user = userEvent.setup();
        render(
          <MemoryRouter initialEntries={['/job-templates/1/launch']}>
            <Routes>
              <Route
                path="/job-templates/:id/launch"
                element={<LaunchTemplate jobType="job_templates" />}
              />
            </Routes>
          </MemoryRouter>
        );

        await waitFor(() => {
          expect(screen.getByText('Prompt on Launch')).toBeInTheDocument();
        });

        // With all ask_* false only Review step is visible; click Finish to submit
        await user.click(screen.getByTestId('wizard-next'));

        await waitFor(() => {
          expect(launchPosted).toBe(true);
        });
        expect(mockCreateLabelPayload).not.toHaveBeenCalled();
      }
    );

    it(
      'should call createLabelPayload when ask_labels_on_launch is true',
      { timeout: 15000 },
      async () => {
        const { useLabelPayload } = await import('../hooks/useLabelPayload');
        const mockCreateLabelPayload = vi.fn(() => Promise.resolve([]));
        vi.mocked(useLabelPayload).mockReturnValue(mockCreateLabelPayload);

        let launchPosted = false;
        server.use(
          http.get(awxAPI`/job_templates/1/launch/`, () =>
            HttpResponse.json(makeConfig({ ask_labels_on_launch: true }))
          ),
          http.post(awxAPI`/job_templates/1/launch/`, () => {
            launchPosted = true;
            return HttpResponse.json({ id: 100, type: 'job' });
          })
        );

        const user = userEvent.setup();
        render(
          <MemoryRouter initialEntries={['/job-templates/1/launch']}>
            <Routes>
              <Route
                path="/job-templates/:id/launch"
                element={<LaunchTemplate jobType="job_templates" />}
              />
            </Routes>
          </MemoryRouter>
        );

        await waitFor(() => {
          expect(screen.getByText('Prompt on Launch')).toBeInTheDocument();
        });

        // With ask_labels_on_launch: true, the Prompts step is visible first.
        // Steps with `inputs` render PageFormSubmitButton (data-testid="Submit"),
        // steps with `element` (Review) render a plain button (data-testid="wizard-next").
        await waitFor(() => {
          expect(screen.getByTestId('Submit')).toBeInTheDocument();
        });
        await user.click(screen.getByTestId('Submit'));

        // Now on Review step — click Finish to submit
        await waitFor(() => {
          expect(screen.getByTestId('wizard-next')).toBeInTheDocument();
        });
        await user.click(screen.getByTestId('wizard-next'));

        await waitFor(() => {
          expect(launchPosted).toBe(true);
        });
        expect(mockCreateLabelPayload).toHaveBeenCalled();
      }
    );
  });

  describe('LaunchWizard', () => {
    it('should render wizard with Prompt on Launch header', () => {
      const handleSubmit = vi.fn(() => Promise.resolve());
      render(
        <MemoryRouter>
          <LaunchWizard
            template={mockTemplate}
            config={makeConfig()}
            handleSubmit={handleSubmit}
            jobType="job_templates"
          />
        </MemoryRouter>
      );

      expect(screen.getByText('Prompt on Launch')).toBeInTheDocument();
    });

    it('should not call useLabelPayload when ask_labels_on_launch is false', async () => {
      const { useLabelPayload } = await import('../hooks/useLabelPayload');
      const mockCreateLabelPayload = vi.fn(() => Promise.resolve([]));
      vi.mocked(useLabelPayload).mockReturnValue(mockCreateLabelPayload);

      render(
        <MemoryRouter initialEntries={['/job-templates/1/launch']}>
          <Routes>
            <Route
              path="/job-templates/:id/launch"
              element={<LaunchTemplate jobType="job_templates" />}
            />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Prompt on Launch')).toBeInTheDocument();
      });

      // createLabelPayload should NOT have been called yet (no form submission)
      expect(mockCreateLabelPayload).not.toHaveBeenCalled();
    });

    it('should show wizard with labels step hidden when ask_labels_on_launch is false', () => {
      render(
        <MemoryRouter>
          <LaunchWizard
            template={mockTemplate}
            config={makeConfig({ ask_labels_on_launch: false })}
            handleSubmit={vi.fn(() => Promise.resolve())}
            jobType="job_templates"
          />
        </MemoryRouter>
      );

      expect(screen.getAllByText('Review').length).toBeGreaterThan(0);
    });

    it('should render wizard with non-zero inventory id in initial values', () => {
      render(
        <MemoryRouter>
          <LaunchWizard
            template={mockTemplate}
            config={makeConfig({
              defaults: { ...baseDefaults, inventory: { id: 5, name: 'Test Inv' } },
            })}
            handleSubmit={vi.fn(() => Promise.resolve())}
            jobType="job_templates"
          />
        </MemoryRouter>
      );
      expect(screen.getByText('Prompt on Launch')).toBeInTheDocument();
    });

    it('should render breadcrumb for workflow_job_template type', () => {
      const wjtTemplate = {
        ...mockTemplate,
        type: 'workflow_job_template' as const,
        name: 'My WJT',
      };
      render(
        <MemoryRouter>
          <LaunchWizard
            template={wjtTemplate as unknown as JobTemplate}
            config={makeConfig()}
            handleSubmit={vi.fn(() => Promise.resolve())}
            jobType="workflow_job_templates"
          />
        </MemoryRouter>
      );
      expect(screen.getByTestId('My WJT')).toBeInTheDocument();
    });

    it('should hide Credential Passwords step when no credentials require passwords', () => {
      render(
        <MemoryRouter>
          <LaunchWizard
            template={mockTemplate}
            config={makeConfig()}
            handleSubmit={vi.fn(() => Promise.resolve())}
            jobType="job_templates"
          />
        </MemoryRouter>
      );
      expect(screen.queryByTestId('wizard-nav-item-credential_passwords')).not.toBeInTheDocument();
    });

    it('should show Credential Passwords step when passwords_needed_to_start is set and credential is not asked', () => {
      render(
        <MemoryRouter>
          <LaunchWizard
            template={mockTemplate}
            config={makeConfig({
              ask_credential_on_launch: false,
              passwords_needed_to_start: ['ssh_password'],
            })}
            handleSubmit={vi.fn(() => Promise.resolve())}
            jobType="job_templates"
          />
        </MemoryRouter>
      );
      expect(screen.getByTestId('wizard-nav-item-credential_passwords')).toBeInTheDocument();
    });

    it('should show Credential Passwords step when a default credential has ASK inputs', () => {
      const credWithAsk: LaunchConfigCredential = {
        id: 1,
        name: 'SSH Cred',
        credential_type: 1,
        passwords_needed: [],
        inputs: { password: 'ASK' },
      };
      render(
        <MemoryRouter>
          <LaunchWizard
            template={mockTemplate}
            config={makeConfig({
              ask_credential_on_launch: true,
              defaults: { ...baseDefaults, credentials: [credWithAsk] },
            })}
            handleSubmit={vi.fn(() => Promise.resolve())}
            jobType="job_templates"
          />
        </MemoryRouter>
      );
      expect(screen.getByTestId('wizard-nav-item-credential_passwords')).toBeInTheDocument();
    });

    it('should show Credential Passwords step when a default credential has passwords_needed', () => {
      const credWithPasswordsNeeded: LaunchConfigCredential = {
        id: 2,
        name: 'Key Cred',
        credential_type: 1,
        passwords_needed: ['ssh_password'],
      };
      render(
        <MemoryRouter>
          <LaunchWizard
            template={mockTemplate}
            config={makeConfig({
              ask_credential_on_launch: true,
              defaults: { ...baseDefaults, credentials: [credWithPasswordsNeeded] },
            })}
            handleSubmit={vi.fn(() => Promise.resolve())}
            jobType="job_templates"
          />
        </MemoryRouter>
      );
      expect(screen.getByTestId('wizard-nav-item-credential_passwords')).toBeInTheDocument();
    });
  });

  describe('LaunchTemplate - additional coverage', () => {
    it('should render AwxError when template fetch returns an error', async () => {
      server.use(http.get(awxAPI`/job_templates/1/`, () => HttpResponse.json({}, { status: 500 })));
      render(
        <MemoryRouter initialEntries={['/job-templates/1/launch']}>
          <Routes>
            <Route
              path="/job-templates/:id/launch"
              element={<LaunchTemplate jobType="job_templates" />}
            />
          </Routes>
        </MemoryRouter>
      );
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Refresh' })).toBeInTheDocument();
      });
    });

    it('should launch a workflow job template successfully', { timeout: 15000 }, async () => {
      let wjtLaunched = false;
      server.use(
        http.get(awxAPI`/workflow_job_templates/1/`, () => HttpResponse.json(mockWJT)),
        http.get(awxAPI`/workflow_job_templates/1/launch/`, () => HttpResponse.json(makeConfig())),
        http.post(awxAPI`/workflow_job_templates/1/launch/`, () => {
          wjtLaunched = true;
          return HttpResponse.json({ id: 200, type: 'workflow_job' });
        })
      );
      const user = userEvent.setup();
      render(
        <MemoryRouter initialEntries={['/workflow-job-templates/1/launch']}>
          <Routes>
            <Route
              path="/workflow-job-templates/:id/launch"
              element={<LaunchTemplate jobType="workflow_job_templates" />}
            />
          </Routes>
        </MemoryRouter>
      );
      await waitFor(() => expect(screen.getByText('Prompt on Launch')).toBeInTheDocument());
      await user.click(screen.getByTestId('wizard-next'));
      await waitFor(() => {
        expect(wjtLaunched).toBe(true);
      });
    });

    it(
      'should show failure alert when the launch POST request fails',
      { timeout: 15000 },
      async () => {
        mockAddAlert.mockClear();
        server.use(
          http.post(awxAPI`/job_templates/1/launch/`, () => HttpResponse.json({}, { status: 500 }))
        );
        const user = userEvent.setup();
        render(
          <MemoryRouter initialEntries={['/job-templates/1/launch']}>
            <Routes>
              <Route
                path="/job-templates/:id/launch"
                element={<LaunchTemplate jobType="job_templates" />}
              />
            </Routes>
          </MemoryRouter>
        );
        await waitFor(() => expect(screen.getByText('Prompt on Launch')).toBeInTheDocument());
        await user.click(screen.getByTestId('wizard-next'));
        await waitFor(() => {
          expect(mockAddAlert).toHaveBeenCalledWith(
            expect.objectContaining({ title: 'Failure to launch', variant: 'danger' })
          );
        });
      }
    );

    it(
      'should include labels in the launch payload when labelPayload is non-empty',
      { timeout: 15000 },
      async () => {
        const { useLabelPayload } = await import('../hooks/useLabelPayload');
        const mockCreateLabelPayload = vi.fn(() => Promise.resolve([1, 2]));
        vi.mocked(useLabelPayload).mockReturnValue(mockCreateLabelPayload);

        let capturedPayload: Record<string, unknown> = {};
        server.use(
          http.get(awxAPI`/job_templates/1/launch/`, () =>
            HttpResponse.json(makeConfig({ ask_labels_on_launch: true }))
          ),
          http.post(awxAPI`/job_templates/1/launch/`, async ({ request }) => {
            capturedPayload = (await request.json()) as Record<string, unknown>;
            return HttpResponse.json({ id: 100, type: 'job' });
          })
        );

        const user = userEvent.setup();
        render(
          <MemoryRouter initialEntries={['/job-templates/1/launch']}>
            <Routes>
              <Route
                path="/job-templates/:id/launch"
                element={<LaunchTemplate jobType="job_templates" />}
              />
            </Routes>
          </MemoryRouter>
        );

        await waitFor(() => expect(screen.getByText('Prompt on Launch')).toBeInTheDocument());
        await waitFor(() => expect(screen.getByTestId('Submit')).toBeInTheDocument());
        await user.click(screen.getByTestId('Submit'));
        await waitFor(() => expect(screen.getByTestId('wizard-next')).toBeInTheDocument());
        await user.click(screen.getByTestId('wizard-next'));

        await waitFor(() => {
          expect(capturedPayload.labels).toEqual([1, 2]);
        });
      }
    );

    it(
      'should merge survey answers into extra_vars when survey_enabled is true',
      { timeout: 15000 },
      async () => {
        let capturedPayload: Record<string, unknown> = {};
        server.use(
          http.get(awxAPI`/job_templates/1/launch/`, () =>
            HttpResponse.json(makeConfig({ survey_enabled: true }))
          ),
          http.post(awxAPI`/job_templates/1/launch/`, async ({ request }) => {
            capturedPayload = (await request.json()) as Record<string, unknown>;
            return HttpResponse.json({ id: 100, type: 'job' });
          })
        );

        const user = userEvent.setup();
        render(
          <MemoryRouter initialEntries={['/job-templates/1/launch']}>
            <Routes>
              <Route
                path="/job-templates/:id/launch"
                element={<LaunchTemplate jobType="job_templates" />}
              />
            </Routes>
          </MemoryRouter>
        );

        await waitFor(() => expect(screen.getByText('Prompt on Launch')).toBeInTheDocument());
        await waitFor(() => expect(screen.getByTestId('Submit')).toBeInTheDocument());
        await user.click(screen.getByTestId('Submit'));
        await waitFor(() => expect(screen.getByTestId('wizard-next')).toBeInTheDocument());
        await user.click(screen.getByTestId('wizard-next'));

        await waitFor(() => {
          expect(capturedPayload).toHaveProperty('extra_vars');
        });
      }
    );

    it(
      'should include credential_passwords in payload when passwords_needed_to_start is set',
      { timeout: 15000 },
      async () => {
        let capturedPayload: Record<string, unknown> = {};
        server.use(
          http.get(awxAPI`/job_templates/1/launch/`, () =>
            HttpResponse.json(
              makeConfig({
                ask_credential_on_launch: false,
                passwords_needed_to_start: ['ssh_password'],
              })
            )
          ),
          http.post(awxAPI`/job_templates/1/launch/`, async ({ request }) => {
            capturedPayload = (await request.json()) as Record<string, unknown>;
            return HttpResponse.json({ id: 100, type: 'job' });
          })
        );

        const user = userEvent.setup();
        render(
          <MemoryRouter initialEntries={['/job-templates/1/launch']}>
            <Routes>
              <Route
                path="/job-templates/:id/launch"
                element={<LaunchTemplate jobType="job_templates" />}
              />
            </Routes>
          </MemoryRouter>
        );

        await waitFor(() => expect(screen.getByText('Prompt on Launch')).toBeInTheDocument());
        await waitFor(() => expect(screen.getByTestId('launch-ssh-password')).toBeInTheDocument());
        await user.type(screen.getByTestId('launch-ssh-password'), 'secret');
        await user.click(screen.getByTestId('Submit'));
        await waitFor(() => expect(screen.getByTestId('wizard-next')).toBeInTheDocument());
        await user.click(screen.getByTestId('wizard-next'));

        await waitFor(() => {
          expect(capturedPayload.credential_passwords).toBeDefined();
        });
      }
    );
  });
});
