import { ITableColumn } from '@ansible/ansible-ui-framework';
import { renderHook } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { UserAssignment } from '@ansible/common-ui/access/interfaces/UserAssignment';

const mockGetPageUrl = vi.fn(() => '/roles/1');
const mockGetDisplayName = vi.fn(() => 'Project');
const mockGetComponentNames = vi.fn(() => ['Automation Execution']);
const mockGetResourceEndpoint = vi.fn(() => '/resources/1/');
const mockUseGetItem = vi.fn(() => ({ data: { name: 'My Project' }, error: undefined }));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual('@ansible/ansible-ui-framework');
  return {
    ...actual,
    useGetPageUrl: () => mockGetPageUrl,
  };
});

vi.mock('@ansible/common-ui/access/hooks/useGetLinkToResourcePage', () => ({
  useGetLinkToResourcePage: () => () => '/resources/1/details',
}));

vi.mock('@ansible/common-ui/access/hooks/useMapContentTypeToDisplayName', () => ({
  useMapContentTypeToDisplayName: () => mockGetDisplayName,
}));

vi.mock('../../../hooks/useGetResourceEndpoint', () => ({
  useGetResourceEndpoint: () => mockGetResourceEndpoint(),
}));

vi.mock('../../roles/hooks/useContentTypeComponentNames', () => ({
  useContentTypeComponentNames: () => mockGetComponentNames,
}));

vi.mock('@ansible/common-ui/crud/useGet', () => ({
  useGetItem: () => mockUseGetItem(),
}));

import { usePlatformUserRolesColumns } from './usePlatformUserRolesColumns';

const assignment: UserAssignment = {
  id: 1,
  user: 1,
  object_id: '99',
  content_type: 'awx.project',
  role_definition: 10,
  summary_fields: {
    object_role: { id: 1 },
    role_definition: { id: 10, name: 'Project Admin', description: '', managed: false },
    content_object: { id: 99, name: 'My Project' },
    user: {
      id: 1,
      username: 'alice',
      email: 'alice@example.com',
      first_name: 'Alice',
      last_name: 'User',
    },
  },
};

describe('usePlatformUserRolesColumns', () => {
  test('returns expected column headers and value accessors', () => {
    const { result } = renderHook(() => usePlatformUserRolesColumns());
    const headers = result.current.map((column) => column.header);

    expect(headers).toEqual(['Resource name', 'Role', 'Type', 'Component']);

    const roleColumn = result.current[1] as ITableColumn<UserAssignment>;
    expect(typeof roleColumn.value).toBe('function');
    if (typeof roleColumn.value === 'function') {
      expect(roleColumn.value(assignment)).toBe('Project Admin');
    }
    if ('to' in roleColumn && typeof roleColumn.to === 'function') {
      expect(roleColumn.to(assignment)).toBe('/roles/1');
    }

    const typeColumn = result.current[2] as ITableColumn<UserAssignment>;
    if (typeof typeColumn.value === 'function') {
      expect(typeColumn.value(assignment)).toBe('Project');
    }
    expect(mockGetDisplayName).toHaveBeenCalledWith('awx.project', { isTitleCase: true });

    const componentColumn = result.current[3] as ITableColumn<UserAssignment>;
    if (typeof componentColumn.value === 'function') {
      expect(componentColumn.value(assignment)).toEqual(['Automation Execution']);
    }
  });

  test('honors disableLinks and disableSort options', () => {
    const { result } = renderHook(() =>
      usePlatformUserRolesColumns({ disableLinks: true, disableSort: true })
    );

    const roleColumn = result.current[1] as ITableColumn<UserAssignment>;
    expect(roleColumn.sort).toBeUndefined();
    if ('to' in roleColumn && typeof roleColumn.to === 'function') {
      expect(roleColumn.to(assignment)).toBeUndefined();
    }
  });
});
