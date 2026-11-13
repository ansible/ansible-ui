import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Authenticator } from '../../../interfaces/Authenticator';
import { AuthenticatorMap, AuthenticatorMapType } from '../../../interfaces/AuthenticatorMap';
import { PlatformRoute } from '../../../main/PlatformRoutes';

const { mockPageNavigate, mockUseGetItem, mockUseMappingPageActions } = vi.hoisted(() => ({
  mockPageNavigate: vi.fn(),
  mockUseGetItem: vi.fn(),
  mockUseMappingPageActions: vi.fn((_onDeleted: () => void): never[] => []),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual('@ansible/ansible-ui-framework');
  return {
    ...actual,
    useGetPageUrl: () => (route: string) => `/mock/${route}`,
    usePageNavigate: () => mockPageNavigate,
    PageActions: () => <div data-testid="page-actions">actions</div>,
  };
});

vi.mock('@ansible/common-ui/PageRoutedTabs', () => ({
  PageRoutedTabs: () => <div data-testid="routed-tabs">tabs</div>,
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

vi.mock('../hooks/useMappingActions', () => ({
  useMappingPageActions: (onDeleted: () => void) => mockUseMappingPageActions(onDeleted),
}));

import { PlatformAuthenticatorMappingPage } from './PlatformAuthenticatorMappingPage';

const mapping: AuthenticatorMap = {
  id: 5,
  name: 'Team mapping',
  url: '/maps/5/',
  authenticator: 3,
  map_type: AuthenticatorMapType.team,
  triggers: { always: {} },
  created: '',
  modified: '',
  related: {},
  organization: '',
  team: '1',
  role: '',
  order: 1,
  revoke: false,
  summary_fields: {} as AuthenticatorMap['summary_fields'],
};

const authenticator: Authenticator = {
  id: 3,
  name: 'LDAP Auth',
} as Authenticator;

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/authenticators/3/mappings/5']}>
      <Routes>
        <Route
          path="/authenticators/:id/mappings/:map_id"
          element={<PlatformAuthenticatorMappingPage />}
        />
      </Routes>
    </MemoryRouter>
  );
}

describe('PlatformAuthenticatorMappingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing while mapping is loading', () => {
    mockUseGetItem.mockReturnValue({ data: undefined });
    const { container } = renderPage();
    expect(container).toBeEmptyDOMElement();
  });

  it('renders mapping title and tabs when data is available', () => {
    mockUseGetItem.mockImplementation((_url: string, id: string | undefined) => {
      if (id === '5') return { data: mapping };
      return { data: authenticator };
    });

    renderPage();

    expect(screen.getByTestId('page-title')).toHaveTextContent('Team mapping');
    expect(screen.getByRole('link', { name: 'LDAP Auth' })).toBeInTheDocument();
    expect(screen.getByTestId('routed-tabs')).toBeInTheDocument();
    expect(mockUseMappingPageActions).toHaveBeenCalled();
  });

  it('navigates to mappings list when delete callback runs', () => {
    let onDeleted: (() => void) | undefined;
    mockUseMappingPageActions.mockImplementation((cb: () => void) => {
      onDeleted = cb;
      return [];
    });
    mockUseGetItem.mockImplementation((_url: string, id: string | undefined) => {
      if (id === '5') return { data: mapping };
      return { data: authenticator };
    });

    renderPage();
    onDeleted?.();
    expect(mockPageNavigate).toHaveBeenCalledWith(PlatformRoute.AuthenticatorMappings, {
      params: { id: '3' },
    });
  });
});
