import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
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
    ({ request }) =>
      request.url.includes('/organizations/') &&
      request.url.includes('role_level=notification_admin_role'),
    () => HttpResponse.json({ count: 0, results: [], next: null, previous: null })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('ProjectPage', () => {
  it('should display project name in page header', async () => {
    render(
      <MemoryRouter initialEntries={['/projects/1']}>
        <AwxActiveUserProvider disabled>
          <Routes>
            <Route path="/projects/:id" element={<ProjectPage />} />
          </Routes>
        </AwxActiveUserProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('page-title')).toHaveTextContent('Test Project');
    });
  });
});
