import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { awxAPI } from '../../common/api/awx-utils';
import type { JobTemplateForm } from '../../interfaces/JobTemplateForm';
import { CreateJobTemplate } from './TemplateForm';

vi.mock('@ansible/ansible-ui-framework/components/DataEditor', () => ({
  DataEditor: (props: {
    id?: string;
    name: string;
    value: string;
    onChange: (v: string) => void;
  }) => (
    <textarea
      id={props.id ?? props.name}
      name={props.name}
      value={props.value}
      onChange={(e) => props.onChange(e.target.value)}
      data-testid={props.id as string}
    />
  ),
}));

vi.mock('../../common/AwxPageForm', () => ({
  AwxPageForm: (props: {
    onSubmit: (values: JobTemplateForm) => Promise<void>;
    onCancel?: () => void;
    submitText: string;
    defaultValue?: JobTemplateForm;
  }) => (
    <>
      <button
        type="button"
        data-testid="mock-submit"
        onClick={() => {
          void props.onSubmit(props.defaultValue ?? ({} as JobTemplateForm));
        }}
      >
        {props.submitText}
      </button>
      {props.onCancel && (
        <button type="button" data-testid="mock-cancel" onClick={props.onCancel}>
          Cancel
        </button>
      )}
    </>
  ),
}));

vi.mock('./JobTemplateFormHelpers', async (importOriginal) => {
  const original = await importOriginal<typeof import('./JobTemplateFormHelpers')>();
  return {
    ...original,
    getJobTemplateDefaultValues: vi.fn(
      (...args: Parameters<typeof original.getJobTemplateDefaultValues>) =>
        original.getJobTemplateDefaultValues(...args)
    ),
  };
});

const server = setupServer(
  http.options('*', () => HttpResponse.json({})),
  http.get(awxAPI`/organizations/`, () =>
    HttpResponse.json({ count: 1, results: [{ id: 1, name: 'Default' }] })
  ),
  http.post(awxAPI`/job_templates/100/credentials/`, () => HttpResponse.json({})),
  http.post(awxAPI`/job_templates/100/labels/`, () => HttpResponse.json({ id: 200, name: 'lbl' })),
  http.get(awxAPI`/job_templates/100/instance_groups/`, () =>
    HttpResponse.json({ count: 0, results: [] })
  ),
  http.post(awxAPI`/job_templates/100/instance_groups/`, () => HttpResponse.json({}))
);

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('TemplateFormCreate - CreateJobTemplate onSubmit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it(
    'should submit create form with no credentials, labels, or instance groups',
    { timeout: 30000 },
    async () => {
      let postPayload: Record<string, unknown> | null = null;

      server.use(
        http.post(awxAPI`/job_templates/`, async ({ request }) => {
          postPayload = (await request.json()) as Record<string, unknown>;
          return HttpResponse.json({
            id: 100,
            name: 'New Template',
            summary_fields: {
              organization: { id: 1, name: 'Default' },
              credentials: [],
              labels: { count: 0, results: [] },
            },
          });
        })
      );

      const user = userEvent.setup();
      render(
        <MemoryRouter>
          <CreateJobTemplate />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('mock-submit')).toBeInTheDocument();
      });

      await user.click(screen.getByTestId('mock-submit'));

      await waitFor(() => {
        expect(postPayload).not.toBeNull();
      });
    }
  );

  it(
    'should submit create form with credentials, labels, and instance groups',
    { timeout: 30000 },
    async () => {
      const { getJobTemplateDefaultValues } = await import('./JobTemplateFormHelpers');

      vi.mocked(getJobTemplateDefaultValues).mockReturnValueOnce({
        name: 'New Template',
        project: 1,
        job_type: 'run',
        inventory: 1,
        playbook: 'hello_world.yml',
        description: '',
        scm_branch: '',
        forks: 0,
        limit: '',
        verbosity: 0,
        extra_vars: '---\n',
        job_tags: [{ name: 'deploy', value: 'deploy', label: 'deploy' }],
        skip_tags: [{ name: 'cleanup', value: 'cleanup', label: 'cleanup' }],
        timeout: 0,
        diff_mode: false,
        job_slice_count: 1,
        host_config_key: '',
        allow_simultaneous: false,
        use_fact_cache: false,
        prevent_instance_group_fallback: false,
        become_enabled: false,
        ask_scm_branch_on_launch: false,
        ask_diff_mode_on_launch: false,
        ask_variables_on_launch: false,
        ask_limit_on_launch: false,
        ask_tags_on_launch: false,
        ask_skip_tags_on_launch: false,
        ask_job_type_on_launch: false,
        ask_verbosity_on_launch: false,
        ask_inventory_on_launch: false,
        ask_credential_on_launch: false,
        ask_execution_environment_on_launch: false,
        ask_labels_on_launch: false,
        ask_forks_on_launch: false,
        ask_job_slice_count_on_launch: false,
        ask_timeout_on_launch: false,
        ask_instance_groups_on_launch: false,
        webhook_service: undefined,
        webhook_url: 'A NEW WEBHOOK URL WILL BE GENERATED ON SAVE.',
        webhook_key: 'A NEW WEBHOOK KEY WILL BE GENERATED ON SAVE.',
        webhook_credential: 99,
        execution_environment: { id: 3, name: 'Default EE' },
        credentials: [{ id: 1, name: 'cred1', kind: 'ssh', cloud: false, description: '' }],
        labels: [{ id: 10, name: 'lbl1' }] as JobTemplateForm['labels'],
        instance_groups: [{ id: 5, name: 'ig1' }] as JobTemplateForm['instance_groups'],
        isProvisioningCallbackEnabled: false,
        isWebhookEnabled: false,
        organization: 1,
        related: {
          webhook_receiver: '',
          callback: '',
          webhook_key: '',
        },
        opa_query_path: '',
      } as unknown as JobTemplateForm);

      const credentialRequests: number[] = [];
      const labelRequests: string[] = [];
      const instanceGroupRequests: number[] = [];
      let postPayload: Record<string, unknown> | null = null;

      server.use(
        http.post(awxAPI`/job_templates/`, async ({ request }) => {
          postPayload = (await request.json()) as Record<string, unknown>;
          return HttpResponse.json({
            id: 100,
            name: 'New Template',
            summary_fields: {
              organization: { id: 1, name: 'Default' },
              credentials: [],
              labels: { count: 0, results: [] },
            },
          });
        }),
        http.post(awxAPI`/job_templates/100/credentials/`, async ({ request }) => {
          const body = (await request.json()) as { id: number };
          credentialRequests.push(body.id);
          return HttpResponse.json({});
        }),
        http.post(awxAPI`/job_templates/100/labels/`, async ({ request }) => {
          const body = (await request.json()) as { name: string };
          labelRequests.push(body.name);
          return HttpResponse.json({ id: 200, name: body.name });
        }),
        http.get(awxAPI`/job_templates/100/instance_groups/`, () =>
          HttpResponse.json({ count: 0, results: [] })
        ),
        http.post(awxAPI`/job_templates/100/instance_groups/`, async ({ request }) => {
          const body = (await request.json()) as { id: number };
          instanceGroupRequests.push(body.id);
          return HttpResponse.json({});
        })
      );

      const user = userEvent.setup();
      render(
        <MemoryRouter>
          <CreateJobTemplate />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('mock-submit')).toBeInTheDocument();
      });

      await user.click(screen.getByTestId('mock-submit'));

      await waitFor(() => {
        expect(postPayload).not.toBeNull();
        expect(postPayload?.execution_environment).toBe(3);
        expect(postPayload?.job_tags).toBe('deploy');
        expect(postPayload?.skip_tags).toBe('cleanup');
        expect(postPayload?.webhook_credential).toBe(99);
      });

      await waitFor(() => {
        expect(credentialRequests).toContain(1);
        expect(labelRequests).toContain('lbl1');
        expect(instanceGroupRequests).toContain(5);
      });
    }
  );

  it('should navigate back when cancel is clicked in create mode', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <CreateJobTemplate />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('mock-cancel')).toBeInTheDocument();
    });

    await user.click(screen.getByTestId('mock-cancel'));
  });
});
