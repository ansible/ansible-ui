/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import userEvent from '@testing-library/user-event';
import { edaAPI } from '../../common/eda-utils';
import { EventStreamPage } from './EventStreamPage';
const mockEventStream = {
  id: 1,
  name: 'Test Event Stream',
  event_stream_type: 'basic',
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

const mockEventStreamOptions = {
  name: 'Event Stream',
  description: '',
  renders: ['application/json', 'text/html'],
  parses: ['application/json'],
  actions: {
    GET: {
      id: {
        type: 'integer',
        label: 'ID',
      },
      name: {
        type: 'string',
        label: 'Name',
      },
    },
    PATCH: {
      name: {
        type: 'string',
        required: true,
        label: 'Name',
      },
      test_mode: {
        type: 'boolean',
        required: false,
        label: 'Test mode',
      },
    },
  },
};

const mockActivations = {
  count: 0,
  next: null,
  previous: null,
  page_size: 200,
  page: 1,
  results: [],
};

describe('EventStreamPage', () => {
  const server = setupServer();

  beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));

  beforeEach(() => {
    server.use(
      http.get(edaAPI`/event-streams/1/`, () => HttpResponse.json(mockEventStream)),
      http.options(edaAPI`/event-streams/1/`, () => HttpResponse.json(mockEventStreamOptions)),
      http.get(edaAPI`/event-streams/1/activations/`, () => HttpResponse.json(mockActivations))
    );
  });

  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('should render event stream page with title and breadcrumbs', async () => {
    render(
      <MemoryRouter initialEntries={['/event-streams/1/details']}>
        <Routes>
          <Route path="/event-streams/:id/details" element={<EventStreamPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Test Event Stream' })).toBeInTheDocument();
    });

    // Verify breadcrumbs
    const breadcrumbNav = screen.getByRole('navigation', { name: 'Breadcrumb' });
    const breadcrumbItems = within(breadcrumbNav).getAllByRole('listitem');

    expect(breadcrumbItems).toHaveLength(2);
    expect(breadcrumbItems[0]).toHaveTextContent('Event Streams');
    expect(breadcrumbItems[1]).toHaveTextContent('Test Event Stream');
  });

  it('should render all navigation tabs', async () => {
    render(
      <MemoryRouter initialEntries={['/event-streams/1/details']}>
        <Routes>
          <Route path="/event-streams/:id/*" element={<EventStreamPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Test Event Stream' })).toBeInTheDocument();
    });

    expect(screen.getByRole('tab', { name: 'Details' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Activations' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Team Access' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'User Access' })).toBeInTheDocument();
  });

  it('should render page actions when user has PATCH permission', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/event-streams/1/details']}>
        <Routes>
          <Route path="/event-streams/:id/details" element={<EventStreamPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Test Event Stream' })).toBeInTheDocument();
    });

    // The switch for forwarding events should be visible and enabled
    await waitFor(() => {
      const switchElement = screen.getByRole('switch', {
        name: 'Forward events to rulebook activation',
      });
      expect(switchElement).toBeInTheDocument();
      expect(switchElement).not.toBeDisabled();
    });

    const actionsDropdown = screen.getByTestId('actions-dropdown');
    await user.click(actionsDropdown);

    // Verify delete option is visible and enabled
    await waitFor(() => {
      const deleteOption = screen.getByRole('menuitem', { name: /delete/i });
      expect(deleteOption).toBeInTheDocument();
      expect(deleteOption).not.toHaveAttribute('aria-disabled', 'true');
    });
  });

  it('should disable delete action when event stream has activations', async () => {
    const user = userEvent.setup();
    const mockActivationsWithData = {
      count: 1,
      next: null,
      previous: null,
      page_size: 200,
      page: 1,
      results: [
        {
          id: 1,
          name: 'Test Activation',
        },
      ],
    };

    server.use(
      http.get(edaAPI`/event-streams/1/activations/`, () =>
        HttpResponse.json(mockActivationsWithData)
      )
    );

    render(
      <MemoryRouter initialEntries={['/event-streams/1/details']}>
        <Routes>
          <Route path="/event-streams/:id/details" element={<EventStreamPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Test Event Stream' })).toBeInTheDocument();
    });

    const actionsDropdown = screen.getByTestId('actions-dropdown');
    await user.click(actionsDropdown);

    // Verify delete option is visible and disabled
    await waitFor(() => {
      const deleteOption = screen.getByRole('menuitem', { name: /delete/i });
      expect(deleteOption).toBeInTheDocument();
      expect(deleteOption).toHaveAttribute('aria-disabled', 'true');
    });
  });

  it('should disable delete action when user does not have PATCH permission', async () => {
    const user = userEvent.setup();
    const mockOptionsWithoutPatch = {
      ...mockEventStreamOptions,
      actions: {
        GET: mockEventStreamOptions.actions.GET,
      },
    };

    server.use(
      http.options(edaAPI`/event-streams/1/`, () => HttpResponse.json(mockOptionsWithoutPatch))
    );

    render(
      <MemoryRouter initialEntries={['/event-streams/1/details']}>
        <Routes>
          <Route path="/event-streams/:id/details" element={<EventStreamPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Test Event Stream' })).toBeInTheDocument();
    });

    // The switch should be visible but disabled
    await waitFor(() => {
      const switchElement = screen.getByRole('switch', {
        name: 'Forward events to rulebook activation',
      });
      expect(switchElement).toBeInTheDocument();
      expect(switchElement).toBeDisabled();
    });

    const actionsDropdown = screen.getByTestId('actions-dropdown');
    await user.click(actionsDropdown);

    // Verify delete option is visible and disabled
    await waitFor(() => {
      const deleteOption = screen.getByRole('menuitem', { name: /delete/i });
      expect(deleteOption).toBeInTheDocument();
      expect(deleteOption).toHaveAttribute('aria-disabled', 'true');
    });
  });
});
