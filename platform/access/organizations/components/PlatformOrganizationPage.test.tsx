import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PlatformOrganization } from '../../../interfaces/PlatformOrganization';
import { PlatformRoute } from '../../../main/PlatformRoutes';

const { mockPageNavigate, mockUseGetItem, mockUseOrganizationPageActions, mockUseGatewayService } =
  vi.hoisted(() => ({
    mockPageNavigate: vi.fn(),
    mockUseGetItem: vi.fn(),
    mockUseOrganizationPageActions: vi.fn((_onDeleted: () => void): never[] => []),
    mockUseGatewayService: vi.fn(),
  }));

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
    usePageNavigate: () => mockPageNavigate,
    PageActions: () => <div data-testid="page-actions">actions</div>,
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

vi.mock('@ansible/common-ui/crud/useGet', async () => {
  const actual = await vi.importActual<typeof import('@ansible/common-ui/crud/useGet')>(
    '@ansible/common-ui/crud/useGet'
  );
  return {
    ...actual,
    useGetItem: mockUseGetItem as typeof actual.useGetItem,
  };
});

vi.mock('../hooks/useOrganizationActions', () => ({
  useOrganizationPageActions: (onDeleted: () => void) => mockUseOrganizationPageActions(onDeleted),
}));

vi.mock('../../../main/GatewayServices', () => ({
  useGatewayService: mockUseGatewayService,
}));

import { PlatformOrganizationPage } from './PlatformOrganizationPage';

const organization: PlatformOrganization = {
  id: 9,
  name: 'Org Nine',
  description: '',
  url: '',
  created: '',
  created_by: 1,
  modified: '',
  modified_by: 1,
  managed: false,
  related: { created_by: '', modified_by: '', teams: '' },
  summary_fields: {
    created_by: { id: 1, username: 'a', first_name: '', last_name: '' },
    modified_by: { id: 1, username: 'a', first_name: '', last_name: '' },
  },
};

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/access/organizations/9']}>
      <Routes>
        <Route path="/access/organizations/:id" element={<PlatformOrganizationPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('PlatformOrganizationPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseGatewayService.mockReturnValue(undefined);
  });

  it('shows error state with refresh', () => {
    const refresh = vi.fn();
    mockUseGetItem.mockReturnValue({ error: new Error('fail'), data: undefined, refresh });
    renderPage();
    expect(screen.getByTestId('awx-error')).toBeInTheDocument();
  });

  it('shows loading while organization is fetching', () => {
    mockUseGetItem.mockReturnValue({ error: undefined, data: undefined, refresh: vi.fn() });
    renderPage();
    expect(screen.getByTestId('loading-page')).toBeInTheDocument();
  });

  it('renders base tabs without controller service', () => {
    mockUseGetItem.mockReturnValue({ error: undefined, data: organization, refresh: vi.fn() });
    renderPage();
    expect(screen.getByTestId('page-title')).toHaveTextContent('Org Nine');
    expect(screen.getByText('Details')).toBeInTheDocument();
    expect(screen.getByText('Teams')).toBeInTheDocument();
    expect(screen.queryByText('Execution Environments')).not.toBeInTheDocument();
  });

  it('includes controller tabs when AWX service is registered', () => {
    mockUseGatewayService.mockReturnValue({ id: 'controller' });
    mockUseGetItem.mockReturnValue({ error: undefined, data: organization, refresh: vi.fn() });
    renderPage();
    expect(screen.getByText('Execution Environments')).toBeInTheDocument();
    expect(screen.getByText('Notifications')).toBeInTheDocument();
  });

  it('navigates to organizations list from delete callback', () => {
    let onDeleted: (() => void) | undefined;
    mockUseOrganizationPageActions.mockImplementation((cb: () => void) => {
      onDeleted = cb;
      return [];
    });
    mockUseGetItem.mockReturnValue({ error: undefined, data: organization, refresh: vi.fn() });

    renderPage();
    onDeleted?.();
    expect(mockPageNavigate).toHaveBeenCalledWith(PlatformRoute.Organizations);
  });
});
