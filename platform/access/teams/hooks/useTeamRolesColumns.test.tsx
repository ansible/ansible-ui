import { render, renderHook, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, test, vi, beforeEach } from 'vitest';
import { RequestError } from '@ansible/common-ui/crud/RequestError';
import { TeamAssignment } from '@ansible/common-ui/access/interfaces/TeamAssignment';
import { PlatformRoute } from '../../../main/PlatformRoutes';

const mockGetPageUrl = vi.fn(
  (route: string, ctx: { params: { id: number } }) => `/r/${route}/${ctx.params.id}`
);
const mockGetDisplayName = vi.fn(() => 'Display Type');
const mockGetComponentNames = vi.fn(() => ['comp-a']);

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

vi.mock('@ansible/common-ui/access/hooks/useMapContentTypeToDisplayName', () => ({
  useMapContentTypeToDisplayName: () => mockGetDisplayName,
}));

vi.mock('../../roles/hooks/useContentTypeComponentNames', () => ({
  useContentTypeComponentNames: () => mockGetComponentNames,
}));

const mockUseGetLinkToResourcePage = vi.fn(() => vi.fn(() => '/resource/url'));
vi.mock('@ansible/common-ui/access/hooks/useGetLinkToResourcePage', () => ({
  useGetLinkToResourcePage: (_namespace?: string) => mockUseGetLinkToResourcePage(),
}));

const mockUseGetItem = vi.fn();
vi.mock('@ansible/common-ui/crud/useGet', async () => {
  const actual = await vi.importActual('@ansible/common-ui/crud/useGet');
  return {
    ...actual,
    useGetItem: (...args: unknown[]) => mockUseGetItem(...args) as unknown,
  };
});

vi.mock('../../../hooks/useGetResourceEndpoint', () => ({
  useGetResourceEndpoint: () => '/api/gateway/v1/teams/',
}));

import { useAsyncQueryField, useTeamRolesColumns } from './useTeamRolesColumns';

const sampleAssignment: TeamAssignment = {
  id: 1,
  team: 9,
  object_id: '42',
  content_type: 'shared.team',
  role_definition: 100,
  summary_fields: {
    team: { id: 9, name: 'T' },
    object_role: { id: 1 },
    role_definition: {
      id: 100,
      name: 'Member',
      description: '',
      managed: false,
    },
    content_object: { name: 'Nested', id: 2 },
  },
};

describe('useAsyncQueryField', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('returns undefined when id is undefined', () => {
    mockUseGetItem.mockReturnValue({ data: { name: 'X' }, error: undefined });
    const { result } = renderHook(() =>
      useAsyncQueryField({ url: '/api/gateway/v1/teams/', id: undefined })
    );
    expect(result.current).toBeUndefined();
  });

  test('returns id as string when data is still loading', () => {
    mockUseGetItem.mockReturnValue({ data: undefined, error: undefined });
    const { result } = renderHook(() =>
      useAsyncQueryField({ url: '/api/gateway/v1/teams/', id: 7, field: 'name' })
    );
    expect(result.current).toBe('7');
  });

  test('returns string field from data when present', () => {
    mockUseGetItem.mockReturnValue({ data: { name: 'Resolved' }, error: undefined });
    const { result } = renderHook(() =>
      useAsyncQueryField({ url: '/api/gateway/v1/teams/', id: 7, field: 'name' })
    );
    expect(result.current).toBe('Resolved');
  });

  test('returns number field stringified', () => {
    mockUseGetItem.mockReturnValue({ data: { name: 99 }, error: undefined });
    const { result } = renderHook(() =>
      useAsyncQueryField({ url: '/api/gateway/v1/teams/', id: 7, field: 'name' })
    );
    expect(result.current).toBe('99');
  });

  test('returns id when field value is unexpected type', () => {
    mockUseGetItem.mockReturnValue({ data: { name: { nested: true } }, error: undefined });
    const { result } = renderHook(() =>
      useAsyncQueryField({ url: '/api/gateway/v1/teams/', id: 7, field: 'name' })
    );
    expect(result.current).toBe('7');
  });

  test('returns id string for 404 RequestError', () => {
    mockUseGetItem.mockReturnValue({
      data: undefined,
      error: new RequestError('Not Found', undefined, 404, {}, {}),
    });
    const { result } = renderHook(() =>
      useAsyncQueryField({ url: '/api/gateway/v1/teams/', id: 404 })
    );
    expect(result.current).toBe('404');
  });

  test('returns resourceName for 403 RequestError', () => {
    mockUseGetItem.mockReturnValue({
      data: undefined,
      error: new RequestError('Forbidden', undefined, 403, {}, {}),
    });
    const { result } = renderHook(() =>
      useAsyncQueryField({
        url: '/api/gateway/v1/teams/',
        id: 1,
        resourceName: 'Hidden',
      })
    );
    expect(result.current).toBe('Hidden');
  });

  test('returns message for other RequestError status', () => {
    mockUseGetItem.mockReturnValue({
      data: undefined,
      error: new RequestError('Server blew up', undefined, 500, {}, {}),
    });
    const { result } = renderHook(() =>
      useAsyncQueryField({ url: '/api/gateway/v1/teams/', id: 1 })
    );
    expect(result.current).toBe('Server blew up');
  });

  test('returns id when error is not RequestError', () => {
    mockUseGetItem.mockReturnValue({
      data: undefined,
      error: new Error('plain'),
    });
    const { result } = renderHook(() =>
      useAsyncQueryField({ url: '/api/gateway/v1/teams/', id: 55 })
    );
    expect(result.current).toBe('55');
  });
});

describe('useTeamRolesColumns', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseGetItem.mockReturnValue({ data: { name: 'CellName' }, error: undefined });
  });

  test('role column links to role details unless links disabled', () => {
    const { result } = renderHook(() => useTeamRolesColumns());
    const roleCol = result.current.find((c) => c.header === 'Role');
    expect(roleCol && 'to' in roleCol && typeof roleCol.to === 'function').toBe(true);
    if (roleCol && 'to' in roleCol && typeof roleCol.to === 'function') {
      expect(roleCol.to(sampleAssignment)).toBe(`/r/${PlatformRoute.RoleDetails}/100`);
    }

    const { result: noLinks } = renderHook(() => useTeamRolesColumns({ disableLinks: true }));
    const roleColNoLink = noLinks.current.find((c) => c.header === 'Role');
    if (roleColNoLink && 'to' in roleColNoLink && typeof roleColNoLink.to === 'function') {
      expect(roleColNoLink.to(sampleAssignment)).toBeUndefined();
    }
  });

  test('disables sort on Role and Type when requested', () => {
    const { result } = renderHook(() => useTeamRolesColumns({ disableSort: true }));
    const roleCol = result.current.find((c) => c.header === 'Role');
    const typeCol = result.current.find((c) => c.header === 'Type');
    expect(roleCol?.sort).toBeUndefined();
    expect(typeCol?.sort).toBeUndefined();
  });

  test('type and component columns use mappers', () => {
    const { result } = renderHook(() => useTeamRolesColumns());
    const typeCol = result.current.find((c) => c.header === 'Type');
    const compCol = result.current.find((c) => c.header === 'Component');

    expect(typeCol && 'value' in typeCol && typeCol.value?.(sampleAssignment)).toBe('Display Type');
    expect(mockGetDisplayName).toHaveBeenCalledWith('shared.team', { isTitleCase: true });

    expect(compCol && 'value' in compCol && compCol.value?.(sampleAssignment)).toEqual(['comp-a']);
    expect(mockGetComponentNames).toHaveBeenCalledWith('shared.team');
  });

  test('resource name cell renders link when name resolves from gateway', () => {
    mockUseGetItem.mockReturnValue({ data: { name: 'Linked team' }, error: undefined });
    const { result } = renderHook(() => useTeamRolesColumns());
    const resourceCol = result.current.find((c) => c.header === 'Resource name');
    expect(resourceCol && 'cell' in resourceCol && typeof resourceCol.cell === 'function').toBe(
      true
    );
    if (resourceCol && 'cell' in resourceCol && typeof resourceCol.cell === 'function') {
      render(<MemoryRouter>{resourceCol.cell(sampleAssignment)}</MemoryRouter>);
      const link = screen.getByRole('link', { name: 'Linked team' });
      expect(link).toHaveAttribute('href', '/resource/url');
    }
  });
});
