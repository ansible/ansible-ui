import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { ResourceNotifications } from './ResourceNotifications';

const emptyNotifications = { count: 0, next: null, previous: null, results: [] };

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
});
