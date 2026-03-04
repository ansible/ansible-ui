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
});
