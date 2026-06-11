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
});
