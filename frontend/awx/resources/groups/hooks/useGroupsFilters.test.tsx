import { buildQueryString, IView } from '@ansible/ansible-ui-framework';
import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { awxAPI } from '../../../common/api/awx-utils';
import { useGroupsFilters } from './useGroupsFilters';

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

describe('useGroupsFilters', () => {
  test('loads default group filters including search and group type', async () => {
    server.use(http.options(awxAPI`/groups/`, () => HttpResponse.json(mockGroupsOptions)));

    const { result } = renderHook(() => useGroupsFilters({}));

    await waitFor(() => {
      expect(result.current.length).toBeGreaterThan(0);
    });

    expect(result.current.find((f) => f.key === 'search')).toBeDefined();
    expect(result.current.find((f) => f.key === 'group')).toBeDefined();
    expect(result.current.find((f) => f.key === 'inventory')).toBeUndefined();
  });

  test('uses custom url and passes queryParams to filter keys', async () => {
    server.use(
      http.options(awxAPI`/inventories/1/hosts/`, () => HttpResponse.json(mockGroupsOptions))
    );

    const { result } = renderHook(() =>
      useGroupsFilters({
        url: 'inventories/1/hosts/',
        queryParams: { not__groups: '2' },
      })
    );

    await waitFor(() => {
      expect(result.current.length).toBeGreaterThan(0);
    });

    const nameFilter = result.current.find((f) => f.key === 'name');
    expect(nameFilter?.query).toBe('name');
  });

  test('builds query string with extra query params', async () => {
    server.use(http.options(awxAPI`/groups/`, () => HttpResponse.json(mockGroupsOptions)));

    const { result } = renderHook(() =>
      useGroupsFilters({
        queryParams: { not__groups: '5' },
      })
    );

    await waitFor(() => {
      expect(result.current.length).toBeGreaterThan(0);
    });

    const queryString = buildQueryString(
      {
        page: 1,
        perPage: 10,
        sort: 'name',
        sortDirection: 'asc',
        filterState: { name: ['web'] },
      } as unknown as IView,
      result.current,
      { not__groups: '5' }
    );

    expect(queryString).toContain('name=web');
    expect(queryString).toContain('not__groups=5');
  });
});
