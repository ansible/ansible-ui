import { renderHook, waitFor } from '@testing-library/react';
import { buildQueryString, IView } from '@ansible/ansible-ui-framework';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { awxAPI } from '../../../common/api/awx-utils';
import { useGroupsFilters } from '../../groups/hooks/useGroupsFilters';

const mockHostsOptions = {
  name: 'Host List',
  description: 'List of hosts',
  actions: {
    GET: {
      id: {
        type: 'integer',
        label: 'ID',
        filterable: true,
      },
      name: {
        type: 'string',
        label: 'Name',
        filterable: true,
      },
      description: {
        type: 'string',
        label: 'Description',
        filterable: true,
      },
    },
  },
};

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('HostSelectDialog API endpoint construction', () => {
  test('should generate correct query parameters for Name and Search filters', async () => {
    server.use(
      http.options(awxAPI`/inventories/1/hosts/`, () => {
        return HttpResponse.json(mockHostsOptions);
      })
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

    const nameFilter = result.current.find((filter) => filter.key === 'name');
    expect(nameFilter).toBeDefined();
    expect(nameFilter?.query).toBe('name');

    const searchFilter = result.current.find((filter) => filter.key === 'search');
    expect(searchFilter).toBeDefined();
    expect(searchFilter?.query).toBe('search');
  });

  test('should construct correct API endpoint with Name and Search filters in query string', async () => {
    server.use(
      http.options(awxAPI`/inventories/1/hosts/`, () => {
        return HttpResponse.json(mockHostsOptions);
      })
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

    const queryString = buildQueryString(
      {
        page: 1,
        perPage: 10,
        sort: 'name',
        sortDirection: 'asc',
        filterState: {
          name: ['test-host'],
          search: ['my-search'],
        },
      } as unknown as IView,
      result.current,
      { not__groups: '2' }
    );

    expect(queryString).toContain('name=test-host');
    expect(queryString).toContain('search=my-search');
    expect(queryString).toContain('not__groups=2');
  });
});
