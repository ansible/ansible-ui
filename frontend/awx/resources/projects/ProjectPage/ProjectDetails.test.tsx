import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { ProjectDetails } from './ProjectDetails';

vi.mock('../../../common/useAwxConfig', () => ({
  useAwxConfig: vi.fn(() => ({ project_base_dir: '/var/lib/awx/projects' })),
}));

vi.mock('../../../common/useAwxWebSocket', () => ({
  useAwxWebSocketSubscription: vi.fn(),
}));

vi.mock('@ansible/common-ui/utils/useGetDocsUrl', () => ({
  useGetDocsUrl: vi.fn(() => 'https://docs.example.com'),
}));

const fullProject = {
  id: 1,
  type: 'project' as const,
  name: 'Test Project',
  description: 'A test project description',
  url: '/api/v2/projects/1/',
  status: 'successful',
  scm_type: 'git',
  scm_url: 'https://github.com/ansible/ansible',
  scm_branch: 'main',
  scm_refspec: 'refs/*:refs/remotes/origin/*',
  scm_revision: 'abc123def456',
  scm_clean: true,
  scm_delete_on_update: true,
  scm_track_submodules: true,
  scm_update_on_launch: true,
  scm_update_cache_timeout: 60,
  allow_override: true,
  local_path: 'project_dir',
  custom_virtualenv: '/venv/custom',
  created: '2024-01-01T00:00:00.000Z',
  modified: '2024-01-02T00:00:00.000Z',
  summary_fields: {
    organization: { id: 1, name: 'Default Org', description: '' },
    created_by: { id: 1, username: 'admin', first_name: '', last_name: '' },
    modified_by: { id: 2, username: 'editor', first_name: '', last_name: '' },
    credential: {
      id: 10,
      name: 'Git Credential',
      credential_type_id: 1,
      kind: 'scm',
      cloud: false,
      description: '',
    },
    signature_validation_credential: {
      id: 20,
      name: 'GPG Credential',
      credential_type_id: 2,
      kind: 'gpg',
      cloud: false,
      description: '',
    },
    default_environment: {
      id: 3,
      name: 'Default EE',
      image: 'quay.io/ee:latest',
      description: '',
    },
    current_job: null,
    last_job: {
      id: 100,
      name: 'Update',
      status: 'successful',
      finished: '2024-01-01T00:00:00Z',
      failed: false,
      description: '',
    },
    user_capabilities: { edit: true, delete: true, start: true, schedule: true, copy: true },
  },
};

const projectHandler = http.get(
  ({ request }) => request.url.includes('/projects/') && request.url.includes('/1'),
  () => HttpResponse.json(fullProject)
);

const server = setupServer(projectHandler);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function renderProjectDetails(projectId?: string) {
  return render(
    <MemoryRouter initialEntries={['/projects/1']}>
      <Routes>
        <Route path="/projects/:id" element={<ProjectDetails projectId={projectId} />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('ProjectDetails', () => {
  it('should display project name', async () => {
    renderProjectDetails();
    await waitFor(() => {
      expect(screen.getByText('Test Project')).toBeInTheDocument();
    });
  });

  it('should display description', async () => {
    renderProjectDetails();
    await waitFor(() => {
      expect(screen.getByText('A test project description')).toBeInTheDocument();
    });
  });

  it('should display organization', async () => {
    renderProjectDetails();
    await waitFor(() => {
      expect(screen.getByText('Default Org')).toBeInTheDocument();
    });
  });

  it('should display source control URL', async () => {
    renderProjectDetails();
    await waitFor(() => {
      expect(screen.getByText('https://github.com/ansible/ansible')).toBeInTheDocument();
    });
  });

  it('should display source control branch', async () => {
    renderProjectDetails();
    await waitFor(() => {
      expect(screen.getByText('main')).toBeInTheDocument();
    });
  });

  it('should display source control refspec', async () => {
    renderProjectDetails();
    await waitFor(() => {
      expect(screen.getByText('refs/*:refs/remotes/origin/*')).toBeInTheDocument();
    });
  });

  it('should display source control revision', async () => {
    renderProjectDetails();
    await waitFor(() => {
      expect(screen.getByText('abc123def456')).toBeInTheDocument();
    });
  });

  it('should display cache timeout in seconds', async () => {
    renderProjectDetails();
    await waitFor(() => {
      expect(screen.getByText('60 seconds')).toBeInTheDocument();
    });
  });

  it('should display project base path from config', async () => {
    renderProjectDetails();
    await waitFor(() => {
      expect(screen.getByText('/var/lib/awx/projects')).toBeInTheDocument();
    });
  });

  it('should display playbook directory', async () => {
    renderProjectDetails();
    await waitFor(() => {
      expect(screen.getByText('project_dir')).toBeInTheDocument();
    });
  });

  it('should display source control credential', async () => {
    renderProjectDetails();
    await waitFor(() => {
      expect(screen.getByText('Git Credential')).toBeInTheDocument();
    });
  });

  it('should display signature validation credential', async () => {
    renderProjectDetails();
    await waitFor(() => {
      expect(screen.getByText('GPG Credential')).toBeInTheDocument();
    });
  });

  it('should display default execution environment', async () => {
    renderProjectDetails();
    await waitFor(() => {
      expect(screen.getByText('Default EE')).toBeInTheDocument();
    });
  });

  it('should display all enabled options when set', async () => {
    renderProjectDetails();
    await waitFor(() => {
      expect(screen.getByText('Discard local changes before syncing')).toBeInTheDocument();
    });
    expect(screen.getByText('Delete the project before syncing')).toBeInTheDocument();
    expect(screen.getByText('Track submodules latest commit on branch')).toBeInTheDocument();
    expect(screen.getByText('Update revision on job launch')).toBeInTheDocument();
    expect(screen.getByText('Allow branch override')).toBeInTheDocument();
  });

  it('should render name as link when projectId prop is provided', async () => {
    renderProjectDetails('1');
    await waitFor(() => {
      expect(screen.getByRole('link', { name: 'Test Project' })).toBeInTheDocument();
    });
  });

  it('should not display enabled options when none are set', async () => {
    server.use(
      http.get(
        ({ request }) => request.url.includes('/projects/') && request.url.includes('/1'),
        () =>
          HttpResponse.json({
            ...fullProject,
            scm_clean: false,
            scm_delete_on_update: false,
            scm_track_submodules: false,
            scm_update_on_launch: false,
            allow_override: false,
          })
      )
    );
    renderProjectDetails();
    await waitFor(() => {
      expect(screen.getByText('Test Project')).toBeInTheDocument();
    });
    expect(screen.queryByText('Discard local changes before syncing')).not.toBeInTheDocument();
    expect(screen.queryByText('Allow branch override')).not.toBeInTheDocument();
  });

  it('should not display credentials section when credentials are absent', async () => {
    server.use(
      http.get(
        ({ request }) => request.url.includes('/projects/') && request.url.includes('/1'),
        () =>
          HttpResponse.json({
            ...fullProject,
            summary_fields: {
              ...fullProject.summary_fields,
              credential: null,
              signature_validation_credential: null,
              default_environment: null,
            },
          })
      )
    );
    renderProjectDetails();
    await waitFor(() => {
      expect(screen.getByText('Test Project')).toBeInTheDocument();
    });
    expect(screen.queryByText('Git Credential')).not.toBeInTheDocument();
    expect(screen.queryByText('GPG Credential')).not.toBeInTheDocument();
  });

  it('should not display scm revision when empty', async () => {
    server.use(
      http.get(
        ({ request }) => request.url.includes('/projects/') && request.url.includes('/1'),
        () => HttpResponse.json({ ...fullProject, scm_revision: '' })
      )
    );
    renderProjectDetails();
    await waitFor(() => {
      expect(screen.getByText('Test Project')).toBeInTheDocument();
    });
    expect(screen.queryByText('abc123def456')).not.toBeInTheDocument();
  });

  it('should display status when current job exists', async () => {
    server.use(
      http.get(
        ({ request }) => request.url.includes('/projects/') && request.url.includes('/1'),
        () =>
          HttpResponse.json({
            ...fullProject,
            status: 'running',
            summary_fields: {
              ...fullProject.summary_fields,
              current_job: { id: 50, status: 'running', finished: null, failed: false },
              last_job: null,
            },
          })
      )
    );
    renderProjectDetails();
    await waitFor(() => {
      expect(screen.getByText('Test Project')).toBeInTheDocument();
    });
  });

  it('should render status without link when no job info', async () => {
    server.use(
      http.get(
        ({ request }) => request.url.includes('/projects/') && request.url.includes('/1'),
        () =>
          HttpResponse.json({
            ...fullProject,
            summary_fields: {
              ...fullProject.summary_fields,
              current_job: null,
              last_job: null,
            },
          })
      )
    );
    renderProjectDetails();
    await waitFor(() => {
      expect(screen.getByText('Test Project')).toBeInTheDocument();
    });
  });

  it('should not display organization when absent', async () => {
    server.use(
      http.get(
        ({ request }) => request.url.includes('/projects/') && request.url.includes('/1'),
        () =>
          HttpResponse.json({
            ...fullProject,
            summary_fields: {
              ...fullProject.summary_fields,
              organization: null,
            },
          })
      )
    );
    renderProjectDetails();
    await waitFor(() => {
      expect(screen.getByText('Test Project')).toBeInTheDocument();
    });
    expect(screen.queryByText('Default Org')).not.toBeInTheDocument();
  });

  it('should display created date author', async () => {
    renderProjectDetails();
    await waitFor(() => {
      expect(screen.getByText('admin')).toBeInTheDocument();
    });
  });

  it('should display modified author', async () => {
    renderProjectDetails();
    await waitFor(() => {
      expect(screen.getByText('editor')).toBeInTheDocument();
    });
  });
});
