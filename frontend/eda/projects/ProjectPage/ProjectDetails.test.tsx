/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { ProjectDetails } from './ProjectDetails';

const mockProject = {
  id: 1,
  name: 'Sample Project',
  description: 'Sample project description',
  url: 'https://github.com/ansible/ansible-ui',
  git_hash: 'abc123',
  import_state: 'completed',
  import_error: null,
  scm_type: 'git',
  scm_url: 'https://github.com/ansible/ansible-ui',
  scm_branch: 'main',
  proxy: 'proxy.example.com',
  organization: {
    id: 2,
    name: 'Organization 2',
  },
  created_at: '2023-10-01T12:00:00Z',
  modified_at: '2023-10-02T12:00:00Z',
  created_by: {
    id: 1,
    username: 'DemoUser1',
  },
  modified_by: {
    id: 2,
    username: 'DemoUser2',
  },
};

describe('ProjectDetails', () => {
  const server = setupServer();

  beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('renders project details', async () => {
    server.use(
      http.get('*/projects/1/', () => {
        return HttpResponse.json(mockProject);
      })
    );

    render(
      <MemoryRouter initialEntries={['/projects/1/details']}>
        <Routes>
          <Route path="/projects/:id/details" element={<ProjectDetails />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Sample Project')).toBeInTheDocument();
    });
  });

  it('should display all core detail fields', async () => {
    server.use(
      http.get('*/projects/1/', () =>
        HttpResponse.json({
          ...mockProject,
          scm_refspec: 'refs/pull/*:refs/heads/*',
          proxy: 'http://proxy.example.com',
        })
      )
    );

    render(
      <MemoryRouter initialEntries={['/projects/1/details']}>
        <Routes>
          <Route path="/projects/:id/details" element={<ProjectDetails />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Sample Project')).toBeInTheDocument();
    });

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Source control type')).toBeInTheDocument();
    expect(screen.getByText('Source control URL')).toBeInTheDocument();
    expect(screen.getByText('Source control branch/tag/commit')).toBeInTheDocument();
    expect(screen.getByText('Source control refspec')).toBeInTheDocument();
    expect(screen.getByText('Git hash')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Created')).toBeInTheDocument();
    expect(screen.getByText('Proxy')).toBeInTheDocument();
  });

  it('should display organization as a link', async () => {
    server.use(http.get('*/projects/1/', () => HttpResponse.json(mockProject)));

    render(
      <MemoryRouter initialEntries={['/projects/1/details']}>
        <Routes>
          <Route path="/projects/:id/details" element={<ProjectDetails />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Sample Project')).toBeInTheDocument();
    });

    expect(screen.getByText('Organization 2')).toBeInTheDocument();
  });

  it('should display eda_credential as a link when present', async () => {
    server.use(
      http.get('*/projects/1/', () =>
        HttpResponse.json({
          ...mockProject,
          eda_credential: { id: 10, name: 'My Git Credential' },
        })
      )
    );

    render(
      <MemoryRouter initialEntries={['/projects/1/details']}>
        <Routes>
          <Route path="/projects/:id/details" element={<ProjectDetails />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('My Git Credential')).toBeInTheDocument();
    });

    expect(screen.getByRole('link', { name: 'My Git Credential' })).toBeInTheDocument();
  });

  it('should display signature_validation_credential as a link when present', async () => {
    server.use(
      http.get('*/projects/1/', () =>
        HttpResponse.json({
          ...mockProject,
          signature_validation_credential: { id: 20, name: 'My Signing Cred' },
        })
      )
    );

    render(
      <MemoryRouter initialEntries={['/projects/1/details']}>
        <Routes>
          <Route path="/projects/:id/details" element={<ProjectDetails />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('My Signing Cred')).toBeInTheDocument();
    });

    expect(screen.getByRole('link', { name: 'My Signing Cred' })).toBeInTheDocument();
  });

  it('should display "Verify SSL" in enabled options when verify_ssl is true', async () => {
    server.use(
      http.get('*/projects/1/', () => HttpResponse.json({ ...mockProject, verify_ssl: true }))
    );

    render(
      <MemoryRouter initialEntries={['/projects/1/details']}>
        <Routes>
          <Route path="/projects/:id/details" element={<ProjectDetails />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Sample Project')).toBeInTheDocument();
    });
    expect(screen.getByText('Verify SSL')).toBeInTheDocument();
  });

  it('should not display "Verify SSL" when verify_ssl is false', async () => {
    server.use(
      http.get('*/projects/1/', () =>
        HttpResponse.json({
          ...mockProject,
          verify_ssl: false,
          update_revision_on_launch: false,
        })
      )
    );

    render(
      <MemoryRouter initialEntries={['/projects/1/details']}>
        <Routes>
          <Route path="/projects/:id/details" element={<ProjectDetails />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Sample Project')).toBeInTheDocument();
    });

    expect(screen.queryByText('Verify SSL')).not.toBeInTheDocument();
  });

  it('should display scm_type capitalized', async () => {
    server.use(http.get('*/projects/1/', () => HttpResponse.json(mockProject)));

    render(
      <MemoryRouter initialEntries={['/projects/1/details']}>
        <Routes>
          <Route path="/projects/:id/details" element={<ProjectDetails />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Git')).toBeInTheDocument();
    });
  });

  it('should display proxy field when present', async () => {
    server.use(
      http.get('*/projects/1/', () =>
        HttpResponse.json({
          ...mockProject,
          proxy: 'http://proxy.example.com:8080',
        })
      )
    );

    render(
      <MemoryRouter initialEntries={['/projects/1/details']}>
        <Routes>
          <Route path="/projects/:id/details" element={<ProjectDetails />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('http://proxy.example.com:8080')).toBeInTheDocument();
    });
  });

  it('should display import error when present', async () => {
    server.use(
      http.get('*/projects/1/', () =>
        HttpResponse.json({
          ...mockProject,
          import_error: 'Failed to clone repository',
        })
      )
    );

    render(
      <MemoryRouter initialEntries={['/projects/1/details']}>
        <Routes>
          <Route path="/projects/:id/details" element={<ProjectDetails />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Failed to clone repository')).toBeInTheDocument();
    });
  });

  it('should handle missing optional fields gracefully', async () => {
    server.use(
      http.get('*/projects/1/', () =>
        HttpResponse.json({
          ...mockProject,
          organization: null,
          eda_credential: null,
          signature_validation_credential: null,
          proxy: '',
          scm_refspec: '',
          import_error: null,
        })
      )
    );

    render(
      <MemoryRouter initialEntries={['/projects/1/details']}>
        <Routes>
          <Route path="/projects/:id/details" element={<ProjectDetails />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Sample Project')).toBeInTheDocument();
    });

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Source control type')).toBeInTheDocument();
  });
});
