import { renderHook } from '@testing-library/react';
import { describe, expect, test, vi, beforeEach } from 'vitest';
import { PlatformUser } from '../../../interfaces/PlatformUser';
import { PlatformRoute } from '../../../main/PlatformRoutes';

const mockGetPageUrl = vi.fn();

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual('@ansible/ansible-ui-framework');
  return {
    ...actual,
    useGetPageUrl: () => mockGetPageUrl,
  };
});

vi.mock('@ansible/common-ui/columns', () => ({
  useCreatedColumn: () => ({ id: 'created', header: 'Created' }),
  useModifiedColumn: () => ({ id: 'modified', header: 'Modified' }),
}));

import { useUsersColumns } from './useUserColumns';

function baseUser(overrides: Partial<PlatformUser> = {}): PlatformUser {
  return {
    id: 1,
    url: '/u/1',
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
    username: 'alice',
    last_login_map_results: [],
    managed: false,
    ...overrides,
  };
}

describe('useUsersColumns', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetPageUrl.mockImplementation(
      (route: string, ctx: { params: { id: number } }) => `/users/${route}/${ctx.params.id}`
    );
  });

  test('username cell links to user details when links enabled', () => {
    const { result } = renderHook(() => useUsersColumns());
    const usernameCol = result.current[0];
    expect(usernameCol.header).toBe('Username');
    const user = baseUser();
    const { cell } = usernameCol as unknown as {
      cell?: (row: PlatformUser) => unknown;
    };
    expect(cell?.(user)).toBeDefined();
    expect(mockGetPageUrl).toHaveBeenCalledWith(PlatformRoute.UserDetails, { params: { id: 1 } });
  });

  test('username cell omits link when disableLinks is true', () => {
    const { result } = renderHook(() => useUsersColumns({ disableLinks: true }));
    const usernameCol = result.current[0];
    const user = baseUser();
    const { cell } = usernameCol as unknown as {
      cell?: (row: PlatformUser) => unknown;
    };
    expect(cell?.(user)).toBeDefined();
    expect(mockGetPageUrl).not.toHaveBeenCalled();
  });

  test('user type column reflects role flags', () => {
    const { result } = renderHook(() => useUsersColumns());
    const typeCol = result.current.find((c) => c.header === 'User type');
    expect(typeCol && 'value' in typeCol && typeCol.value).toBeDefined();
    if (typeCol && 'value' in typeCol && typeCol.value) {
      expect(typeCol.value(baseUser({ is_superuser: true }))).toBe('System administrator');
      expect(typeCol.value(baseUser({ is_platform_auditor: true }))).toBe('Platform auditor');
      expect(typeCol.value(baseUser())).toBe('Normal user');
    }
  });

  test('email and name columns map fields from the user row', () => {
    const { result } = renderHook(() => useUsersColumns());
    const emailCol = result.current.find((c) => c.header === 'Email');
    const firstCol = result.current.find((c) => c.header === 'First name');
    const lastCol = result.current.find((c) => c.header === 'Last name');
    expect(
      emailCol &&
        'value' in emailCol &&
        firstCol &&
        'value' in firstCol &&
        lastCol &&
        'value' in lastCol
    ).toBe(true);
    if (
      emailCol &&
      'value' in emailCol &&
      emailCol.value &&
      firstCol &&
      'value' in firstCol &&
      firstCol.value &&
      lastCol &&
      'value' in lastCol &&
      lastCol.value
    ) {
      const row = baseUser({ email: 'a@b.c', first_name: 'Ann', last_name: 'Bee' });
      expect(emailCol.value(row)).toBe('a@b.c');
      expect(firstCol.value(row)).toBe('Ann');
      expect(lastCol.value(row)).toBe('Bee');
    }
  });

  test('last login column returns the timestamp when present', () => {
    const { result } = renderHook(() => useUsersColumns());
    const lastLoginCol = result.current.find((c) => c.header === 'Last login');
    expect(lastLoginCol && 'value' in lastLoginCol && lastLoginCol.value).toBeDefined();
    if (lastLoginCol && 'value' in lastLoginCol && lastLoginCol.value) {
      expect(lastLoginCol.value(baseUser({ last_login: '2024-06-01T12:00:00Z' }))).toBe(
        '2024-06-01T12:00:00Z'
      );
      expect(lastLoginCol.value(baseUser())).toBeUndefined();
    }
  });
});
