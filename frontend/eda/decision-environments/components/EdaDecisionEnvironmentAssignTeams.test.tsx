import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { edaAPI } from '../../common/eda-utils';
import { EdaRoute } from '../../main/EdaRoutes';
import { EdaDecisionEnvironmentAssignTeams } from './EdaDecisionEnvironmentAssignTeams';

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

const mockDecisionEnvironment = {
  id: 5,
  name: 'Test Decision Environment',
  description: 'A test decision environment',
  organization_id: 1,
  image_url: 'quay.io/ansible/ansible-rulebook:main',
};

const mockTeamsResponse = {
  count: 1,
  next: null,
  previous: null,
  page_size: 10,
  page: 1,
  results: [{ id: 101, name: 'Alpha Team', organization: 1 }],
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
      name: 'Decision Environment Admin',
      description: 'Has all permissions to a single decision environment',
      content_type: 'eda.decisionenvironment',
      managed: true,
    },
  ],
};

let capturedRolesUrl: string | undefined;
let capturedAssignment: unknown;

const server = setupServer(
  http.get(edaAPI`/decision-environments/5/`, () => HttpResponse.json(mockDecisionEnvironment)),
  http.get('*/api/gateway/v1/role_definitions/', ({ request }) => {
    capturedRolesUrl = request.url;
    return HttpResponse.json(mockRolesResponse);
  }),
  http.get('*/api/gateway/v1/teams/', () => HttpResponse.json(mockTeamsResponse)),
  http.post('*/api/gateway/v1/role_team_assignments/', async ({ request }) => {
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

function renderComponent(id = '5') {
  return render(
    <MemoryRouter initialEntries={[`/decision-environments/${id}/team-access/assign-teams`]}>
      <Routes>
        <Route
          path="/decision-environments/:id/team-access/assign-teams"
          element={<EdaDecisionEnvironmentAssignTeams />}
        />
      </Routes>
    </MemoryRouter>
  );
}

describe('EdaDecisionEnvironmentAssignTeams', () => {
  it('should render the assign teams page title and breadcrumbs', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Assign teams/i })).toBeInTheDocument();
    });

    expect(screen.getByText('DecisionEnvironments')).toBeInTheDocument();
    expect(screen.getByText('Test Decision Environment')).toBeInTheDocument();
    expect(screen.getByText('Team Access')).toBeInTheDocument();
  });

  it('should render the wizard step labels', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Assign teams/i })).toBeInTheDocument();
    });

    expect(screen.getAllByText('Select team(s)').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Select roles to apply').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Review').length).toBeGreaterThanOrEqual(1);
  });

  it('should fetch roles filtered by eda.decisionenvironment content type', async () => {
    const user = userEvent.setup({ delay: null });
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Alpha Team')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('checkbox', { name: /Select row/i }));
    await user.click(screen.getByRole('button', { name: /^Next$/ }));

    await waitFor(() => {
      expect(screen.getByText('Decision Environment Admin')).toBeInTheDocument();
    });

    expect(capturedRolesUrl).toBeDefined();
    expect(capturedRolesUrl).toContain('content_type__api_slug=eda.decisionenvironment');
  });

  it('should have a cancel button', async () => {
    const user = userEvent.setup({ delay: null });
    renderComponent();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Assign teams/i })).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Cancel/i }));
    expect(pageNavigate).toHaveBeenCalledWith(EdaRoute.DecisionEnvironmentTeamAccess, {
      params: { id: 5 },
    });
  });

  it('should show a loading page until the decision environment is available', () => {
    server.use(
      http.get(edaAPI`/decision-environments/99/`, () => HttpResponse.json({}, { status: 404 }))
    );
    renderComponent('99');
    expect(screen.queryByRole('heading', { name: /Assign teams/i })).not.toBeInTheDocument();
  });

  it('should validate that at least one team is selected', async () => {
    const user = userEvent.setup({ delay: null });
    renderComponent();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Assign teams/i })).toBeInTheDocument();
    });
    await user.click(screen.getByRole('button', { name: /^Next$/ }));
    await waitFor(() => {
      expect(screen.getByText('Select at least one team.')).toBeInTheDocument();
    });
  });

  it('should validate that at least one role is selected', async () => {
    const user = userEvent.setup({ delay: null });
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Alpha Team')).toBeInTheDocument();
    });
    await user.click(screen.getByRole('checkbox', { name: /Select row/i }));
    await user.click(screen.getByRole('button', { name: /^Next$/ }));
    await waitFor(() => {
      expect(screen.getByText('Decision Environment Admin')).toBeInTheDocument();
    });
    await user.click(screen.getByRole('button', { name: /^Next$/ }));
    await waitFor(() => {
      expect(screen.getByText('Select at least one role.')).toBeInTheDocument();
    });
  });

  it('should assign selected teams and roles', async () => {
    const user = userEvent.setup({ delay: null });
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Alpha Team')).toBeInTheDocument();
    });
    await user.click(screen.getByRole('checkbox', { name: /Select row/i }));
    await user.click(screen.getByRole('button', { name: /^Next$/ }));
    await waitFor(() => {
      expect(screen.getByText('Decision Environment Admin')).toBeInTheDocument();
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
      items: Array<{ team: { id: number; name: string }; role: { id: number; name: string } }>;
      actionColumns: Array<{
        cell: (item: { team: { name: string }; role: { name: string } }) => string;
      }>;
      keyFn: (item: { team: { id: number }; role: { id: number } }) => string;
      onClose: () => void;
    };
    expect(options.keyFn(options.items[0])).toBe('101_201');
    expect(options.actionColumns[0].cell(options.items[0])).toBe('Alpha Team');
    expect(options.actionColumns[1].cell(options.items[0])).toBe('Decision Environment Admin');
    await waitFor(() => {
      expect(capturedAssignment).toEqual({
        team: 101,
        role_definition: 201,
        content_type: 'eda.decision-environment',
        object_id: 5,
      });
    });
    options.onClose();
    expect(pageNavigate).toHaveBeenCalledWith(EdaRoute.DecisionEnvironmentTeamAccess, {
      params: { id: '5' },
    });
  });
});
