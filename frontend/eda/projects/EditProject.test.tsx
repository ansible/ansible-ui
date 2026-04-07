import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { edaAPI } from '../common/eda-utils';
import { CreateProject, EditProject } from './EditProject';

const mockOptionsResponse = {
  name: 'Project List',
  description: '',
  actions: {
    POST: {},
    PATCH: {},
  },
};

const mockProjectResponse = {
  id: 1,
  name: 'Test Project',
  description: 'Test Description',
  url: 'https://github.com/test/repo',
  scm_type: 'git',
  scm_branch: 'main',
  scm_refspec: '',
  scm_update_on_launch: false,
  scm_update_cache_timeout: 10,
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

const mockOrganizationsResponse = {
  count: 1,
  next: null,
  previous: null,
  results: [{ id: 1, name: 'Default' }],
};

const mockCredentialsResponse = {
  count: 0,
  next: null,
  previous: null,
  results: [],
};

describe('EditProject - SCM Update on Launch', () => {
  let server: ReturnType<typeof setupServer>;

  beforeAll(() => {
    server = setupServer(
      http.options(edaAPI`/projects/`, () => HttpResponse.json(mockOptionsResponse)),
      http.options(edaAPI`/projects/1/`, () => HttpResponse.json(mockOptionsResponse)),
      http.get(edaAPI`/projects/1/`, () => HttpResponse.json(mockProjectResponse)),
      http.get(edaAPI`/organizations/`, () => HttpResponse.json(mockOrganizationsResponse)),
      http.get(edaAPI`/eda-credentials/`, () => HttpResponse.json(mockCredentialsResponse))
    );
    server.listen({ onUnhandledRequest: 'bypass' });
  });

  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  describe('Create Project Form', () => {
    it('should render "Update revision on launch" checkbox', async () => {
      render(
        <MemoryRouter>
          <CreateProject />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Create project/i })).toBeInTheDocument();
      });

      const checkbox = screen.getByRole('checkbox', { name: /Update revision on launch/i });
      expect(checkbox).toBeInTheDocument();
      expect(checkbox).not.toBeChecked();
    });

    it('should not show Cache Timeout field when checkbox is unchecked', async () => {
      render(
        <MemoryRouter>
          <CreateProject />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Create project/i })).toBeInTheDocument();
      });

      expect(screen.queryByRole('spinbutton', { name: /Cache Timeout/i })).not.toBeInTheDocument();
      expect(screen.queryByText('Option Details')).not.toBeInTheDocument();
    });

    it('should show Cache Timeout field when checkbox is checked', async () => {
      const user = userEvent.setup();

      render(
        <MemoryRouter>
          <CreateProject />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Create project/i })).toBeInTheDocument();
      });

      const checkbox = screen.getByRole('checkbox', { name: /Update revision on launch/i });
      await user.click(checkbox);

      expect(screen.getByText('Option Details')).toBeInTheDocument();
      const cacheTimeoutInput = screen.getByRole('spinbutton', { name: /Cache Timeout/i });
      expect(cacheTimeoutInput).toBeInTheDocument();
      expect(cacheTimeoutInput).toHaveAttribute('type', 'number');
      expect(cacheTimeoutInput).toHaveAttribute('value', '0');
      expect(cacheTimeoutInput).toHaveAttribute('placeholder', 'Enter cache timeout');
    });

    it('should hide Cache Timeout field when checkbox is toggled off', async () => {
      const user = userEvent.setup();

      render(
        <MemoryRouter>
          <CreateProject />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Create project/i })).toBeInTheDocument();
      });

      const checkbox = screen.getByRole('checkbox', { name: /Update revision on launch/i });

      await user.click(checkbox);
      expect(screen.getByRole('spinbutton', { name: /Cache Timeout/i })).toBeInTheDocument();

      await user.click(checkbox);
      expect(screen.queryByRole('spinbutton', { name: /Cache Timeout/i })).not.toBeInTheDocument();
      expect(screen.queryByText('Option Details')).not.toBeInTheDocument();
    });
  });

  describe('Edit Project Form', () => {
    it('should render "Update revision on launch" checkbox in edit form', async () => {
      render(
        <MemoryRouter initialEntries={['/projects/1/edit']}>
          <Routes>
            <Route path="/projects/:id/edit" element={<EditProject />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Edit Test Project/i })).toBeInTheDocument();
      });

      const checkbox = screen.getByRole('checkbox', { name: /Update revision on launch/i });
      expect(checkbox).toBeInTheDocument();
      expect(checkbox).not.toBeChecked();
    });

    it('should toggle Cache Timeout field visibility when checkbox is clicked', async () => {
      const user = userEvent.setup();

      render(
        <MemoryRouter initialEntries={['/projects/1/edit']}>
          <Routes>
            <Route path="/projects/:id/edit" element={<EditProject />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Edit Test Project/i })).toBeInTheDocument();
      });

      const checkbox = screen.getByRole('checkbox', { name: /Update revision on launch/i });

      expect(screen.queryByRole('spinbutton', { name: /Cache Timeout/i })).not.toBeInTheDocument();

      await user.click(checkbox);
      expect(screen.getByRole('spinbutton', { name: /Cache Timeout/i })).toBeInTheDocument();

      await user.click(checkbox);
      expect(screen.queryByRole('spinbutton', { name: /Cache Timeout/i })).not.toBeInTheDocument();
    });

    it('should show Cache Timeout field with default value when scm_update_on_launch is checked', async () => {
      const user = userEvent.setup();

      render(
        <MemoryRouter initialEntries={['/projects/1/edit']}>
          <Routes>
            <Route path="/projects/:id/edit" element={<EditProject />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Edit Test Project/i })).toBeInTheDocument();
      });

      const checkbox = screen.getByRole('checkbox', { name: /Update revision on launch/i });
      await user.click(checkbox);

      const cacheTimeoutInput = screen.getByRole('spinbutton', { name: /Cache Timeout/i });
      expect(cacheTimeoutInput).toHaveValue(10);
    });
  });
});
