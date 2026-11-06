import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PlatformUser } from '../../../interfaces/PlatformUser';

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

type ActiveUserHookResult = {
  activePlatformUser?: PlatformUser | null | undefined;
};

const { mockUseUserRowActions, mockUseGetItem, mockUsePlatformActiveUser } = vi.hoisted(() => ({
  mockUseUserRowActions: vi.fn((_onDeleted: () => void) => []),
  mockUseGetItem: vi.fn(),
  mockUsePlatformActiveUser: vi.fn(
    (): ActiveUserHookResult => ({
      activePlatformUser: undefined,
    })
  ),
}));

vi.mock('../hooks/useUserActions', () => ({
  useUserRowActions: (onDeleted: () => void) => mockUseUserRowActions(onDeleted),
}));

vi.mock('../../../main/PlatformActiveUserProvider', () => ({
  usePlatformActiveUser: (): ActiveUserHookResult => mockUsePlatformActiveUser(),
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

import { PlatformUserPage } from './PlatformUserPage';

const gatewayUser = (overrides: Partial<PlatformUser> = {}): PlatformUser => ({
  id: 7,
  url: '/api/gateway/v1/users/7/',
  created: '',
  created_by: '',
  modified: '',
  modified_by: '',
  related: {},
  summary_fields: {
    modified_by: { id: 1, username: 'm', first_name: '', last_name: '' },
    created_by: { id: 1, username: 'c', first_name: '', last_name: '' },
    resource: { ansible_id: 'a', resource_type: 'user' },
  },
  username: 'Seven',
  last_login_map_results: [],
  managed: false,
  ...overrides,
});

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/platform/users/7']}>
      <Routes>
        <Route path="/platform/users/:id" element={<PlatformUserPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('PlatformUserPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUsePlatformActiveUser.mockReturnValue({ activePlatformUser: gatewayUser({ id: 99 }) });
  });

  it('renders AwxError with refresh when gateway user fetch errors', () => {
    const refresh = vi.fn();
    mockUseGetItem.mockReturnValue({
      error: new Error('fail'),
      data: undefined,
      refresh,
    });
    renderPage();
    expect(screen.getByTestId('awx-error')).toBeInTheDocument();
  });

  it('shows loading when user row is not yet available', () => {
    mockUseGetItem.mockReturnValue({
      error: undefined,
      data: undefined,
      refresh: vi.fn(),
    });
    renderPage();
    expect(screen.getByTestId('loading-page')).toBeInTheDocument();
  });

  it('shows loading when active platform user is not yet available', () => {
    mockUsePlatformActiveUser.mockReturnValue({ activePlatformUser: undefined });
    mockUseGetItem.mockReturnValue({
      error: undefined,
      data: gatewayUser(),
      refresh: vi.fn(),
    });
    renderPage();
    expect(screen.getByTestId('loading-page')).toBeInTheDocument();
  });

  it('renders header and tab labels when user loads (not viewing self)', () => {
    mockUseGetItem.mockReturnValue({
      error: undefined,
      data: gatewayUser({ id: 7 }),
      refresh: vi.fn(),
    });
    mockUsePlatformActiveUser.mockReturnValue({
      activePlatformUser: gatewayUser({ id: 1, username: 'active' }),
    });
    mockUseUserRowActions.mockReturnValue([]);
    renderPage();
    expect(screen.getByTestId('page-title')).toHaveTextContent('Seven');
    expect(mockUseUserRowActions).toHaveBeenCalled();
    expect(screen.getByText('Details')).toBeInTheDocument();
    expect(screen.getByText('Teams')).toBeInTheDocument();
    expect(screen.getByText('Roles')).toBeInTheDocument();
    expect(screen.queryByText('API Tokens')).not.toBeInTheDocument();
  });

  it('adds API Tokens tab when viewing the signed-in user', () => {
    mockUseGetItem.mockReturnValue({
      error: undefined,
      data: gatewayUser({ id: 7 }),
      refresh: vi.fn(),
    });
    mockUsePlatformActiveUser.mockReturnValue({
      activePlatformUser: gatewayUser({ id: 7, username: 'Seven' }),
    });
    mockUseUserRowActions.mockReturnValue([]);
    renderPage();
    expect(screen.getByText('API Tokens')).toBeInTheDocument();
  });
});
