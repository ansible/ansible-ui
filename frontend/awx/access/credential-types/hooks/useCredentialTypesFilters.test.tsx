import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { awxAPI } from '../../../common/api/awx-utils';
import mockOptions from '@ansible/cypress/fixtures/mock_options.json';
import { useCredentialTypesFilters } from './useCredentialTypesFilters';

const server = setupServer(
  http.options(awxAPI`/credential_types/`, () => {
    return HttpResponse.json(mockOptions);
  })
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('useCredentialTypesFilters', () => {
  test('returns expected number of filters', { timeout: 15000 }, async () => {
    const { result } = renderHook(() => useCredentialTypesFilters());

    await waitFor(
      () => {
        expect(result.current).toBeDefined();
        expect(Array.isArray(result.current)).toBe(true);
        expect(result.current.length).toBeGreaterThan(0);
      },
      { timeout: 10000 }
    );

    expect(result.current).toHaveLength(27);
  });
});
