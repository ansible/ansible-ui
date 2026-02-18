/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { edaAPI } from '../../common/eda-utils';
import { EventStreamDetails } from './EventStreamDetails';

const mockEventStream = {
  id: 1,
  name: 'Test Event Stream',
  event_stream_type: 'HMAC',
  organization: {
    id: 2,
    name: 'Test Organization',
  },
  eda_credential: {
    id: 3,
    name: 'Test Credential',
  },
  url: 'https://example.com/event-stream/webhook',
  additional_data_headers: 'X-Custom-Header, X-Another-Header',
  events_received: 42,
  last_event_received_at: '2023-10-15T10:30:00Z',
  created_at: '2023-10-01T12:00:00Z',
  modified_at: '2023-10-02T14:30:00Z',
  created_by: {
    username: 'creator_user',
  },
  modified_by: {
    username: 'modifier_user',
  },
  test_mode: false,
  test_content_type: 'application/json',
  test_error_message: '',
  test_headers: 'Content-Type: application/json\nX-Custom-Header: test-value',
  test_content: '{"event": "test", "data": "sample"}',
  owner: 'admin',
};

describe('EventStreamDetails', () => {
  const server = setupServer();

  beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
  beforeEach(() =>
    server.use(http.get(edaAPI`/event-streams/1/`, () => HttpResponse.json(mockEventStream)))
  );
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('should render event stream details', async () => {
    render(
      <MemoryRouter initialEntries={['/event-streams/1/details']}>
        <Routes>
          <Route path="/event-streams/:id/details" element={<EventStreamDetails />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Event Stream')).toBeInTheDocument();
    });

    expect(screen.getByText('HMAC')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Test Organization' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Test Credential' })).toBeInTheDocument();
    expect(screen.getByText('https://example.com/event-stream/webhook')).toBeInTheDocument();
    expect(screen.getByText('X-Custom-Header, X-Another-Header')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('should not display warning alert when test_mode is disabled', async () => {
    render(
      <MemoryRouter initialEntries={['/event-streams/1/details']}>
        <Routes>
          <Route path="/event-streams/:id/details" element={<EventStreamDetails />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Event Stream')).toBeInTheDocument();
    });

    expect(screen.queryByText('This event stream is disabled.')).not.toBeInTheDocument();
  });

  it('should render test headers code block when test_headers is present', async () => {
    render(
      <MemoryRouter initialEntries={['/event-streams/1/details']}>
        <Routes>
          <Route path="/event-streams/:id/details" element={<EventStreamDetails />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Event Stream')).toBeInTheDocument();
    });

    expect(screen.getByText(/Content-Type: application\/json/)).toBeInTheDocument();
    expect(screen.getByText(/X-Custom-Header: test-value/)).toBeInTheDocument();
  });

  it('should render test content code block when test_content is present', async () => {
    render(
      <MemoryRouter initialEntries={['/event-streams/1/details']}>
        <Routes>
          <Route path="/event-streams/:id/details" element={<EventStreamDetails />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Event Stream')).toBeInTheDocument();
    });

    expect(screen.getByText('{"event": "test", "data": "sample"}')).toBeInTheDocument();
  });
});
