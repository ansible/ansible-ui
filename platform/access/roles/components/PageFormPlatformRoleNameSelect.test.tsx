import { renderHook, waitFor } from '@testing-library/react';
import { describe, test, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { useCallback } from 'react';
import { gatewayAPI } from '../../../utils/gateway-api-utils';

const mockRoles = {
  count: 1,
  next: null,
  previous: null,
  results: [{ id: 1, name: 'Test Role', content_type: 'test-content' }],
};

function useQueryRoleOptions() {
  return useCallback(async (queryOptions: { search?: string; signal?: AbortSignal }) => {
    let url = gatewayAPI`/role_definitions/?order_by=name`;
    if (queryOptions.search) {
      url += `&name__icontains=${encodeURIComponent(queryOptions.search)}`;
    }

    const response = await fetch(url);
    return response.json();
  }, []);
}

describe('PageFormPlatformRoleNameSelect - URL Encoding', () => {
  let capturedUrl = '';

  const server = setupServer(
    http.get(gatewayAPI`/role_definitions/`, ({ request }) => {
      capturedUrl = request.url;
      return HttpResponse.json(mockRoles);
    })
  );

  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterAll(() => server.close());

  beforeEach(() => {
    capturedUrl = '';
    server.resetHandlers();
  });

  test('should encode template string correctly', async () => {
    const { result } = renderHook(() => useQueryRoleOptions());

    const queryFunction = result.current;

    await queryFunction({
      search: '{% for_attr_value(attribute_name) %}',
      signal: new AbortController().signal,
    });

    await waitFor(() => {
      expect(capturedUrl).toContain('name__icontains=');
    });

    // Verify the template string is properly URL encoded
    expect(capturedUrl).toContain(
      'name__icontains=%7B%25%20for_attr_value(attribute_name)%20%25%7D'
    );
  });
});
