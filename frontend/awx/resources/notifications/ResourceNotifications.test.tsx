import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Outlet, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { ResourceNotifications } from './ResourceNotifications';

const emptyNotifications = { count: 0, next: null, previous: null, results: [] };

const notificationTemplate = {
  id: 1,
  name: 'Email Notifier',
  type: 'notification_template',
  url: '/api/v2/notification_templates/1/',
  created: '2024-01-01T00:00:00Z',
  modified: '2024-01-01T00:00:00Z',
  description: '',
  notification_type: 'email',
  organization: 1,
  summary_fields: {
    organization: { id: 1, name: 'Default', description: '' },
    created_by: { id: 1, username: 'admin' },
    modified_by: { id: 1, username: 'admin' },
    recent_notifications: [],
    user_capabilities: { copy: true, edit: true, delete: true },
  },
};

const server = setupServer(
  http.get(
    ({ request }: { request: Request }) => request.url.includes('notification_templates_started'),
    () => HttpResponse.json(emptyNotifications)
  ),
  http.get(
    ({ request }: { request: Request }) => request.url.includes('notification_templates_success'),
    () => HttpResponse.json(emptyNotifications)
  ),
  http.get(
    ({ request }: { request: Request }) => request.url.includes('notification_templates_error'),
    () => HttpResponse.json(emptyNotifications)
  ),
  http.get(
    ({ request }: { request: Request }) => request.url.includes('notification_templates_approvals'),
    () => HttpResponse.json(emptyNotifications)
  ),
  http.options(
    ({ request }: { request: Request }) => request.url.includes('notification_templates'),
    () => HttpResponse.json({ actions: {} })
  ),
  http.get(
    ({ request }: { request: Request }) =>
      request.url.includes('/notification_templates') &&
      !request.url.includes('_started') &&
      !request.url.includes('_success') &&
      !request.url.includes('_error') &&
      !request.url.includes('_approvals'),
    () => HttpResponse.json(emptyNotifications)
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function ReadOnlyOutlet() {
  return <Outlet context={{ notificationsReadOnly: true }} />;
}

describe('ResourceNotifications', () => {
  it('should render notifications for project', async () => {
    render(
      <MemoryRouter>
        <ResourceNotifications resourceType="projects" id="1" />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(
        screen.getByText('There are currently no notifications associated with this project.')
      ).toBeInTheDocument();
    });
  });

  it('hides association switches when notifications are read-only', async () => {
    server.use(
      http.get(
        ({ request }: { request: Request }) => request.url.includes('notification_templates_success'),
        () =>
          HttpResponse.json({
            count: 1,
            next: null,
            previous: null,
            results: [notificationTemplate],
          })
      ),
      http.get(
        ({ request }: { request: Request }) =>
          request.url.includes('/notification_templates') &&
          !request.url.includes('_started') &&
          !request.url.includes('_success') &&
          !request.url.includes('_error') &&
          !request.url.includes('_approvals'),
        () =>
          HttpResponse.json({
            count: 1,
            next: null,
            previous: null,
            results: [notificationTemplate],
          })
      )
    );

    render(
      <MemoryRouter initialEntries={['/projects/1/notifications']}>
        <Routes>
          <Route element={<ReadOnlyOutlet />}>
            <Route
              path="/projects/:id/notifications"
              element={<ResourceNotifications resourceType="projects" />}
            />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText('Email Notifier')).toBeInTheDocument());
    expect(screen.queryByRole('switch')).not.toBeInTheDocument();
  });
});
