import { renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import {
  useJobIdColumn,
  useJobStatusColumn,
  useJobTypeColumn,
  useJobDurationColumn,
} from './JobColumns';
import { awxAPI } from './api/awx-utils';

const server = setupServer(
  http.get(awxAPI`/inventory_sources/`, () =>
    HttpResponse.json({ actions: { GET: { source: { choices: [] } } } })
  )
);

function wrapper({ children }: { children: React.ReactNode }) {
  return <MemoryRouter>{children}</MemoryRouter>;
}

describe('JobColumns hooks', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  test('useJobIdColumn returns column with job id', () => {
    const { result } = renderHook(() => useJobIdColumn(), { wrapper });
    const column = result.current;
    expect(column.header).toBe('ID');
    expect('cell' in column).toBe(true);
  });

  test('useJobStatusColumn returns column with status cell', () => {
    const { result } = renderHook(() => useJobStatusColumn(), { wrapper });
    const column = result.current;
    expect(column.header).toBe('Status');
    expect('cell' in column).toBe(true);
  });

  test('useJobTypeColumn returns column with job type display', () => {
    const { result } = renderHook(() => useJobTypeColumn(), { wrapper });
    const column = result.current;
    expect(column.header).toBe('Type');
    expect('cell' in column).toBe(true);
  });

  test('useJobDurationColumn returns column with duration', () => {
    const { result } = renderHook(() => useJobDurationColumn(), { wrapper });
    const column = result.current;
    expect(column.header).toBe('Duration');
    expect('cell' in column).toBe(true);
  });
});
