import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { awxAPI } from '../../common/api/awx-utils';
import { CreateJobTemplate, EditJobTemplate } from './TemplateForm';

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

const mockJobTemplate = {
  id: 42,
  name: 'My Job Template',
  description: 'A test template',
  job_type: 'run',
  inventory: 1,
  project: 1,
  playbook: 'hello_world.yml',
  scm_branch: '',
  forks: 5,
  limit: '',
  verbosity: 1,
  extra_vars: '---\n',
  job_tags: 'deploy,setup',
  skip_tags: '',
  timeout: 120,
  diff_mode: false,
  job_slice_count: 1,
  host_config_key: '',
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
  become_enabled: false,
  allow_simultaneous: false,
  use_fact_cache: false,
  prevent_instance_group_fallback: false,
  organization: 1,
  webhook_service: '',
  webhook_credential: null as number | null,
  opa_query_path: '',
  related: {
    webhook_receiver: '',
    callback: '',
    webhook_key: '',
  },
  summary_fields: {
    organization: { id: 1, name: 'Default', description: '' },
    project: { id: 1, name: 'Demo Project' },
    inventory: { id: 1, name: 'Demo Inventory', description: '', kind: '' },
    credentials: [],
    labels: { count: 0, results: [] },
    execution_environment: null,
    user_capabilities: { edit: true, delete: true, start: true, copy: true, schedule: true },
  },
};

const server = setupServer(
  http.options('*', () => HttpResponse.json({})),
  http.get(awxAPI`/projects/`, () =>
    HttpResponse.json({ count: 1, results: [{ id: 1, name: 'Demo Project', organization: 1 }] })
  ),
  http.get(awxAPI`/inventories/`, () =>
    HttpResponse.json({ count: 1, results: [{ id: 1, name: 'Demo Inventory' }] })
  ),
  http.get(
    ({ request }) => /\/projects\/\d+\/?$/.test(new URL(request.url).pathname),
    () => HttpResponse.json({ id: 1, name: 'Demo Project', organization: 1, allow_override: false })
  ),
  http.get(
    ({ request }) => request.url.includes('/playbooks'),
    () => HttpResponse.json(['hello_world.yml', 'test.yml'])
  ),
  http.get(awxAPI`/labels/`, () => HttpResponse.json({ count: 0, results: [] })),
  http.get(awxAPI`/credential_types/`, () => HttpResponse.json({ count: 0, results: [] })),
  http.get(awxAPI`/credentials/`, () => HttpResponse.json({ count: 0, results: [] })),
  http.get(awxAPI`/execution_environments/`, () => HttpResponse.json({ count: 0, results: [] })),
  http.get(awxAPI`/instance_groups/`, () => HttpResponse.json({ count: 0, results: [] })),
  http.get(awxAPI`/organizations/`, () =>
    HttpResponse.json({ count: 1, results: [{ id: 1, name: 'Default' }] })
  ),
  http.get(awxAPI`/job_templates/42/`, () => HttpResponse.json(mockJobTemplate)),
  http.get(awxAPI`/job_templates/42/instance_groups/`, () =>
    HttpResponse.json({ count: 0, results: [] })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('TemplateForm - CreateJobTemplate', () => {
  it('should render Create job template title', async () => {
    render(
      <MemoryRouter>
        <CreateJobTemplate />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('page-title')).toHaveTextContent('Create job template');
    });
  });

  it('should render Create button and Cancel button', async () => {
    render(
      <MemoryRouter>
        <CreateJobTemplate />
      </MemoryRouter>
    );

    await waitFor(
      () => {
        expect(screen.getByRole('button', { name: /create job template/i })).toBeInTheDocument();
      },
      { timeout: 10000 }
    );

    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  }, 15000);

  it('should render name and description fields', async () => {
    render(
      <MemoryRouter>
        <CreateJobTemplate />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/enter job template name/i)).toBeInTheDocument();
    });

    expect(screen.getByPlaceholderText(/enter description/i)).toBeInTheDocument();
  });

  it('should render job type selector', async () => {
    render(
      <MemoryRouter>
        <CreateJobTemplate />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Job type')).toBeInTheDocument();
    });
  });

  it('should render forks, timeout, and verbosity fields', async () => {
    render(
      <MemoryRouter>
        <CreateJobTemplate />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Forks')).toBeInTheDocument();
    });

    expect(screen.getByText('Timeout')).toBeInTheDocument();
    expect(screen.getByText('Verbosity')).toBeInTheDocument();
  });

  it('should render option checkboxes', async () => {
    render(
      <MemoryRouter>
        <CreateJobTemplate />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Privilege escalation')).toBeInTheDocument();
    });

    expect(screen.getByText('Provisioning callback')).toBeInTheDocument();
    expect(screen.getByText('Enable webhook')).toBeInTheDocument();
    expect(screen.getByText('Concurrent jobs')).toBeInTheDocument();
    expect(screen.getByText('Enable fact storage')).toBeInTheDocument();
    expect(screen.getByText('Prevent instance group fallback')).toBeInTheDocument();
  });

  it('should render extra variables editor', async () => {
    render(
      <MemoryRouter>
        <CreateJobTemplate />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Extra variables')).toBeInTheDocument();
    });
  });

  it('should render job tags and skip tags fields', async () => {
    render(
      <MemoryRouter>
        <CreateJobTemplate />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Job tags')).toBeInTheDocument();
    });

    expect(screen.getByText('Skip tags')).toBeInTheDocument();
  });
});

describe('TemplateForm - EditJobTemplate', () => {
  it('should render edit title with template name', async () => {
    render(
      <MemoryRouter initialEntries={['/templates/job_template/42/edit']}>
        <Routes>
          <Route path="/templates/job_template/:id/edit" element={<EditJobTemplate />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('page-title')).toHaveTextContent('Edit My Job Template');
    });
  });

  it('should render save button and cancel button in edit mode', async () => {
    render(
      <MemoryRouter initialEntries={['/templates/job_template/42/edit']}>
        <Routes>
          <Route path="/templates/job_template/:id/edit" element={<EditJobTemplate />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(
      () => {
        expect(screen.getByRole('button', { name: /save job template/i })).toBeInTheDocument();
      },
      { timeout: 10000 }
    );

    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  }, 15000);

  it('should preload name and description from template data', async () => {
    render(
      <MemoryRouter initialEntries={['/templates/job_template/42/edit']}>
        <Routes>
          <Route path="/templates/job_template/:id/edit" element={<EditJobTemplate />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(
      () => {
        expect(screen.getByDisplayValue('My Job Template')).toBeInTheDocument();
      },
      { timeout: 10000 }
    );

    expect(screen.getByDisplayValue('A test template')).toBeInTheDocument();
  }, 15000);

  it('should render error when template fetch fails', async () => {
    server.use(
      http.get(awxAPI`/job_templates/42/`, () =>
        HttpResponse.json({ detail: 'Not Found' }, { status: 404 })
      )
    );

    render(
      <MemoryRouter initialEntries={['/templates/job_template/42/edit']}>
        <Routes>
          <Route path="/templates/job_template/:id/edit" element={<EditJobTemplate />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Not Found')).toBeInTheDocument();
    });
  });

  it('should preload forks and timeout values', async () => {
    render(
      <MemoryRouter initialEntries={['/templates/job_template/42/edit']}>
        <Routes>
          <Route path="/templates/job_template/:id/edit" element={<EditJobTemplate />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(
      () => {
        expect(screen.getByDisplayValue('My Job Template')).toBeInTheDocument();
      },
      { timeout: 10000 }
    );

    expect(screen.getByDisplayValue('5')).toBeInTheDocument();
    expect(screen.getByDisplayValue('120')).toBeInTheDocument();
  }, 15000);
});
