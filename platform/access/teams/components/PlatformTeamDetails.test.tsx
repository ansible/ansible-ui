import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PlatformTeam } from '../../../interfaces/PlatformTeam';
import { gatewayAPI } from '../../../utils/gateway-api-utils';

vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual('@ansible/ansible-ui-framework');
  return {
    ...actual,
    LoadingPage: () => <div data-testid="loading-page">loading</div>,
    PageNotFound: () => <div data-testid="page-not-found">not found</div>,
    PageDetails: ({ children }: Readonly<{ children: ReactNode }>) => (
      <div data-testid="page-details">{children}</div>
    ),
    PageDetailsFromColumns: ({
      columns,
      item,
    }: Readonly<{ columns: unknown; item?: PlatformTeam }>) => (
      <div
        data-testid="details-from-columns"
        data-team-name={item?.name}
        data-column-count={Array.isArray(columns) ? columns.length : 0}
      />
    ),
  };
});

vi.mock('@ansible/awx-ui/common/AwxError', () => ({
  AwxError: (props: Readonly<{ error: Error }>) => (
    <div data-testid="awx-error">{props.error.message}</div>
  ),
}));

vi.mock('../hooks/useTeamColumns', () => ({
  useTeamColumns: () => [{ id: 'name', header: 'Name' }],
}));

const { mockUseGetItem } = vi.hoisted(() => ({
  mockUseGetItem: vi.fn(),
}));

vi.mock('@ansible/common-ui/crud/useGet', async () => {
  const actual = await vi.importActual<typeof import('@ansible/common-ui/crud/useGet')>(
    '@ansible/common-ui/crud/useGet'
  );
  return {
    ...actual,
    useGetItem: mockUseGetItem as typeof actual.useGetItem,
  };
});

import { PlatformTeamDetails } from './PlatformTeamDetails';

const sampleTeam: PlatformTeam = {
  id: 9,
  name: 'Gamma',
  description: 'd',
  url: `${gatewayAPI`/teams/`}9/`,
  created: '',
  created_by: '',
  modified: '',
  modified_by: '',
  related: { created_by: '', modified_by: '', organization: '' },
  summary_fields: {
    created_by: { id: 1, username: 'a', first_name: '', last_name: '' },
    modified_by: { id: 1, username: 'a', first_name: '', last_name: '' },
    organization: { id: 1, name: 'O' },
    resource: { ansible_id: 'x', resource_type: 'team' },
  },
  organization: 1,
  users: [],
};

function renderDetails(teamId = '9') {
  return render(
    <MemoryRouter initialEntries={[`/platform/teams/${teamId}/details`]}>
      <Routes>
        <Route path="/platform/teams/:id/details" element={<PlatformTeamDetails />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('PlatformTeamDetails', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading while team is fetching', () => {
    mockUseGetItem.mockReturnValue({ data: undefined, isLoading: true, error: undefined });
    renderDetails();
    expect(screen.getByTestId('loading-page')).toBeInTheDocument();
  });

  it('renders AwxError when fetch fails', () => {
    mockUseGetItem.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('gateway down'),
    });
    renderDetails();
    expect(screen.getByTestId('awx-error')).toHaveTextContent('gateway down');
  });

  it('renders PageNotFound when team is missing', () => {
    mockUseGetItem.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: undefined,
    });
    renderDetails();
    expect(screen.getByTestId('page-not-found')).toBeInTheDocument();
  });

  it('renders details from columns when team loads', () => {
    mockUseGetItem.mockReturnValue({
      data: sampleTeam,
      isLoading: false,
      error: undefined,
    });
    renderDetails();
    expect(screen.getByTestId('details-from-columns')).toHaveAttribute('data-team-name', 'Gamma');
    expect(screen.getByTestId('details-from-columns')).toHaveAttribute('data-column-count', '1');
  });
});
