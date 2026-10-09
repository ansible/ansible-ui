import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PromptReviewDetails } from './PromptReviewDetails';

const mockUsePageWizard = vi.hoisted(() => vi.fn());
const mockUseGet = vi.hoisted(() => vi.fn());
const mockUseGetItem = vi.hoisted(() => vi.fn());

vi.mock('@ansible/ansible-ui-framework/PageWizard/PageWizardProvider', () => ({
  usePageWizard: mockUsePageWizard,
}));
vi.mock('@ansible/common-ui/crud/useGet', () => ({
  useGet: mockUseGet,
  useGetItem: mockUseGetItem,
}));
vi.mock('@ansible/ansible-ui-framework/PageDetails/PageDetailCodeEditor', () => ({
  PageDetailCodeEditor: ({ label, value }: Readonly<{ label: string; value: string }>) => (
    <div>
      <span>{label}</span>
      <pre>{value}</pre>
    </div>
  ),
}));
vi.mock('../../TemplatePage/steps/TemplateLaunchReviewStep', () => ({
  CredentialDetail: ({ credential }: Readonly<{ credential: { name: string } }>) => (
    <span>{credential.name}</span>
  ),
}));

const template = {
  id: 10,
  type: 'job_template',
  name: 'Deploy application',
  playbook: 'site.yml',
  summary_fields: {
    organization: { id: 1, name: 'Operations' },
    inventory: { id: 2, name: 'Production' },
    project: { id: 3, name: 'Automation' },
  },
};

beforeEach(() => {
  mockUsePageWizard.mockReturnValue({
    wizardData: {
      resource: template,
      survey: { password: 'secret', region: 'west' },
      prompt: {
        inventory: { id: 2, kind: '', name: 'Production' },
        credentials: [{ id: 4, name: 'Machine credential' }],
        instance_groups: [{ id: 5, name: 'Default group' }],
        execution_environment: { id: 6, name: 'EE' },
        diff_mode: true,
        extra_vars: '{"key":"value"}',
        forks: 3,
        job_slice_count: 2,
        job_tags: 'deploy, verify',
        job_type: 'run',
        labels: [{ id: 7, name: 'production' }],
        limit: 'web',
        skip_tags: [{ name: 'skip-me' }],
        timeout: 60,
        scm_branch: 'main',
        verbosity: 2,
      },
    },
  });
  mockUseGet.mockReturnValue({
    data: { spec: [{ type: 'password', variable: 'password' }] },
  });
  mockUseGetItem.mockImplementation((url: string) => {
    if (url.includes('/execution_environments/')) return { data: { id: 6, name: 'EE' } };
    return { data: { id: 2, name: 'Production' } };
  });
});

describe('PromptReviewDetails', () => {
  it('renders prompt values and related resource links', () => {
    render(
      <MemoryRouter>
        <PromptReviewDetails />
      </MemoryRouter>
    );

    expect(screen.getByText('Operations')).toBeInTheDocument();
    expect(screen.getByText('Production')).toBeInTheDocument();
    expect(screen.getByText('Automation')).toBeInTheDocument();
    expect(screen.getByText('Machine credential')).toBeInTheDocument();
    expect(screen.getByText('Default group')).toBeInTheDocument();
    expect(screen.getByText('production')).toBeInTheDocument();
    expect(screen.getByText('deploy')).toBeInTheDocument();
    expect(screen.getByText('skip-me')).toBeInTheDocument();
    expect(screen.getByText('On')).toBeInTheDocument();
    expect(screen.getByText('2 (More Verbose)')).toBeInTheDocument();
    expect(screen.getByText('site.yml')).toBeInTheDocument();
  });

  it('renders nothing when the template is unavailable', () => {
    mockUsePageWizard.mockReturnValue({ wizardData: { resource: undefined } });
    render(
      <MemoryRouter>
        <PromptReviewDetails />
      </MemoryRouter>
    );
    expect(screen.queryByText('Job type')).not.toBeInTheDocument();
  });
});
