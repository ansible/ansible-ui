/* eslint-disable i18next/no-literal-string */
import { render, screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { pulpAPI } from '../../common/api/formatPath';
import { RepositoryForm } from './RepositoryForm';

const mockRepository = {
  name: 'test-repo',
  description: 'A test repository',
  pulp_href: '/pulp/api/v3/repositories/ansible/ansible/12345/',
  pulp_created: '2026-01-01T00:00:00Z',
  pulp_labels: {},
  private: false,
  retain_repo_versions: 1,
  remote: null,
  gpgkey: null,
  last_sync_task: {
    state: 'completed',
    task_id: '1',
    started_at: '2026-01-01T00:00:00Z',
    finished_at: '2026-01-01T00:00:00Z',
  },
  last_synced_metadata_time: null,
  latest_version_href: '',
  versions_href: '',
};

const mockDistribution = {
  base_path: 'test-repo',
  name: 'test-repo',
  pulp_created: '2026-01-01T00:00:00Z',
  repository: '/pulp/api/v3/repositories/ansible/ansible/12345/',
  client_url: 'https://hub.example.com/test-repo/',
};

const server = setupServer(
  http.get(pulpAPI`/repositories/ansible/ansible/`, () =>
    HttpResponse.json({ count: 1, results: [mockRepository] })
  ),
  http.get(pulpAPI`/remotes/ansible/collection/`, () =>
    HttpResponse.json({ count: 0, results: [] })
  ),
  http.get(pulpAPI`/distributions/ansible/ansible/`, () =>
    HttpResponse.json({ count: 1, results: [mockDistribution] })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('RepositoryForm - Create mode', () => {
  it('should render form fields', async () => {
    render(
      <MemoryRouter>
        <RepositoryForm />
      </MemoryRouter>
    );

    expect(await screen.findByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Retained number of versions')).toBeInTheDocument();
    expect(screen.getByText('Distributions')).toBeInTheDocument();
    expect(screen.getByText('Pipeline')).toBeInTheDocument();
    expect(screen.getByText('Labels')).toBeInTheDocument();
    expect(screen.getByText('Private')).toBeInTheDocument();
    expect(screen.getByText('Remote')).toBeInTheDocument();
  });

  it('should render the submit button with create text', async () => {
    render(
      <MemoryRouter>
        <RepositoryForm />
      </MemoryRouter>
    );

    expect(await screen.findByRole('button', { name: 'Create repository' })).toBeInTheDocument();
  });
});

describe('RepositoryForm - Edit mode', () => {
  it('should render the edit page header with repository name', async () => {
    render(
      <MemoryRouter initialEntries={['/repositories/test-repo/edit']}>
        <Routes>
          <Route path="/repositories/:id/edit" element={<RepositoryForm />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByRole('heading', { name: /Edit test-repo/i })).toBeInTheDocument();
  });

  it('should render save button in edit mode', async () => {
    render(
      <MemoryRouter initialEntries={['/repositories/test-repo/edit']}>
        <Routes>
          <Route path="/repositories/:id/edit" element={<RepositoryForm />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByRole('button', { name: 'Save repository' })).toBeInTheDocument();
  });

  it('should disable the name field in edit mode', async () => {
    render(
      <MemoryRouter initialEntries={['/repositories/test-repo/edit']}>
        <Routes>
          <Route path="/repositories/:id/edit" element={<RepositoryForm />} />
        </Routes>
      </MemoryRouter>
    );

    const nameInput = await screen.findByRole('textbox', { name: 'Name' });
    expect(nameInput).toBeDisabled();
  });

  it('should populate form with existing repository data', async () => {
    render(
      <MemoryRouter initialEntries={['/repositories/test-repo/edit']}>
        <Routes>
          <Route path="/repositories/:id/edit" element={<RepositoryForm />} />
        </Routes>
      </MemoryRouter>
    );

    const nameInput = await screen.findByRole('textbox', { name: 'Name' });
    expect(nameInput).toHaveValue('test-repo');
  });

  it('should render existing labels when repository has pulp_labels', async () => {
    const repoWithLabels = {
      ...mockRepository,
      pulp_labels: { pipeline: 'staging', hide_from_search: '' },
    };

    server.use(
      http.get(pulpAPI`/repositories/ansible/ansible/`, () =>
        HttpResponse.json({ count: 1, results: [repoWithLabels] })
      )
    );

    render(
      <MemoryRouter initialEntries={['/repositories/test-repo/edit']}>
        <Routes>
          <Route path="/repositories/:id/edit" element={<RepositoryForm />} />
        </Routes>
      </MemoryRouter>
    );

    await screen.findByRole('textbox', { name: 'Name' });
    expect(screen.getByText('pipeline: staging')).toBeInTheDocument();
    expect(screen.getByText('hide_from_search')).toBeInTheDocument();
  });
});
