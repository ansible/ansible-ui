import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { SWRConfig } from 'swr';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { AwxActiveUserProvider } from '../../../common/useAwxActiveUser';
import { ProjectPage } from './ProjectPage';

const mockProject = {
  id: 1,
  name: 'Test Project',
  summary_fields: { user_capabilities: {} },
};

const server = setupServer(
  http.get(
    ({ request }) => request.url.includes('/projects/') && request.url.includes('/1'),
    () => HttpResponse.json(mockProject)
  ),
  http.get(
    ({ request }) => request.url.includes('/organizations/') && request.url.includes('role_level'),
    () => HttpResponse.json({ count: 0, results: [], next: null, previous: null })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function renderProjectPage() {
  render(
    <SWRConfig value={{ provider: () => new Map() }}>
      <MemoryRouter initialEntries={['/projects/1']}>
        <AwxActiveUserProvider disabled>
          <Routes>
            <Route path="/projects/:id" element={<ProjectPage />} />
          </Routes>
        </AwxActiveUserProvider>
      </MemoryRouter>
    </SWRConfig>
  );
}

describe('ProjectPage', () => {
  it('should display project name in page header', async () => {
    renderProjectPage();

    await waitFor(() => {
      expect(screen.getByTestId('page-title')).toHaveTextContent('Test Project');
    });
  });

  it('should show notifications tab when user has notification access', async () => {
    server.use(
      http.get(
        ({ request }) =>
          request.url.includes('/organizations/') && request.url.includes('role_level'),
        () =>
          HttpResponse.json({
            count: 1,
            next: null,
            previous: null,
            results: [{ id: 1, name: 'Default' }],
          })
      )
    );

    renderProjectPage();

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: 'Notifications' })).toBeInTheDocument();
    });
  });

  it('should show project errors', async () => {
    server.use(
      http.get(
        ({ request }) => request.url.includes('/projects/') && request.url.includes('/1'),
        () => HttpResponse.json({ detail: 'Failed to load project' }, { status: 500 })
      )
    );

    renderProjectPage();

    await waitFor(() => {
      expect(screen.getByText('Internal Server Error')).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: 'Refresh' })).toBeInTheDocument();
  });

  it('should show notification access errors', async () => {
    server.use(
      http.get(
        ({ request }) =>
          request.url.includes('/organizations/') && request.url.includes('role_level'),
        () => HttpResponse.json({ detail: 'Failed to load organizations' }, { status: 500 })
      )
    );

    renderProjectPage();

    await waitFor(() => {
      expect(screen.getByText('Internal Server Error')).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: 'Refresh' })).toBeInTheDocument();
  });
});
