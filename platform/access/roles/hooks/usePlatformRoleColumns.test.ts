import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { usePlatformRoleColumns } from './usePlatformRoleColumns';
import { PlatformRole } from '@ansible/platform-ui/interfaces/PlatformRole';

vi.mock('@ansible/common-ui/columns', () => ({
  useCreatedColumn: () => ({ id: 'created', header: 'Created' }),
  useModifiedColumn: () => ({ id: 'modified', header: 'Modified' }),
  useNameColumn: () => ({ id: 'name', header: 'Name' }),
}));

const server = setupServer(
  http.get('*/service-index/role-permissions/*', () => {
    return HttpResponse.json({
      results: [
        {
          api_slug: 'awx.change_executionenvironment',
          codename: 'change_executionenvironment',
          name: 'API name for change EE',
        },
        {
          api_slug: 'awx.delete_executionenvironment',
          codename: 'delete_executionenvironment',
          name: 'API name for delete EE',
        },
        {
          api_slug: 'awx.add_executionenvironment',
          codename: 'add_executionenvironment',
          name: 'Can add execution environment',
        },
      ],
    });
  })
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function makeRole(permissions: string[]): PlatformRole {
  return {
    id: 1,
    url: '',
    related: { team_assignments: '', user_assignments: '' },
    summary_fields: {},
    permissions,
    content_type: 'awx.executionenvironment',
    created: '',
    modified: '',
    name: 'Test Role',
    description: '',
    managed: false,
    created_by: null,
    modified_by: null,
  };
}

function getPermissionsColumnValue(columns: ReturnType<typeof usePlatformRoleColumns>) {
  const permissionsColumn = columns.find((col) => col.header === 'Permissions');
  if (!permissionsColumn?.value) {
    throw new Error('Permissions column not found');
  }
  return permissionsColumn.value;
}

describe('usePlatformRoleColumns - permission display names', () => {
  it('should prefer metadata label over API name', async () => {
    const { result } = renderHook(() => usePlatformRoleColumns());

    await waitFor(() => {
      const getValue = getPermissionsColumnValue(result.current);
      const role = makeRole(['awx.change_executionenvironment']);
      // Metadata label: "Can change execution environment"
      // API name: "API name for change EE"
      // Metadata should win
      expect(getValue(role)).toEqual(['Can change execution environment']);
    });
  });

  it('should fall back to API name when not in metadata', async () => {
    const { result } = renderHook(() => usePlatformRoleColumns());

    await waitFor(() => {
      const getValue = getPermissionsColumnValue(result.current);
      const role = makeRole(['awx.add_executionenvironment']);
      // Not in metadata, but in API response
      expect(getValue(role)).toEqual(['Can add execution environment']);
    });
  });

  it('should fall back to raw permission code when not in metadata or API', async () => {
    const { result } = renderHook(() => usePlatformRoleColumns());

    await waitFor(() => {
      const getValue = getPermissionsColumnValue(result.current);
      const role = makeRole(['awx.unknown_permission']);
      expect(getValue(role)).toEqual(['awx.unknown_permission']);
    });
  });

  it('should resolve mixed permissions through the correct fallback chain', async () => {
    const { result } = renderHook(() => usePlatformRoleColumns());

    await waitFor(() => {
      const getValue = getPermissionsColumnValue(result.current);
      const role = makeRole([
        'awx.change_executionenvironment', // metadata hit
        'awx.add_executionenvironment', // API-only hit
        'awx.unknown_permission', // raw fallback
      ]);
      expect(getValue(role)).toEqual([
        'Can change execution environment', // from metadata
        'Can add execution environment', // from API
        'awx.unknown_permission', // raw code
      ]);
    });
  });
});
