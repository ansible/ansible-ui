import '@testing-library/jest-dom/vitest';
import type { IPageAction } from '@ansible/ansible-ui-framework';
import { render, render as renderStandalone, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { IPlatformView } from '../../../hooks/usePlatformView';
import type { PlatformTeam } from '../../../interfaces/PlatformTeam';
import type { PlatformRole } from '../../../interfaces/PlatformRole';
import type { UserAssignment } from '@ansible/common-ui/access/interfaces/UserAssignment';
import { gatewayAPI } from '../../../utils/gateway-api-utils';

const mockSetDialog = vi.fn();
const mockPostRequest = vi.fn<(url: string, body: Record<string, unknown>) => Promise<unknown>>();
const mockGetRequest =
  vi.fn<(url: string, params: Record<string, string>) => Promise<{ results?: UserAssignment[] }>>();
const mockDeleteRequest = vi.fn<(url: string) => Promise<unknown>>();
const mockAlertToaster = { addAlert: vi.fn() };
const mockBulkAction = vi.fn<(opts: { actionFn: (team: PlatformTeam) => Promise<void> }) => void>();

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual<typeof import('@ansible/ansible-ui-framework')>(
    '@ansible/ansible-ui-framework'
  );
  return {
    ...actual,
    MultiSelectDialog: () => <div data-testid="multi-select-dialog" />,
    PageTable: (props: Readonly<{ toolbarActions?: IPageAction<PlatformTeam>[] }>) => (
      <div data-testid="page-table">
        {props.toolbarActions?.map((a, i) => (
          <button
            key={i}
            type="button"
            data-testid={`toolbar-${i}`}
            onClick={() => {
              if (!('onClick' in a) || typeof a.onClick !== 'function') return;
              if (a.label === 'Remove teams') {
                void (a.onClick as (teams: PlatformTeam[]) => void)([
                  { id: 8, name: 'Team8' } as PlatformTeam,
                ]);
                return;
              }
              void (a.onClick as () => void)();
            }}
          >
            {a.label}
          </button>
        ))}
      </div>
    ),
    usePageDialog: () => [undefined, mockSetDialog],
    usePageAlertToaster: () => mockAlertToaster,
    useBulkConfirmation: () => mockBulkAction,
  };
});

const teamView = {
  page: 1,
  perPage: 10,
  setPage: vi.fn(),
  setPerPage: vi.fn(),
  sort: undefined,
  setSort: vi.fn(),
  sortDirection: 'asc' as const,
  setSortDirection: vi.fn(),
  filterState: {},
  setFilterState: vi.fn(),
  clearAllFilters: vi.fn(),
  refresh: vi.fn(async () => {}),
  itemCount: 0,
  pageItems: [] as PlatformTeam[],
  keyFn: (item: PlatformTeam) => item.id,
  isSelected: () => false,
  selectedItems: [] as PlatformTeam[],
  selectItem: vi.fn(),
  unselectItem: vi.fn(),
  selectItems: vi.fn(),
  unselectAll: vi.fn(),
  unselectItemsAndRefresh: vi.fn(async () => {}),
  selectItemsAndRefresh: vi.fn(async () => {}),
} as unknown as IPlatformView<PlatformTeam>;

const mockUsePlatformView = vi.fn(() => teamView);
const usePlatformViewCalls: unknown[] = [];

vi.mock('../../../hooks/usePlatformView', () => ({
  usePlatformView: (options: unknown) => {
    usePlatformViewCalls.push(options);
    return mockUsePlatformView(options);
  },
}));

vi.mock('../../teams/hooks/useTeamFilters', () => ({
  useTeamFilters: () => [],
}));
vi.mock('../../teams/hooks/useTeamColumns', () => ({
  useTeamColumns: () => [{ header: 'Name', cell: () => null }],
}));

vi.mock('@ansible/common-ui/crud/usePostRequest', () => ({
  usePostRequest: () => mockPostRequest,
}));
let teamMemberRoleId = 900;
let teamAdminRoleId = 901;

vi.mock('@ansible/common-ui/crud/useGet', () => ({
  useGet: (_url: string, qs?: { name?: string }) => {
    if (qs?.name === 'Team Member') {
      return {
        data: { results: [{ id: teamMemberRoleId, name: 'Team Member' } as PlatformRole] },
      };
    }
    if (qs?.name === 'Team Admin') {
      return {
        data: { results: [{ id: teamAdminRoleId, name: 'Team Admin' } as PlatformRole] },
      };
    }
    return { data: undefined };
  },
  useGetRequest: () => mockGetRequest,
}));
vi.mock('@ansible/common-ui/crud/useDeleteRequest', () => ({
  useDeleteRequest: () => mockDeleteRequest,
}));

import { PlatformUserTeams } from './PlatformUserTeams';

function renderTeams(userId = '12') {
  return render(
    <MemoryRouter initialEntries={[`/platform/users/${userId}/teams`]}>
      <Routes>
        <Route path="/platform/users/:id/teams" element={<PlatformUserTeams />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('PlatformUserTeams actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    usePlatformViewCalls.length = 0;
    teamMemberRoleId = 900;
    teamAdminRoleId = 901;
    mockGetRequest.mockImplementation((_url, params) => {
      if (params.role_definition === '900') {
        return Promise.resolve({ results: [{ id: 700 } as UserAssignment] });
      }
      if (params.role_definition === '901') {
        return Promise.resolve({ results: [{ id: 701 } as UserAssignment] });
      }
      return Promise.resolve({ results: [] });
    });
  });

  it('opens assign dialog with post flow', async () => {
    const user = userEvent.setup();
    renderTeams('12');

    await user.click(screen.getByText('Assign teams'));

    expect(mockSetDialog).toHaveBeenCalled();
    const dialog = mockSetDialog.mock.calls[0][0] as ReactElement<{
      onSelect: (teams: PlatformTeam[]) => Promise<void>;
    }>;

    mockPostRequest.mockResolvedValue({});
    await dialog.props.onSelect([{ id: 5, name: 'T' } as PlatformTeam]);

    expect(mockPostRequest).toHaveBeenCalledWith(gatewayAPI`/role_user_assignments/`, {
      object_id: 5,
      role_definition: 900,
      user: '12',
    });

    const dialogEl = mockSetDialog.mock.calls[0][0] as ReactElement;
    renderStandalone(dialogEl);
    expect(screen.getByTestId('multi-select-dialog')).toBeInTheDocument();
    const teamsPickerOptions = usePlatformViewCalls.find(
      (o) => o && typeof o === 'object' && 'disableQueryString' in (o as object)
    );
    expect(teamsPickerOptions).toEqual(
      expect.objectContaining({
        url: gatewayAPI`/teams/`,
        disableQueryString: true,
      })
    );
  });

  it('shows alert when assign post fails', async () => {
    const user = userEvent.setup();
    renderTeams('12');
    await user.click(screen.getByText('Assign teams'));
    const dialog = mockSetDialog.mock.calls[0][0] as ReactElement<{
      onSelect: (teams: PlatformTeam[]) => Promise<void>;
    }>;

    mockPostRequest.mockRejectedValue(new Error('network down'));
    await dialog.props.onSelect([{ id: 5, name: 'T' } as PlatformTeam]);

    expect(mockAlertToaster.addAlert).toHaveBeenCalledWith(
      expect.objectContaining({ variant: 'danger', title: 'Failed to assign team(s) to user.' })
    );
  });

  it('remove teams triggers bulk confirmation delete flow', async () => {
    const user = userEvent.setup();
    renderTeams('12');

    await user.click(screen.getByText('Remove teams'));

    expect(mockBulkAction).toHaveBeenCalled();
    const opts = mockBulkAction.mock.calls[0][0];
    await opts.actionFn({ id: 8, name: 'Team8' } as PlatformTeam);

    expect(mockGetRequest).toHaveBeenCalled();
    expect(mockDeleteRequest).toHaveBeenCalledWith(gatewayAPI`/role_user_assignments/700/`);
    expect(mockDeleteRequest).toHaveBeenCalledWith(gatewayAPI`/role_user_assignments/701/`);
  });
});
