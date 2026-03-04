/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { EventStreams } from './EventStreams';

const mockEventStreams = {
  count: 2,
  next: null,
  previous: null,
  page_size: 10,
  page: 1,
  results: [
    {
      id: 1,
      name: 'Test Event Stream 1',
      event_stream_type: 'github',
      test_mode: false,
      events_received: 10,
      last_event_received_at: '2024-07-31T20:57:07.411453Z',
      organization: { id: 1, name: 'Default' },
      created_at: '2024-07-31T20:57:07.411453Z',
      modified_at: '2024-07-31T20:57:07.411468Z',
    },
    {
      id: 2,
      name: 'Test Event Stream 2',
      event_stream_type: 'snow',
      test_mode: false,
      events_received: 5,
      last_event_received_at: null,
      organization: { id: 1, name: 'Default' },
      created_at: '2024-07-31T20:57:34.306996Z',
      modified_at: '2024-07-31T20:57:34.307007Z',
    },
  ],
};

describe('EventStreams', () => {
  const server = setupServer();

  beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('renders the event streams list', async () => {
    server.use(
      http.get('*/event-streams/*', () => {
        return HttpResponse.json(mockEventStreams);
      }),
      http.options('*/event-streams/', () => {
        return HttpResponse.json({ actions: { POST: {} } });
      })
    );

    render(
      <MemoryRouter>
        <EventStreams />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Event Streams')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Test Event Stream 1')).toBeInTheDocument();
    });
  });

  it('displays empty state with create permission', async () => {
    server.use(
      http.get('*/event-streams/*', () => {
        return HttpResponse.json({ count: 0, results: [] });
      }),
      http.options('*/event-streams/', () => {
        return HttpResponse.json({ actions: { POST: {} } });
      })
    );

    render(
      <MemoryRouter>
        <EventStreams />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByText(/no event streams created for your organization/i)
      ).toBeInTheDocument();
    });
  });
});
