import { ColumnModalOption, ColumnTableOption } from '@ansible/ansible-ui-framework';
import { renderHook } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { awxAPI } from '../../../common/api/awx-utils';
import { UnifiedJob } from '../../../interfaces/UnifiedJob';
import { useJobsColumns } from './useJobsColumns';

const server = setupServer(
  http.options(awxAPI`/inventory_sources/`, () =>
    HttpResponse.json({ actions: { GET: { source: { choices: [] } } } })
  )
);

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>{children}</MemoryRouter>
);

const jobWithOrganization = {
  summary_fields: {
    organization: { id: 7, name: 'Engineering', description: '' },
  },
} as UnifiedJob;

const jobWithoutOrganization = {
  summary_fields: {},
} as UnifiedJob;

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('useJobsColumns', () => {
  test('includes Organization as a configurable table column', () => {
    const { result } = renderHook(() => useJobsColumns(), { wrapper });

    const headers = result.current.map((column) => column.header);
    const organizationIndex = headers.indexOf('Organization');
    expect(organizationIndex).toBe(headers.indexOf('Inventory') + 1);
    expect(organizationIndex).toBeLessThan(headers.indexOf('Project'));

    const organizationColumn = result.current.find((column) => column.header === 'Organization');
    expect(organizationColumn).toMatchObject({
      table: ColumnTableOption.expanded,
      list: 'hidden',
      card: 'hidden',
      modal: ColumnModalOption.hidden,
      sort: 'organization',
    });
    expect(organizationColumn?.value?.(jobWithOrganization)).toBe('Engineering');
  });

  test('returns no organization value when a job has no organization', () => {
    const { result } = renderHook(() => useJobsColumns(), { wrapper });
    const organizationColumn = result.current.find((column) => column.header === 'Organization');

    expect(organizationColumn?.value?.(jobWithoutOrganization)).toBeUndefined();
  });
});
