import { render, screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { FormProvider, useForm } from 'react-hook-form';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { JobTemplateForm } from '../../interfaces/JobTemplateForm';
import { Project } from '../../interfaces/Project';
import { JobTemplateInputs } from './JobTemplateInputs';

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
      data-testid="data-editor"
    />
  ),
}));

vi.mock('../../access/credentials/components/PageFormCredentialSelect', () => ({
  PageFormCredentialSelect: (props: { label?: string }) => (
    <div data-testid="credential-select">{props.label}</div>
  ),
}));

vi.mock('../projects/components/PageFormProjectSelect', () => ({
  PageFormProjectSelect: () => <div data-testid="project-select" />,
}));

vi.mock('../inventories/components/PageFormInventorySelect', () => ({
  PageFormInventorySelect: () => <div data-testid="inventory-select" />,
}));

vi.mock('./components/PageFormPlaybookSelect', () => ({
  PageFormPlaybookSelect: () => <div data-testid="playbook-select" />,
}));

vi.mock(
  '../../administration/execution-environments/components/PageFormSelectExecutionEnvironment',
  () => ({
    PageFormSelectExecutionEnvironment: () => <div data-testid="execution-environment-select" />,
  })
);

vi.mock('../../administration/instance-groups/components/PageFormInstanceGroupSelect', () => ({
  PageFormInstanceGroupSelect: () => <div data-testid="instance-group-select" />,
}));

vi.mock('./components/WebhookSubForm', () => ({
  WebhookSubForm: () => <div data-testid="webhook-subform" />,
}));

const mockProject: Project = {
  id: 1,
  name: 'Demo Project',
  organization: 1,
  allow_override: false,
  description: '',
  scm_type: 'git',
  type: 'project',
  base_dir: '/tmp/projects',
  summary_fields: {} as Project['summary_fields'],
  related: {} as Project['related'],
} as Project;

const server = setupServer(
  http.get(
    ({ request }) =>
      request.url.includes('/api/v2/projects/1') && !request.url.includes('/playbooks/'),
    () => HttpResponse.json(mockProject)
  ),
  http.get(
    ({ request }) => request.url.includes('/api/v2/projects/1/playbooks/'),
    () => HttpResponse.json(['hello_world.yml', 'test.yml'])
  ),
  http.get(
    ({ request }) => request.url.includes('/api/v2/labels/'),
    () => HttpResponse.json({ count: 0, results: [] })
  )
);

function TestWrapper({ children }: { children: React.ReactNode }) {
  const methods = useForm<JobTemplateForm>({
    defaultValues: {
      project: 1,
      name: '',
      job_type: 'run',
      become_enabled: false,
      isProvisioningCallbackEnabled: false,
      isWebhookEnabled: false,
      allow_simultaneous: false,
      use_fact_cache: false,
      prevent_instance_group_fallback: false,
    },
  });
  return (
    <MemoryRouter>
      <FormProvider {...methods}>{children}</FormProvider>
    </MemoryRouter>
  );
}

describe('JobTemplateInputs', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterAll(() => server.close());
  afterEach(() => server.resetHandlers());

  it('should render Name label', () => {
    render(
      <TestWrapper>
        <JobTemplateInputs />
      </TestWrapper>
    );

    expect(screen.getByText('Name')).toBeInTheDocument();
  });

  it('should render Job type label', () => {
    render(
      <TestWrapper>
        <JobTemplateInputs />
      </TestWrapper>
    );

    expect(screen.getByText('Job type')).toBeInTheDocument();
  });

  it('should render all form sections', () => {
    render(
      <TestWrapper>
        <JobTemplateInputs />
      </TestWrapper>
    );

    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Credentials')).toBeInTheDocument();
    expect(screen.getByText('Labels')).toBeInTheDocument();
    expect(screen.getByText('Forks')).toBeInTheDocument();
    expect(screen.getByText('Limit')).toBeInTheDocument();
    expect(screen.getByText('Verbosity')).toBeInTheDocument();
    expect(screen.getByText('Job slicing')).toBeInTheDocument();
    expect(screen.getByText('Timeout')).toBeInTheDocument();
    expect(screen.getByText('Job tags')).toBeInTheDocument();
    expect(screen.getByText('Skip tags')).toBeInTheDocument();
  });

  it('should render Options section with all checkboxes', () => {
    render(
      <TestWrapper>
        <JobTemplateInputs />
      </TestWrapper>
    );

    expect(screen.getByText('Options')).toBeInTheDocument();
    expect(screen.getByText('Privilege escalation')).toBeInTheDocument();
    expect(screen.getByText('Provisioning callback')).toBeInTheDocument();
    expect(screen.getByText('Enable webhook')).toBeInTheDocument();
    expect(screen.getByText('Concurrent jobs')).toBeInTheDocument();
    expect(screen.getByText('Enable fact storage')).toBeInTheDocument();
    expect(screen.getByText('Prevent instance group fallback')).toBeInTheDocument();
  });

  it('should render with job template data', () => {
    const jobtemplate = {
      id: 1,
      name: 'Test Template',
      job_tags: ['tag1', 'tag2'],
      skip_tags: ['skip1'],
    } as unknown as JobTemplateForm;

    render(
      <TestWrapper>
        <JobTemplateInputs jobtemplate={jobtemplate} />
      </TestWrapper>
    );

    expect(screen.getByText('Name')).toBeInTheDocument();
  });
});
