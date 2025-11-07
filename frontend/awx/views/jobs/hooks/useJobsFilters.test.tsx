import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { awxAPI } from '../../../common/api/awx-utils';
import mockOptions from '@ansible/cypress/fixtures/mock_options.json';
import { useJobsFilters } from './useJobsFilters';

const server = setupServer(
  http.options(awxAPI`/unified_jobs/`, () => {
    return HttpResponse.json(mockOptions);
  })
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('useJobsFilters', () => {
  test('Returns expected number of filters', { timeout: 15000 }, async () => {
    const { result } = renderHook(() => useJobsFilters());

    await waitFor(
      () => {
        expect(result.current).toBeDefined();
        expect(result.current.length).toEqual(27);
      },
      { timeout: 10000 }
    );

    expect(result.current).toHaveLength(27);
  });
});
