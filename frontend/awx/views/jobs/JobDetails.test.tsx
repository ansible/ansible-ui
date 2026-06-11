import { render, screen, waitFor } from '@testing-library/react';
import * as reactRouterDom from 'react-router-dom';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { JobDetails } from './JobDetails';
import { testFixture } from './jobDetails.fixture';

const mockJob = {
  ...testFixture,
};
const mockNavigate = vi.fn();
const mockGetPageUrl = vi.fn((route: string, options?: { params?: Record<string, unknown> }) => {
  if (route === 'awx-job-output' && options?.params) {
    const { job_type, id } = options.params;
    return `/jobs/${String(job_type)}/${String(id)}/output`;
  }
  return '/';
});

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof reactRouterDom>('react-router-dom');
  return {
    ...actual,
    usePageNavigate: () => mockNavigate,
    useOutletContext: () => ({ job: mockJob }),
  };
});

vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual('@ansible/ansible-ui-framework');
  return {
    ...actual,
    useGetPageUrl: () => mockGetPageUrl,
  };
});
describe('JobDetails Component', () => {
  it('renders the JobDetails component with all fields', async () => {
    render(
      <MemoryRouter>
        <JobDetails />
      </MemoryRouter>
    );

    await waitFor(
      () => {
        expect(screen.getByText('ID')).toBeInTheDocument();
        expect(screen.getByText('Name')).toBeInTheDocument();
        expect(screen.getByText('Status')).toBeInTheDocument();
        expect(screen.getByText('Type')).toBeInTheDocument();
      },
      { timeout: 10000 }
    );

    expect(screen.getByText('Labels')).toBeInTheDocument();
    expect(screen.getByText('Duration')).toBeInTheDocument();
    expect(screen.getByText('Started')).toBeInTheDocument();
    expect(screen.getByText('Finished')).toBeInTheDocument();
    expect(screen.getByText('Launched by')).toBeInTheDocument();
    expect(screen.getByText('Job template')).toBeInTheDocument();
    expect(screen.getByText('Inventory')).toBeInTheDocument();
    expect(screen.getByText('Project')).toBeInTheDocument();
    expect(screen.getByText('Execution environment')).toBeInTheDocument();
    expect(screen.getByText('Instance group')).toBeInTheDocument();
    expect(screen.getByText('Job slice')).toBeInTheDocument();
    expect(screen.getByText('Job slice parent')).toBeInTheDocument();
    expect(screen.getByText('Playbook')).toBeInTheDocument();
    expect(screen.getByText('Revision')).toBeInTheDocument();
    expect(screen.getByText('Controller node')).toBeInTheDocument();
    expect(screen.getByText('Execution node')).toBeInTheDocument();
    expect(screen.getByText('Forks')).toBeInTheDocument();
    expect(screen.getByText('Timeout')).toBeInTheDocument();
    expect(screen.getByText('Limit')).toBeInTheDocument();
    expect(screen.getByText('Verbosity')).toBeInTheDocument();
    expect(screen.getByText('Created')).toBeInTheDocument();
    expect(screen.getByText('Last modified')).toBeInTheDocument();
    expect(screen.getByText('Extra variables')).toBeInTheDocument();
    expect(screen.getByText('Artifacts')).toBeInTheDocument();
  }, 15000);

  it('conditionally renders playbook field', async () => {
    mockJob.playbook = null;
    render(
      <MemoryRouter>
        <JobDetails />
      </MemoryRouter>
    );
    await waitFor(
      () => {
        expect(screen.queryByText('Playbook')).not.toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  }, 15000);

  it('conditionally renders scm_revision field', async () => {
    mockJob.scm_revision = undefined;
    render(
      <MemoryRouter>
        <JobDetails />
      </MemoryRouter>
    );
    await waitFor(
      () => {
        expect(screen.queryByText('Revision')).not.toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  }, 15000);
  it('conditionally renders controller_node field', async () => {
    mockJob.controller_node = undefined;
    render(
      <MemoryRouter>
        <JobDetails />
      </MemoryRouter>
    );
    await waitFor(
      () => {
        expect(screen.queryByText('Controller node')).not.toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  }, 15000);
  it('conditionally renders execution_node node field', async () => {
    mockJob.execution_node = undefined;
    render(
      <MemoryRouter>
        <JobDetails />
      </MemoryRouter>
    );
    await waitFor(
      () => {
        expect(screen.queryByText('Execution node')).not.toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  }, 15000);
  it('conditionally renders job_tags field', () => {
    mockJob.job_tags = 'foo';
    render(
      <MemoryRouter>
        <JobDetails />
      </MemoryRouter>
    );
    expect(screen.queryByText('Job tags')).toBeInTheDocument();
  });
  it('conditionally renders skip_tags field', () => {
    mockJob.skip_tags = 'bar';
    render(
      <MemoryRouter>
        <JobDetails />
      </MemoryRouter>
    );
    expect(screen.queryByText('Skip tags')).toBeInTheDocument();
  });
  it('conditionally renders instance_group field', () => {
    mockJob.summary_fields.instance_group = undefined;
    render(
      <MemoryRouter>
        <JobDetails />
      </MemoryRouter>
    );
    expect(screen.queryByText('Instance group')).not.toBeInTheDocument();
    expect(screen.queryByText('Container group')).not.toBeInTheDocument();
  });
  it('renders extra_vars field', () => {
    render(
      <MemoryRouter>
        <JobDetails />
      </MemoryRouter>
    );
    expect(screen.queryByText('Extra variables')).toBeInTheDocument();
    expect(screen.queryByText('var1: answer1')).toBeInTheDocument();
    expect(screen.queryByText('var2: ')).not.toBeInTheDocument();
  });
  it('conditionally renders source control branch field', () => {
    mockJob.scm_branch = 'foo';
    render(
      <MemoryRouter>
        <JobDetails />
      </MemoryRouter>
    );
    expect(screen.getByTestId('label-source-control-branch')).toBeInTheDocument();
    expect(screen.getByTestId('source-control-branch')).toHaveTextContent('foo');
  });

  it('should render project update status with correct navigation link', () => {
    render(
      <MemoryRouter>
        <JobDetails />
      </MemoryRouter>
    );

    const projectUpdateStatusContainer = screen.getByTestId('project-update-status');
    expect(projectUpdateStatusContainer).toBeInTheDocument();

    const projectUpdateStatusLink = projectUpdateStatusContainer.querySelector('a');
    expect(projectUpdateStatusLink).toBeInTheDocument();
    expect(projectUpdateStatusLink).toHaveAttribute('href', '/jobs/project/27/output');
  });
});
