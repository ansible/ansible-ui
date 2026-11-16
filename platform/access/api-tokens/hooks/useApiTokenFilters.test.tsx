import { ToolbarFilterType } from '@ansible/ansible-ui-framework';
import { render, renderHook, screen } from '@testing-library/react';
import type { ReactElement } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import { useApiTokensFilters } from './useApiTokenFilters';

const mockQueryUsers = vi.fn();
const mockQueryApplications = vi.fn();

vi.mock('../../../common/useQueryPlatformOptions', () => ({
  useQueryPlatformOptions: vi.fn((config: { url: string }) => {
    if (String(config.url).includes('users')) {
      return mockQueryUsers;
    }
    return mockQueryApplications;
  }),
}));

vi.mock('@ansible/common-ui/AsyncQueryLabel', () => ({
  AsyncQueryLabel: ({ id, url, field }: { id: string; url: string; field?: string }) => (
    <span
      data-testid="async-query-label"
      data-id={id}
      data-url={String(url)}
      data-field={field ?? ''}
    />
  ),
}));

describe('useApiTokensFilters', () => {
  it('exposes description, user, scope, and application filters', () => {
    const { result } = renderHook(() => useApiTokensFilters());

    expect(result.current.map((filter) => filter.key)).toEqual([
      'description',
      'user',
      'scope',
      'application',
    ]);
  });

  it('configures description filter for icontains search', () => {
    const { result } = renderHook(() => useApiTokensFilters());
    const descriptionFilter = result.current.find((filter) => filter.key === 'description');

    expect(descriptionFilter).toMatchObject({
      label: 'Description',
      type: ToolbarFilterType.SingleText,
      placeholder: 'Filter by description',
      comparison: 'contains',
      query: 'description__icontains',
    });
  });

  it.each([
    ['user', 'user', ToolbarFilterType.AsyncMultiSelect, 'Filter by user'],
    ['application', 'application', ToolbarFilterType.AsyncMultiSelect, 'Filter by application'],
  ])('configures %s async multi-select filter', (key, query, type, placeholder) => {
    const { result } = renderHook(() => useApiTokensFilters());
    const filter = result.current.find((item) => item.key === key);

    expect(filter).toMatchObject({
      label: key === 'user' ? 'User' : 'Application',
      type,
      placeholder,
      query,
    });
  });

  it.each([
    ['read', 'Read'],
    ['write', 'Write'],
  ])('scope filter includes %s option', (value, label) => {
    const { result } = renderHook(() => useApiTokensFilters());
    const scopeFilter = result.current.find((filter) => filter.key === 'scope');

    if (!scopeFilter || !('options' in scopeFilter)) {
      throw new Error('expected scope multi-select filter');
    }

    expect(scopeFilter.type).toBe(ToolbarFilterType.MultiSelect);
    expect(scopeFilter.query).toBe('scope__in');
    expect(scopeFilter.options).toEqual(expect.arrayContaining([{ label, value }]));
  });

  it('wires async filters to query platform option loaders', () => {
    const { result } = renderHook(() => useApiTokensFilters());

    const userFilter = result.current.find((filter) => filter.key === 'user');
    const applicationFilter = result.current.find((filter) => filter.key === 'application');
    if (!userFilter || !('queryOptions' in userFilter)) {
      throw new Error('expected user async filter');
    }
    if (!applicationFilter || !('queryOptions' in applicationFilter)) {
      throw new Error('expected application async filter');
    }

    expect(userFilter.queryOptions).toBe(mockQueryUsers);
    expect(applicationFilter.queryOptions).toBe(mockQueryApplications);
  });

  it.each([
    ['user', '42', gatewayAPI`/users/`, 'username'],
    ['application', '9', gatewayAPI`/applications/`, ''],
  ] as const)('renders %s queryLabel with AsyncQueryLabel', (key, id, url, field) => {
    const { result } = renderHook(() => useApiTokensFilters());
    const filter = result.current.find((item) => item.key === key);
    if (!filter || !('queryLabel' in filter) || !filter.queryLabel) {
      throw new Error(`expected async filter ${key}`);
    }
    const label = filter.queryLabel(id);

    render(label as ReactElement);

    const node = screen.getByTestId('async-query-label');
    expect(node).toHaveAttribute('data-id', id);
    expect(node.getAttribute('data-url')).toContain(String(url));
    expect(node).toHaveAttribute('data-field', field);
  });
});
