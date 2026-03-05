import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { NotificationPage } from './NotificationPage';

const mockNotificationTemplate = {
  id: 1,
  name: 'Test Notifier',
  description: 'Test notifier description',
  organization: 1,
  notification_type: 'email',
  summary_fields: {
    recent_notifications: [],
    user_capabilities: {},
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

describe('NotificationPage', () => {
  it('should display notifier name in page header', async () => {
    render(
      <MemoryRouter initialEntries={['/notifiers/1']}>
        <Routes>
          <Route path="/notifiers/:id" element={<NotificationPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('page-title')).toHaveTextContent('Test Notifier');
    });
  });
});
