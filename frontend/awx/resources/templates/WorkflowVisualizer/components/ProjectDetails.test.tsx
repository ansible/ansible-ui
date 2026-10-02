import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@patternfly/react-topology', () => ({
  observer: (component: unknown) => component,
  useVisualizationController: vi.fn(),
  NodeStatus: { danger: 'danger', success: 'success', info: 'info' },
}));

vi.mock('../../../../common/useAwxConfig', () => ({
  useAwxConfig: vi.fn(() => ({
    project_base_dir: '/var/lib/awx/projects',
  })),
}));

import type { Project } from '../../../../interfaces/Project';
import { ProjectDetails } from './ProjectDetails';

function makeProject(overrides: Record<string, unknown> = {}): Project {
  return {
    id: 1,
    name: 'Demo Project',
    scm_type: 'git',
    scm_url: 'https://github.com/ansible/test.git',
    scm_branch: 'main',
    scm_refspec: 'refs/heads/*',
    scm_revision: 'abc123def456',
    scm_update_cache_timeout: 120,
    local_path: 'demo_project',
    summary_fields: {
      organization: { id: 1, name: 'Default Org' },
    },
    ...overrides,
  } as unknown as Project;
}

function renderComponent(project: Project) {
  return render(
    <MemoryRouter>
      <ProjectDetails project={project} />
    </MemoryRouter>
  );
}

describe('ProjectDetails', () => {
  it('should render the organization name', () => {
    renderComponent(makeProject());
    expect(screen.getByText('Default Org')).toBeInTheDocument();
  });

  it('should render source control type', () => {
    renderComponent(makeProject());
    expect(screen.getByText('Source control type')).toBeInTheDocument();
  });

  it('should render the scm URL', () => {
    renderComponent(makeProject());
    expect(screen.getByText('https://github.com/ansible/test.git')).toBeInTheDocument();
  });

  it('should render the scm branch', () => {
    renderComponent(makeProject());
    expect(screen.getByText('main')).toBeInTheDocument();
  });

  it('should render the scm refspec', () => {
    renderComponent(makeProject());
    expect(screen.getByText('refs/heads/*')).toBeInTheDocument();
  });

  it('should render the scm revision as a copyable cell', () => {
    renderComponent(makeProject());
    expect(screen.getByText('abc123def456')).toBeInTheDocument();
  });

  it('should not render scm revision when not present', () => {
    renderComponent(makeProject({ scm_revision: '' }));
    expect(screen.queryByText('Source control revision')).not.toBeInTheDocument();
  });

  it('should render the cache timeout', () => {
    renderComponent(makeProject());
    expect(screen.getByText('120 seconds')).toBeInTheDocument();
  });

  it('should render the project base path from config', () => {
    renderComponent(makeProject());
    expect(screen.getByText('/var/lib/awx/projects')).toBeInTheDocument();
  });

  it('should render the playbook directory', () => {
    renderComponent(makeProject());
    expect(screen.getByText('demo_project')).toBeInTheDocument();
  });

  it('should hide organization section when missing', () => {
    renderComponent(
      makeProject({
        summary_fields: { organization: undefined },
      })
    );
    expect(screen.queryByText('Organization')).not.toBeInTheDocument();
  });
});
