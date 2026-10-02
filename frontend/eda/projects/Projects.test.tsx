/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { Projects } from './Projects';

const mockProjects = {
  count: 2,
  next: null,
  previous: null,
  page_size: 10,
  page: 1,
  results: [
    {
      id: 1,
      name: 'Test Project 1',
      description: 'A test project',
      url: 'https://github.com/ansible/ansible-ui',
      git_hash: 'abc123',
      import_state: 'completed',
      created_at: '2023-07-11T22:00:00.179292Z',
      modified_at: '2023-07-11T22:00:02.244685Z',
    },
    {
      id: 2,
      name: 'Test Project 2',
      description: 'Another project',
      url: 'https://github.com/ansible/ansible',
      git_hash: 'def456',
      import_state: 'pending',
      created_at: '2023-07-11T22:00:10.299948Z',
      modified_at: '2023-07-11T22:00:11.814164Z',
    },
  ],
};

describe('Projects', () => {
  const server = setupServer();

  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('renders the projects list', async () => {
    server.use(
      http.get('*/projects/*', () => {
        return HttpResponse.json(mockProjects);
      }),
      http.options('*/projects/', () => {
        return HttpResponse.json({ actions: { POST: {} } });
      })
    );

    render(
      <MemoryRouter>
        <Projects />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Projects')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Test Project 1')).toBeInTheDocument();
    });
  });

  it('displays empty state when no projects exist and no permission', async () => {
    server.use(
      http.get('*/projects/*', () => {
        return HttpResponse.json({ count: 0, results: [] });
      }),
      http.options('*/projects/', () => {
        return HttpResponse.json({ actions: {} });
      })
    );

    render(
      <MemoryRouter>
        <Projects />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByText(/You do not have permission to create a project/)
      ).toBeInTheDocument();
    });
  });
});
