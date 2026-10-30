/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { pulpAPI } from '../../../common/api/formatPath';
import { RepositoryAssignTeams } from './RepositoryAssignTeam';

const mockNavigate = vi.fn();

vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual('@ansible/ansible-ui-framework');
  return {
    ...actual,
    usePageNavigate: () => mockNavigate,
  };
});

vi.mock('../../../common/useHubBulkActionDialog', () => ({
  useHubBulkActionDialog:
    () =>
    (config: {
      items: unknown[];
      actionFn: (item: unknown) => Promise<unknown>;
      onComplete?: () => void;
      onClose?: () => void;
    }) => {
      void (async () => {
        for (const item of config.items) {
          await config.actionFn(item);
        }
        config.onComplete?.();
        config.onClose?.();
      })();
    },
}));

const mockRepository = {
  name: 'test-repo',
  description: '',
  pulp_href: '/pulp/api/v3/repositories/ansible/ansible/12345678-1234-1234-1234-123456789abc/',
  pulp_created: '2026-01-01T00:00:00Z',
  pulp_labels: {},
  private: false,
  retain_repo_versions: 1,
  remote: null,
  gpgkey: null,
  last_sync_task: {
    state: 'completed',
    task_id: '1',
    started_at: '2026-01-01T00:00:00Z',
    finished_at: '2026-01-01T00:00:00Z',
  },
  last_synced_metadata_time: null,
  latest_version_href: '',
  versions_href: '',
};

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => {
  server.resetHandlers();
  mockNavigate.mockClear();
});
afterAll(() => server.close());

function renderRepositoryAssignTeams() {
  render(
    <MemoryRouter initialEntries={['/repositories/test-repo/team-access/add']}>
      <Routes>
        <Route path="/repositories/:id/team-access/add" element={<RepositoryAssignTeams />} />
      </Routes>
    </MemoryRouter>
  );
}

function useRepositoryHandlers() {
  server.use(
    http.get(pulpAPI`/repositories/ansible/ansible/`, ({ request }) => {
      const url = new URL(request.url);
      if (url.searchParams.get('name') === 'test-repo') {
        return HttpResponse.json({ count: 1, results: [mockRepository] });
      }
      return HttpResponse.json({ count: 0, results: [] });
    }),
    http.get('*/teams/*', () =>
      HttpResponse.json({
        count: 1,
        results: [{ id: 1, name: 'ops', url: '/teams/1/' }],
      })
    ),
    http.get('*/role_definitions/*', () =>
      HttpResponse.json({
        count: 1,
        results: [{ id: 4, name: 'galaxy.ansiblerepository_owner', description: 'Owner' }],
      })
    ),
    http.get('*/service-index/role-types/', () =>
      HttpResponse.json({ results: [{ api_slug: 'galaxy.ansiblerepository', name: 'Repository' }] })
    ),
    http.get('*/service-index/role-permissions/*', () => HttpResponse.json({ results: [] }))
  );
}

describe('RepositoryAssignTeams', () => {
  it('renders assign teams wizard', async () => {
    useRepositoryHandlers();
    renderRepositoryAssignTeams();

    await waitFor(() => {
      expect(screen.getByTestId('wizard')).toBeInTheDocument();
    });
    expect(screen.getByRole('heading', { name: 'Assign teams' })).toBeInTheDocument();
  });

  it('shows error when repository fails to load', async () => {
    server.use(
      http.get(pulpAPI`/repositories/ansible/ansible/`, () =>
        HttpResponse.json({ detail: 'Not found' }, { status: 404 })
      )
    );

    renderRepositoryAssignTeams();
    expect(await screen.findByRole('button', { name: /Refresh/i })).toBeInTheDocument();
  });

  it('navigates back on cancel', async () => {
    useRepositoryHandlers();
    const user = userEvent.setup();
    renderRepositoryAssignTeams();

    await screen.findByTestId('wizard');
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(mockNavigate).toHaveBeenCalled();
  });

  it('requires at least one team before continuing the wizard', async () => {
    useRepositoryHandlers();
    const user = userEvent.setup();
    renderRepositoryAssignTeams();

    await screen.findByTestId('wizard');
    await user.click(screen.getByRole('button', { name: 'Next' }));

    expect(await screen.findByText('Select at least one team.')).toBeInTheDocument();
  });

  it('requires at least one role before continuing the wizard', async () => {
    useRepositoryHandlers();
    const user = userEvent.setup();
    renderRepositoryAssignTeams();

    await screen.findByText('ops', {}, { timeout: 10000 });
    await user.click(screen.getByRole('checkbox', { name: /Select row/i }));
    await user.click(screen.getByRole('button', { name: /^Next$/ }));

    await waitFor(() => {
      expect(screen.getByText('galaxy.ansiblerepository_owner')).toBeInTheDocument();
    });
    await user.click(screen.getByRole('button', { name: /^Next$/ }));

    expect(await screen.findByText('Select at least one role.')).toBeInTheDocument();
  }, 15000);

  it('submits team role assignments from the wizard', async () => {
    useRepositoryHandlers();
    server.use(
      http.post('*/role_team_assignments/*', () => HttpResponse.json({ id: 99 }, { status: 201 }))
    );

    const user = userEvent.setup();
    renderRepositoryAssignTeams();

    await screen.findByText('ops');
    await user.click(screen.getByRole('checkbox', { name: /Select row/i }));
    await user.click(screen.getByRole('button', { name: /^Next$/ }));

    await waitFor(() => {
      expect(screen.getByText('galaxy.ansiblerepository_owner')).toBeInTheDocument();
    });

    const roleRow = screen.getByText('galaxy.ansiblerepository_owner').closest('tr');
    await user.click(within(roleRow as HTMLElement).getByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: /^Next$/ }));
    await user.click(screen.getByRole('button', { name: /^Finish$/ }));

    await waitFor(
      () => {
        expect(mockNavigate).toHaveBeenCalled();
      },
      { timeout: 20000 }
    );
  }, 30000);
});
