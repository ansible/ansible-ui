import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthenticatorTypeEnum, type Authenticator } from '../../../interfaces/Authenticator';
import type { PlatformOrganization } from '../../../interfaces/PlatformOrganization';
import { PlatformUser } from '../../../interfaces/PlatformUser';
import { gatewayAPI } from '../../../utils/gateway-api-utils';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, ctx?: Record<string, number>) =>
      ctx !== undefined && ctx.count !== undefined ? `${key}:${ctx.count}` : key,
  }),
}));

vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual('@ansible/ansible-ui-framework');
  return {
    ...actual,
    LoadingPage: () => <div data-testid="loading-page">loading</div>,
    PageDetails: ({ children }: Readonly<{ children: ReactNode }>) => (
      <div data-testid="page-details">{children}</div>
    ),
    PageDetailsFromColumns: ({
      children,
      columns,
      item,
    }: Readonly<{
      children?: ReactNode;
      columns: unknown;
      item?: PlatformUser;
    }>) => (
      <div
        data-testid="details-from-columns"
        data-user-id={item?.id}
        data-column-count={Array.isArray(columns) ? columns.length : 0}
      >
        {children}
      </div>
    ),
    PageDetail: ({ label, children }: Readonly<{ label: string; children: ReactNode }>) => (
      <div data-testid="page-detail">
        <span>{label}</span>
        {children}
      </div>
    ),
    LabelsCell: ({
      labelsWithLinks,
    }: Readonly<{ labelsWithLinks?: { name: string; link: string }[] }>) => (
      <div data-testid="labels-cell">{labelsWithLinks?.map((l) => l.name).join(',')}</div>
    ),
    useGetPageUrl: () => (route: string, opts?: { params: { id: number } }) =>
      `/mock/${route}/${opts?.params?.id ?? ''}`,
  };
});

vi.mock('../hooks/useUserColumns', () => ({
  useUsersColumns: () => [{ id: 'username', header: 'Username' }],
}));

vi.mock('../../authenticators/hooks/useReadableAuthenticatorTypes', () => ({
  useReadableAuthenticatorTypes: () => ['Local'],
}));

const { mockUseGetItem, mockUseGet } = vi.hoisted(() => ({
  mockUseGetItem: vi.fn(),
  mockUseGet: vi.fn(),
}));

vi.mock('@ansible/common-ui/crud/useGet', async () => {
  const actual = await vi.importActual<typeof import('@ansible/common-ui/crud/useGet')>(
    '@ansible/common-ui/crud/useGet'
  );
  return {
    ...actual,
    useGetItem: mockUseGetItem as typeof actual.useGetItem,
    useGet: mockUseGet as typeof actual.useGet,
  };
});

import { PlatformUserDetails } from './PlatformUserDetails';

function makeUser(overrides: Partial<PlatformUser> = {}): PlatformUser {
  return {
    id: 3,
    url: `${gatewayAPI`/users/`}3/`,
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
    username: 'pat',
    last_login_map_results: [],
    managed: false,
    ...overrides,
  };
}

const northOrg: PlatformOrganization = {
  id: 10,
  name: 'NorthOrg',
  description: '',
  url: '',
  created: '',
  created_by: 1,
  modified: '',
  modified_by: 1,
  related: { created_by: '', modified_by: '', teams: '' },
  summary_fields: {
    resource: { ansible_id: 'o', resource_type: 'organization' },
    created_by: { id: 1, username: 'a', first_name: '', last_name: '' },
    modified_by: { id: 1, username: 'a', first_name: '', last_name: '' },
  },
  managed: false,
};

function makeAuthenticator(id: number): Authenticator {
  const u = makeUser({ id: 1 });
  return {
    id,
    name: 'auth1',
    type: AuthenticatorTypeEnum.Local,
    url: '',
    created: '',
    modified: '',
    related: {},
    enabled: true,
    create_objects: false,
    remove_users: false,
    configuration: {},
    order: 0,
    slug: 'local',
    auto_migrate_users_to: null,
    summary_fields: {
      auto_migrate_users_to: { name: '', id: 0 },
      created_by: u,
      modified_by: u,
    },
  };
}

function renderDetails(userId = '3') {
  return render(
    <MemoryRouter initialEntries={[`/platform/users/${userId}/details`]}>
      <Routes>
        <Route path="/platform/users/:id/details" element={<PlatformUserDetails />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('PlatformUserDetails', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseGetItem.mockReturnValue({ data: undefined, isLoading: true });
    mockUseGet.mockReturnValue({ data: undefined, isLoading: true });
  });

  it('shows loading while gateway user or related lists are loading', () => {
    mockUseGetItem.mockReturnValue({ data: makeUser(), isLoading: false });
    mockUseGet.mockReturnValue({ data: undefined, isLoading: true });
    renderDetails();
    expect(screen.getByTestId('loading-page')).toBeInTheDocument();
  });

  it('renders organization and authentication sections for a normal user', () => {
    mockUseGetItem.mockReturnValue({
      data: makeUser({ is_superuser: false }),
      isLoading: false,
    });
    mockUseGet.mockImplementation((url: string | undefined) => {
      if (url?.includes('/organizations/')) {
        return {
          data: { count: 1, results: [northOrg] },
          isLoading: false,
        };
      }
      if (url?.includes('/authenticators/')) {
        return {
          data: { count: 1, results: [makeAuthenticator(5)] },
          isLoading: false,
        };
      }
      return { data: undefined, isLoading: false };
    });

    renderDetails();

    expect(screen.getByTestId('details-from-columns')).toHaveAttribute('data-user-id', '3');
    expect(screen.getByText(/Organization:1/)).toBeInTheDocument();
    expect(screen.getByText('NorthOrg')).toBeInTheDocument();
    expect(screen.getByText(/Authentication method:1/)).toBeInTheDocument();
    expect(screen.getByText('Local')).toBeInTheDocument();
  });

  it('does not render organization section for superusers', () => {
    mockUseGetItem.mockReturnValue({
      data: makeUser({ is_superuser: true }),
      isLoading: false,
    });
    mockUseGet.mockImplementation((url: string | undefined) => {
      if (url?.includes('/organizations/')) {
        return {
          data: { count: 1, results: [northOrg] },
          isLoading: false,
        };
      }
      if (url?.includes('/authenticators/')) {
        return { data: { count: 0, results: [] }, isLoading: false };
      }
      return { data: undefined, isLoading: false };
    });

    renderDetails();

    expect(screen.queryByText(/Organization/)).not.toBeInTheDocument();
  });
});
