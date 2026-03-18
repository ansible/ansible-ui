import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { awxAPI } from '../../../common/api/awx-utils';
import { useCredentialTypesFilters } from './useCredentialTypesFilters';

// Mock OPTIONS response for credential types filters
const mockOptions = {
  actions: {
    GET: {
      id: { type: 'integer', label: 'ID', filterable: true },
      name: { type: 'string', label: 'Name', filterable: true },
      description: { type: 'string', label: 'Description', filterable: true },
      kind: { type: 'choice', label: 'Kind', filterable: true, choices: [] },
      namespace: { type: 'string', label: 'Namespace', filterable: true },
      managed: { type: 'boolean', label: 'Managed', filterable: true },
      created: { type: 'datetime', label: 'Created', filterable: true },
      modified: { type: 'datetime', label: 'Modified', filterable: true },
      organization: { type: 'integer', label: 'Organization', filterable: true },
      type: { type: 'choice', label: 'Type', filterable: true, choices: [] },
      url: { type: 'string', label: 'URL', filterable: false },
      related: { type: 'object', label: 'Related', filterable: false },
      summary_fields: { type: 'object', label: 'Summary fields', filterable: false },
      created_by: { type: 'field', label: 'Created by', filterable: true },
      modified_by: { type: 'field', label: 'Modified by', filterable: true },
      injectors: { type: 'field', label: 'Injectors', filterable: false },
      inputs: { type: 'field', label: 'Inputs', filterable: false },
    },
  },
  search_fields: ['name', 'description'],
  related_search_fields: ['organization__search', 'created_by__search', 'modified_by__search'],
};

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

    // 12 filterable fields from API + 3 additional filters (search, created-by, modified-by) = 15 total
    expect(result.current).toHaveLength(15);
  });
});
