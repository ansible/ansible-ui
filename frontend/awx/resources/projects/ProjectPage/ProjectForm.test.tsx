import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { awxAPI } from '../../../common/api/awx-utils';
import { CreateProject, EditProject } from './ProjectForm';

const server = setupServer(
  http.options(awxAPI`/projects/`, () => HttpResponse.json({ actions: { POST: {} } })),
  http.get(
    ({ request }) => request.url.includes('/projects/') && request.url.includes('/1'),
    () =>
      HttpResponse.json({
        id: 1,
        name: 'Existing Project',
        scm_type: 'git',
        url: '/api/v2/projects/1/',
      })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('ProjectForm', () => {
  it('should render CreateProject form', async () => {
    render(
      <MemoryRouter initialEntries={['/projects/create']}>
        <Routes>
          <Route path="/projects/create" element={<CreateProject />} />
        </Routes>
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: /name/i })).toBeInTheDocument();
    });
  });

  it('should render EditProject with project name', async () => {
    render(
      <MemoryRouter initialEntries={['/projects/1/edit']}>
        <Routes>
          <Route path="/projects/:id/edit" element={<EditProject />} />
        </Routes>
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByDisplayValue('Existing Project')).toBeInTheDocument();
    });
  });
});
