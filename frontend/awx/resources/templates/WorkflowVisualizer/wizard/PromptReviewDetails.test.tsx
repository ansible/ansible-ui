import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { JobTemplate } from '../../../../interfaces/JobTemplate';
import type { WorkflowJobTemplate } from '../../../../interfaces/WorkflowJobTemplate';
import type { WizardFormValues } from '../types';
import { PromptReviewDetails } from './PromptReviewDetails';

const mockUsePageWizard = vi.hoisted(() => vi.fn());
const mockUseGet = vi.hoisted(() => vi.fn(() => ({ data: undefined as unknown })));
const mockUseGetItem = vi.hoisted(() => vi.fn(() => ({ data: undefined as unknown })));

vi.mock('@ansible/ansible-ui-framework/PageWizard/PageWizardProvider', () => ({
  usePageWizard: mockUsePageWizard,
}));

vi.mock('@ansible/ansible-ui-framework', () => ({
  PageDetail: ({ label, children }: Readonly<{ label: string; children?: React.ReactNode }>) => (
    <div>
      <span>{label}</span>
      {children}
    </div>
  ),
  useGetPageUrl: () => (route: string, options: { params: Record<string, unknown> }) =>
    `${route}/${JSON.stringify(options.params)}`,
}));

vi.mock('@ansible/ansible-ui-framework/PageDetails/PageDetailCodeEditor', () => ({
  PageDetailCodeEditor: ({ value }: Readonly<{ value: string }>) => (
    <pre data-testid="extra-vars">{value}</pre>
  ),
}));

vi.mock('@ansible/common-ui/crud/useGet', () => ({
  useGet: mockUseGet,
  useGetItem: mockUseGetItem,
}));

vi.mock('../../../../common/useVerbosityString', () => ({
  useVerbosityString: (verbosity: number) => `verbosity-${verbosity}`,
}));

vi.mock('../../../../common/api/awx-utils', () => ({
  awxAPI: (strings: TemplateStringsArray, ...values: string[]) =>
    strings.reduce((result, string, index) => result + string + (values[index] ?? ''), ''),
}));

vi.mock('../../JobTemplateFormHelpers', () => ({
  parseStringToTagArray: (tags: string) => tags.split(',').map((name) => ({ name })),
}));

vi.mock('../../TemplatePage/steps/TemplateLaunchReviewStep', () => ({
  CredentialDetail: ({ credential }: Readonly<{ credential: { name: string } }>) => (
    <span>{credential.name}</span>
  ),
}));

vi.mock('@patternfly/react-core', () => ({
  Label: ({
    children,
    render,
  }: Readonly<{
    children: React.ReactNode;
    render?: (props: { content: React.ReactNode; className: string }) => React.ReactNode;
  }>) => (render ? render({ content: children, className: 'label' }) : <span>{children}</span>),
  LabelGroup: ({ children }: Readonly<{ children?: React.ReactNode }>) => <div>{children}</div>,
}));

function renderReview(
  template: JobTemplate | WorkflowJobTemplate | null,
  prompt: Partial<WizardFormValues['prompt']> = {},
  survey?: WizardFormValues['survey'],
  labels: { name: string; id?: number }[] = [{ name: 'prop label' }]
) {
  mockUsePageWizard.mockReturnValue({ wizardData: { resource: template, prompt, survey } });
  return render(
    <MemoryRouter>
      <PromptReviewDetails labels={labels} />
    </MemoryRouter>
  );
}

const jobTemplate = {
  id: 42,
  type: 'job_template',
  playbook: 'site.yml',
  summary_fields: {
    organization: { id: 7, name: 'Org' },
    inventory: { id: 8, name: 'Template inventory', kind: '' },
    project: { id: 9, name: 'Project' },
  },
} as unknown as JobTemplate;

const workflowTemplate = {
  id: 43,
  type: 'workflow_job_template',
  summary_fields: {},
} as unknown as WorkflowJobTemplate;

describe('PromptReviewDetails', () => {
  beforeEach(() => {
    mockUsePageWizard.mockReset();
    mockUseGet.mockReturnValue({ data: undefined });
    mockUseGetItem.mockReturnValue({ data: undefined });
  });

  it('returns null when the wizard has no template', () => {
    const { container } = renderReview(null);
    expect(container).toBeEmptyDOMElement();
    expect(mockUseGet).toHaveBeenCalledWith('');
  });

  it('renders job template prompt details and processes survey values', () => {
    mockUseGet.mockReturnValue({ data: { spec: [{ type: 'password', variable: 'secret' }] } });
    mockUseGetItem
      .mockReturnValueOnce({ data: { id: 11, name: 'Execution environment' } })
      .mockReturnValueOnce({ data: { id: 8, name: 'Loaded inventory' } });

    renderReview(
      jobTemplate,
      {
        inventory: { id: 8, kind: 'smart', name: 'Inventory' },
        credentials: [{ id: 1, name: 'Credential' }] as never,
        instance_groups: [{ id: 2, name: 'Instance group' }] as never,
        execution_environment: { id: 11, name: 'EE' },
        diff_mode: true,
        scm_branch: 'main',
        extra_vars: 'existing: value',
        forks: 3,
        job_slice_count: 2,
        job_tags: 'tag-one,tag-two' as never,
        job_type: 'run',
        limit: 'web',
        skip_tags: [{ name: 'skip-me' }],
        timeout: 60,
        verbosity: 2,
      },
      { secret: 'password' }
    );

    expect(screen.getByText('site.yml')).toBeInTheDocument();
    expect(screen.getAllByText('Project').length).toBe(2);
    expect(screen.getByText('Loaded inventory')).toBeInTheDocument();
    expect(screen.getByText('Credential')).toBeInTheDocument();
    expect(screen.getByText('Instance group')).toBeInTheDocument();
    expect(screen.getByText('tag-one')).toBeInTheDocument();
    expect(screen.getByText('skip-me')).toBeInTheDocument();
    expect(screen.getByText('On')).toBeInTheDocument();
    expect(screen.getByText('verbosity-2')).toBeInTheDocument();
    expect(screen.getByTestId('extra-vars')).toHaveTextContent('$encrypted$');
  });

  it('handles an unsupported template type', () => {
    renderReview({ id: 44, type: 'unsupported', summary_fields: {} } as unknown as JobTemplate);
    expect(mockUseGet).toHaveBeenCalledWith('');
  });

  it('renders workflow template details and empty/default prompt values', () => {
    renderReview(
      workflowTemplate,
      {
        credentials: [],
        instance_groups: [],
        execution_environment: {},
        diff_mode: false,
        job_tags: [],
        skip_tags: [],
        extra_vars: undefined,
        forks: undefined,
        timeout: undefined,
        verbosity: undefined,
      },
      undefined,
      []
    );

    expect(screen.queryByText('site.yml')).not.toBeInTheDocument();
    expect(screen.getByText('Off')).toBeInTheDocument();
    expect(screen.getByText('verbosity-NaN')).toBeInTheDocument();
    expect(screen.getAllByText('0').length).toBe(2);
    expect(mockUseGet).toHaveBeenCalledWith('/workflow_job_templates/43/survey_spec/');
  });

  it('uses prompt labels and the constructed inventory path', () => {
    renderReview(
      jobTemplate,
      {
        inventory: { id: 8, kind: 'constructed', name: 'Constructed' },
        execution_environment: undefined,
        labels: [{ name: 'prompt label', id: 3 }],
      },
      undefined,
      []
    );

    expect(screen.getByText('prompt label')).toBeInTheDocument();
  });
});
