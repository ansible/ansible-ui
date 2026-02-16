import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { ProjectDetails } from './ProjectDetails';

const mockProject = {
  id: 1,
  type: 'project',
  name: 'Test Project',
  description: 'A test project',
  url: '/api/v2/projects/1/',
  status: 'successful',
  scm_type: 'git',
  scm_url: 'https://github.com/ansible/ansible',
  summary_fields: { organization: { name: 'Default' } },
};

const server = setupServer(
  http.get(
    ({ request }) => request.url.includes('/projects/') && request.url.includes('/1'),
    () => HttpResponse.json(mockProject)
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('ProjectDetails', () => {
  it('should display project name', async () => {
    render(
      <MemoryRouter initialEntries={['/projects/1']}>
        <Routes>
          <Route path="/projects/:id" element={<ProjectDetails />} />
        </Routes>
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText('Test Project')).toBeInTheDocument();
    });
  });
});
