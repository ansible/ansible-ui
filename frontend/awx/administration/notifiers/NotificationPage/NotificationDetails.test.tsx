import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { NotificationDetails } from './NotificationDetails';
import { NotificationPage } from './NotificationPage';

const mockNotificationTemplate = {
  id: 1,
  name: 'Test Notifier',
  description: 'Test notifier description',
  organization: 1,
  notification_type: 'email',
  notification_configuration: { host: 'smtp.example.com', recipients: ['user@example.com'] },
  created: '2024-01-01T00:00:00Z',
  modified: '2024-01-01T00:00:00Z',
  summary_fields: {
    recent_notifications: [],
    organization: { id: 1, name: 'Default', description: '' },
    created_by: { id: 1, username: 'admin' },
    modified_by: { id: 1, username: 'admin' },
    user_capabilities: { copy: true, delete: true, edit: true },
  },
};

const server = setupServer(
  http.get(
    ({ request }) => request.url.includes('notification_templates') && request.url.includes('/1'),
    () => HttpResponse.json(mockNotificationTemplate)
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('NotificationDetails', () => {
  it('should render notification details via NotificationPage', async () => {
    render(
      <MemoryRouter initialEntries={['/notifiers/1/details']}>
        <Routes>
          <Route path="/notifiers/:id" element={<NotificationPage />}>
            <Route path="details" element={<NotificationDetails />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('page-title')).toHaveTextContent('Test Notifier');
    });
  });
});
