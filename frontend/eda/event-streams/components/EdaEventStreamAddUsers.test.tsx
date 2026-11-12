import { render, screen, waitFor, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { edaAPI } from '../../common/eda-utils';
import { EdaRoute } from '../../main/EdaRoutes';
import { EdaEventStreamAddUsers } from './EdaEventStreamAddUsers';

const { pageNavigate, bulkDialog } = vi.hoisted(() => ({
  pageNavigate: vi.fn(),
  bulkDialog: vi.fn(),
}));

vi.mock('@ansible/ansible-ui-framework', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@ansible/ansible-ui-framework')>();
  return {
    ...actual,
    usePageNavigate: () => pageNavigate,
  };
});

vi.mock('../../common/useEdaBulkActionDialog', () => ({
  useEdaBulkActionDialog:
    () =>
    (options: {
      items: unknown[];
      actionFn: (item: unknown) => Promise<unknown>;
      onComplete: () => void;
      onClose: () => void;
      actionColumns: { header: string; cell: (item: unknown) => unknown }[];
      keyFn: (item: unknown) => string;
    }) => {
      bulkDialog(options);
      void (async () => {
        for (const item of options.items) {
          await options.actionFn(item);
        }
        options.onComplete();
      })();
    },
}));

const mockEventStream = {
  id: 15,
  name: 'Test Event Stream',
  description: 'A test event stream',
  organization_id: 1,
  event_stream_type: 'hmac',
  enabled: true,
};

const mockUsersResponse = {
  count: 1,
  next: null,
  previous: null,
  page_size: 10,
  page: 1,
  results: [
    {
      id: 101,
      username: 'testuser',
      email: 'testuser@example.com',
      first_name: 'Test',
      last_name: 'User',
    },
  ],
};

const mockRolesResponse = {
  count: 1,
  next: null,
  previous: null,
  page_size: 10,
  page: 1,
  results: [
    {
      id: 201,
      name: 'Event Stream Admin',
      description: 'Has all permissions to a single event stream',
      content_type: 'eda.eventstream',
      managed: true,
    },
  ],
};

let capturedRolesUrl: string | undefined;
let capturedAssignment: unknown;

const server = setupServer(
  http.get(edaAPI`/event-streams/15/`, () => HttpResponse.json(mockEventStream)),
  http.get('*/api/gateway/v1/role_definitions/', ({ request }) => {
    capturedRolesUrl = request.url;
    return HttpResponse.json(mockRolesResponse);
  }),
  http.get('*/api/gateway/v1/users/', () => HttpResponse.json(mockUsersResponse)),
  http.post('*/api/gateway/v1/role_user_assignments/', async ({ request }) => {
    capturedAssignment = await request.json();
    return HttpResponse.json({ id: 1 });
  })
);

beforeAll(() => server.listen());
beforeEach(() => {
  pageNavigate.mockClear();
  bulkDialog.mockClear();
});
afterEach(() => {
  server.resetHandlers();
  capturedRolesUrl = undefined;
  capturedAssignment = undefined;
});
afterAll(() => server.close());

function renderComponent(id = '15') {
  return render(
    <MemoryRouter initialEntries={[`/event-streams/${id}/user-access/add-users`]}>
      <Routes>
        <Route
          path="/event-streams/:id/user-access/add-users"
          element={<EdaEventStreamAddUsers />}
        />
      </Routes>
    </MemoryRouter>
  );
}

describe('EdaEventStreamAddUsers', () => {
  it('should render the assign users page title and breadcrumbs', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Assign users/i })).toBeInTheDocument();
    });

    expect(screen.getByText('EventStreams')).toBeInTheDocument();
    expect(screen.getByText('Test Event Stream')).toBeInTheDocument();
    expect(screen.getByText('User Access')).toBeInTheDocument();
  });

  it('should render the wizard step labels', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Assign users/i })).toBeInTheDocument();
    });

    expect(screen.getAllByText('Select user(s)').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Select roles to apply').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Review').length).toBeGreaterThanOrEqual(1);
  });

  it('should render the wizard buttons', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Assign users/i })).toBeInTheDocument();
    });

    const wizardFooter = screen.getByTestId('wizard-footer');
    expect(within(wizardFooter).getByRole('button', { name: /^Next$/ })).toBeInTheDocument();
    expect(within(wizardFooter).getByRole('button', { name: /^Cancel$/ })).toBeInTheDocument();

    const backButton = within(wizardFooter).getByRole('button', { name: /^Back$/ });
    expect(backButton).toBeInTheDocument();
    expect(backButton).toBeDisabled();
  });

  it('should fetch roles filtered by eda.eventstream content type', async () => {
    const user = userEvent.setup({ delay: null });
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('testuser')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('checkbox', { name: /Select row/i }));
    await user.click(screen.getByRole('button', { name: /^Next$/ }));

    await waitFor(() => {
      expect(screen.getByText('Event Stream Admin')).toBeInTheDocument();
    });

    expect(capturedRolesUrl).toBeDefined();
    expect(capturedRolesUrl).toContain('content_type__api_slug=eda.eventstream');

    const wizardFooter = screen.getByTestId('wizard-footer');
    const backButton = within(wizardFooter).getByRole('button', { name: /^Back$/ });
    expect(backButton).toBeInTheDocument();
    expect(backButton).toBeEnabled();
  });

  it('should show a loading page until the event stream is available', () => {
    server.use(http.get(edaAPI`/event-streams/99/`, () => HttpResponse.json({}, { status: 404 })));
    renderComponent('99');
    expect(screen.queryByRole('heading', { name: /Assign users/i })).not.toBeInTheDocument();
  });

  it('should validate that at least one user is selected', async () => {
    const user = userEvent.setup({ delay: null });
    renderComponent();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Assign users/i })).toBeInTheDocument();
    });
    await user.click(screen.getByRole('button', { name: /^Next$/ }));
    await waitFor(() => {
      expect(screen.getByText('Select at least one user.')).toBeInTheDocument();
    });
  });

  it('should cancel back to user access', async () => {
    const user = userEvent.setup({ delay: null });
    renderComponent();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Assign users/i })).toBeInTheDocument();
    });
    await user.click(screen.getByRole('button', { name: /^Cancel$/ }));
    expect(pageNavigate).toHaveBeenCalledWith(EdaRoute.EventStreamUserAccess, {
      params: { id: 15 },
    });
  });

  it('should validate that at least one role is selected', async () => {
    const user = userEvent.setup({ delay: null });
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('testuser')).toBeInTheDocument();
    });
    await user.click(screen.getByRole('checkbox', { name: /Select row/i }));
    await user.click(screen.getByRole('button', { name: /^Next$/ }));
    await waitFor(() => {
      expect(screen.getByText('Event Stream Admin')).toBeInTheDocument();
    });
    await user.click(screen.getByRole('button', { name: /^Next$/ }));
    await waitFor(() => {
      expect(screen.getByText('Select at least one role.')).toBeInTheDocument();
    });
  });

  it('should assign selected users and roles', async () => {
    const user = userEvent.setup({ delay: null });
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('testuser')).toBeInTheDocument();
    });
    await user.click(screen.getByRole('checkbox', { name: /Select row/i }));
    await user.click(screen.getByRole('button', { name: /^Next$/ }));
    await waitFor(() => {
      expect(screen.getByText('Event Stream Admin')).toBeInTheDocument();
    });
    await user.click(screen.getByRole('checkbox', { name: /Select row/i }));
    await user.click(screen.getByRole('button', { name: /^Next$/ }));
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^Finish$/ })).toBeInTheDocument();
    });
    await user.click(screen.getByRole('button', { name: /^Finish$/ }));

    await waitFor(() => {
      expect(bulkDialog).toHaveBeenCalled();
    });
    const options = bulkDialog.mock.calls[0][0] as {
      items: Array<{ user: { id: number; username: string }; role: { id: number; name: string } }>;
      actionColumns: Array<{
        cell: (item: { user: { username: string }; role: { name: string } }) => string;
      }>;
      keyFn: (item: { user: { id: number }; role: { id: number } }) => string;
      onClose: () => void;
    };
    expect(options.keyFn(options.items[0])).toBe('101_201');
    expect(options.actionColumns[0].cell(options.items[0])).toBe('testuser');
    expect(options.actionColumns[1].cell(options.items[0])).toBe('Event Stream Admin');
    await waitFor(() => {
      expect(capturedAssignment).toEqual({
        user: 101,
        role_definition: 201,
        content_type: 'eda.eventstream',
        object_id: 15,
      });
    });
    options.onClose();
    expect(pageNavigate).toHaveBeenCalledWith(EdaRoute.EventStreamUserAccess, {
      params: { id: '15' },
    });
  }, 15_000);
});
