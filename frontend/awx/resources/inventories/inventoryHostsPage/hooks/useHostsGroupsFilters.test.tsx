import { buildQueryString, IView } from '@ansible/ansible-ui-framework';
import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { awxAPI } from '../../../../common/api/awx-utils';
import { useHostsGroupsFilters } from './useHostsGroupsFilters';

const mockGroupsOptions = {
  name: 'Group List',
  actions: {
    GET: {
      id: { type: 'integer', label: 'ID', filterable: true },
      name: { type: 'string', label: 'Name', filterable: true },
      description: { type: 'string', label: 'Description', filterable: true },
    },
  },
};

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('useHostsGroupsFilters', () => {
  test('loads dynamic filters for default groups endpoint', async () => {
    server.use(http.options(awxAPI`/groups/`, () => HttpResponse.json(mockGroupsOptions)));

    const { result } = renderHook(() => useHostsGroupsFilters());

    await waitFor(() => {
      expect(result.current.length).toBeGreaterThan(0);
    });

    expect(result.current.find((f) => f.key === 'search')).toBeDefined();
    expect(result.current.find((f) => f.key === 'name')).toBeDefined();
  });

  test('uses custom url for options path', async () => {
    server.use(http.options(awxAPI`/hosts/5/groups/`, () => HttpResponse.json(mockGroupsOptions)));

    const { result } = renderHook(() => useHostsGroupsFilters('hosts/5/groups/'));

    await waitFor(() => {
      expect(result.current.length).toBeGreaterThan(0);
    });

    const nameFilter = result.current.find((f) => f.key === 'name');
    expect(nameFilter?.query).toBe('name');
  });

  test('builds query string from filter state', async () => {
    server.use(http.options(awxAPI`/groups/`, () => HttpResponse.json(mockGroupsOptions)));

    const { result } = renderHook(() => useHostsGroupsFilters());

    await waitFor(() => {
      expect(result.current.length).toBeGreaterThan(0);
    });

    const queryString = buildQueryString(
      {
        page: 1,
        perPage: 10,
        sort: 'name',
        sortDirection: 'asc',
        filterState: { name: ['web'], search: ['prod'] },
      } as unknown as IView,
      result.current,
      {}
    );

    expect(queryString).toContain('name=web');
    expect(queryString).toContain('search=prod');
  });
});
