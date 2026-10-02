/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { edaAPI } from '../../common/eda-utils';
import { ProjectDetails } from './ProjectDetails';

const mockProject = {
  id: 1,
  name: 'Test Project',
  description: 'Test Description',
  url: 'https://github.com/test/repo',
  scm_type: 'git',
  scm_branch: 'main',
  scm_refspec: '',
  update_revision_on_launch: true,
  scm_update_cache_timeout: 30,
  verify_ssl: true,
  git_hash: 'abc123',
  import_state: 'completed',
  import_error: null,
  organization: { id: 1, name: 'Default' },
  eda_credential: null,
  signature_validation_credential: null,
  created_at: '2024-01-01T00:00:00Z',
  modified_at: '2024-01-01T00:00:00Z',
};

describe('ProjectDetails - SCM Update Fields', () => {
  let server: ReturnType<typeof setupServer>;

  beforeAll(() => {
    server = setupServer(http.get(edaAPI`/projects/1/`, () => HttpResponse.json(mockProject)));
    server.listen({ onUnhandledRequest: 'bypass' });
  });

  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('should display Cache timeout field with correct value', async () => {
    render(
      <MemoryRouter initialEntries={['/projects/1/details']}>
        <Routes>
          <Route path="/projects/:id/details" element={<ProjectDetails />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText('Cache timeout')).toBeInTheDocument();
    expect(screen.getByText('30 seconds')).toBeInTheDocument();
  });

  it('should display Cache timeout with different values', async () => {
    server.use(
      http.get(edaAPI`/projects/1/`, () =>
        HttpResponse.json({
          ...mockProject,
          scm_update_cache_timeout: 60,
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
      expect(screen.getByText('Test Project')).toBeInTheDocument();
    });
    expect(await screen.findByText('Cache timeout')).toBeInTheDocument();
    expect(screen.getByText('60 seconds')).toBeInTheDocument();
  });

  it('should display "Update revision on launch" in enabled options', async () => {
    render(
      <MemoryRouter initialEntries={['/projects/1/details']}>
        <Routes>
          <Route path="/projects/:id/details" element={<ProjectDetails />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText('Update revision on launch')).toBeInTheDocument();
  });

  it('should handle zero cache timeout value', async () => {
    server.use(
      http.get(edaAPI`/projects/1/`, () =>
        HttpResponse.json({
          ...mockProject,
          scm_update_cache_timeout: 0,
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

    expect(await screen.findByText('Cache timeout')).toBeInTheDocument();
    expect(screen.getByText('0 seconds')).toBeInTheDocument();
  });

  it('should display Last sync field', async () => {
    server.use(
      http.get(edaAPI`/projects/1/`, () =>
        HttpResponse.json({
          ...mockProject,
          last_synced_at: '2024-01-15T12:30:00Z',
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

    expect(await screen.findByText('Last sync')).toBeInTheDocument();
  });

  it('should display all core detail fields', async () => {
    server.use(
      http.get(edaAPI`/projects/1/`, () =>
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
      expect(screen.getByText('Test Project')).toBeInTheDocument();
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
    render(
      <MemoryRouter initialEntries={['/projects/1/details']}>
        <Routes>
          <Route path="/projects/:id/details" element={<ProjectDetails />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Project')).toBeInTheDocument();
    });

    expect(screen.getByRole('link', { name: 'Default' })).toBeInTheDocument();
  });

  it('should display eda_credential as a link when present', async () => {
    server.use(
      http.get(edaAPI`/projects/1/`, () =>
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
      http.get(edaAPI`/projects/1/`, () =>
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
    render(
      <MemoryRouter initialEntries={['/projects/1/details']}>
        <Routes>
          <Route path="/projects/:id/details" element={<ProjectDetails />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText('Verify SSL')).toBeInTheDocument();
  });

  it('should not display "Verify SSL" when verify_ssl is false', async () => {
    server.use(
      http.get(edaAPI`/projects/1/`, () =>
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
      expect(screen.getByText('Test Project')).toBeInTheDocument();
    });

    expect(screen.queryByText('Verify SSL')).not.toBeInTheDocument();
  });

  it('should display scm_type capitalized', async () => {
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
      http.get(edaAPI`/projects/1/`, () =>
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
      http.get(edaAPI`/projects/1/`, () =>
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
      http.get(edaAPI`/projects/1/`, () =>
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
      expect(screen.getByText('Test Project')).toBeInTheDocument();
    });

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Source control type')).toBeInTheDocument();
  });
});
