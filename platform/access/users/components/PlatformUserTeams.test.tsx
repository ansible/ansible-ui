import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { IPlatformView } from '../../../hooks/usePlatformView';
import { PlatformTeam } from '../../../interfaces/PlatformTeam';
import { gatewayAPI } from '../../../utils/gateway-api-utils';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const { mockUsePlatformViewImpl, minimalViewHoisted } = vi.hoisted(() => {
  const view = {
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
    refresh: async () => {},
    itemCount: 0,
    pageItems: [] as PlatformTeam[],
    keyFn: (item: PlatformTeam) => item.id,
    isSelected: () => false,
    selectedItems: [] as PlatformTeam[],
    selectItem: vi.fn(),
    unselectItem: vi.fn(),
    selectItems: vi.fn(),
    unselectAll: vi.fn(),
    unselectItemsAndRefresh: async () => {},
    selectItemsAndRefresh: async () => {},
  } as unknown as IPlatformView<PlatformTeam>;
  return {
    minimalViewHoisted: view,
    mockUsePlatformViewImpl: vi.fn((_options: unknown): IPlatformView<PlatformTeam> => view),
  };
});

vi.mock('../../../hooks/usePlatformView', () => ({
  usePlatformView: (options: unknown): IPlatformView<PlatformTeam> =>
    mockUsePlatformViewImpl(options),
}));

vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual('@ansible/ansible-ui-framework');
  return {
    ...actual,
    PageTable: (props: Readonly<Record<string, unknown>>) => (
      <div
        data-testid="page-table"
        data-empty-title={String(props.emptyStateTitle ?? '')}
        data-error-title={String(props.errorStateTitle ?? '')}
      />
    ),
  };
});

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

describe('PlatformUserTeams', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUsePlatformViewImpl.mockImplementation(
      (_options: unknown): IPlatformView<PlatformTeam> => minimalViewHoisted
    );
  });

  it('wires usePlatformView to the user teams gateway URL', () => {
    renderTeams('12');
    expect(mockUsePlatformViewImpl).toHaveBeenCalledWith(
      expect.objectContaining({
        url: `${gatewayAPI`/users/`}12/teams/`,
      })
    );
    expect(screen.getByTestId('page-table')).toBeInTheDocument();
    expect(screen.getByTestId('page-table')).toHaveAttribute('data-empty-title', 'No teams');
    expect(screen.getByTestId('page-table')).toHaveAttribute(
      'data-error-title',
      'Error loading teams'
    );
  });
});
