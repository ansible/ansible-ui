import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PlatformTeam } from '../../../interfaces/PlatformTeam';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@ansible/awx-ui/common/AwxError', () => ({
  AwxError: (props: Readonly<{ handleRefresh: () => void }>) => (
    <div data-testid="awx-error">
      <button type="button" onClick={props.handleRefresh}>
        refresh
      </button>
    </div>
  ),
}));

vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual('@ansible/ansible-ui-framework');
  return {
    ...actual,
    LoadingPage: () => <div data-testid="loading-page">Loading</div>,
    useGetPageUrl: () => (route: string) => `/mock/${route}`,
    usePageNavigate: () => vi.fn(),
  };
});

vi.mock('@ansible/common-ui/PageRoutedTabs', () => ({
  PageRoutedTabs: (props: Readonly<{ tabs: { label: string }[] }>) => (
    <div data-testid="routed-tabs">
      {props.tabs.map((tab) => (
        <span key={tab.label}>{tab.label}</span>
      ))}
    </div>
  ),
}));

const { mockUseTeamPageActions, mockUseGetItem } = vi.hoisted(() => ({
  mockUseTeamPageActions: vi.fn((_onDeleted: () => void) => []),
  mockUseGetItem: vi.fn(),
}));

vi.mock('../hooks/useTeamActions', () => ({
  useTeamPageActions: (onDeleted: () => void) => mockUseTeamPageActions(onDeleted),
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

import { PlatformTeamPage } from './PlatformTeamPage';

const team: PlatformTeam = {
  id: 7,
  name: 'Seven',
  description: '',
  url: '',
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

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/platform/teams/7']}>
      <Routes>
        <Route path="/platform/teams/:id" element={<PlatformTeamPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('PlatformTeamPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders AwxError with refresh when gateway team fetch errors', () => {
    const refresh = vi.fn();
    mockUseGetItem.mockReturnValue({
      error: new Error('fail'),
      data: undefined,
      refresh,
    });
    renderPage();
    expect(screen.getByTestId('awx-error')).toBeInTheDocument();
  });

  it('shows loading when team is not yet available', () => {
    mockUseGetItem.mockReturnValue({
      error: undefined,
      data: undefined,
      refresh: vi.fn(),
    });
    renderPage();
    expect(screen.getByTestId('loading-page')).toBeInTheDocument();
  });

  it('renders header and tab labels when team loads', () => {
    mockUseGetItem.mockReturnValue({
      error: undefined,
      data: team,
      refresh: vi.fn(),
    });
    mockUseTeamPageActions.mockReturnValue([]);
    renderPage();
    expect(screen.getByTestId('page-title')).toHaveTextContent('Seven');
    expect(mockUseTeamPageActions).toHaveBeenCalled();
    expect(screen.getByText('Details')).toBeInTheDocument();
    expect(screen.getByText('Roles')).toBeInTheDocument();
    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(screen.getByText('Administrators')).toBeInTheDocument();
  });
});
