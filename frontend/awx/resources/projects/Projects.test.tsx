import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { awxAPI } from '../../common/api/awx-utils';
import { Projects } from './Projects';

const mockProjects = {
  count: 1,
  next: null,
  previous: null,
  results: [
    {
      id: 1,
      type: 'project',
      name: 'Test Project',
      description: '',
      url: '/api/v2/projects/1/',
      status: 'successful',
      scm_type: 'git',
      summary_fields: { user_capabilities: { edit: true, delete: true } },
    },
  ],
};

const server = setupServer(
  http.options(awxAPI`/projects/`, () => HttpResponse.json({ actions: {} })),
  http.get(awxAPI`/projects/`, () => HttpResponse.json(mockProjects))
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Projects', () => {
  it('should render projects list with title', async () => {
    render(
      <MemoryRouter>
        <Projects />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText('Projects')).toBeInTheDocument();
    });
  });

  it('should display project in table', async () => {
    render(
      <MemoryRouter>
        <Projects />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText('Test Project')).toBeInTheDocument();
    });
  });
});
