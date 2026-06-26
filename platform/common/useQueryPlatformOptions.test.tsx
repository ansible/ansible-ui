import { renderHook, waitFor } from '@testing-library/react';
import { describe, test, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { gatewayAPI } from '../utils/gateway-api-utils';
import { useQueryPlatformOptions } from './useQueryPlatformOptions';

const multiItemResponse = {
  count: 20,
  results: [
    { id: 10, username: 'testuser09' },
    { id: 11, username: 'testuser10' },
  ],
};

const mockResponse = {
  count: 1,
  next: null,
  previous: null,
  results: [{ id: 1, name: 'Test Item' }],
};

describe('useQueryPlatformOptions - URL Encoding', () => {
  let capturedUrl = '';

  const server = setupServer(
    http.get(gatewayAPI`/test-endpoint/`, ({ request }) => {
      capturedUrl = request.url;
      return HttpResponse.json(mockResponse);
    })
  );

  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterAll(() => server.close());

  beforeEach(() => {
    capturedUrl = '';
    server.resetHandlers();
  });

  test('should encode template string correctly', async () => {
    const { result } = renderHook(() =>
      useQueryPlatformOptions<{ id: number; name: string }, 'name', 'id'>({
        url: gatewayAPI`/test-endpoint/`,
        labelKey: 'name',
        valueKey: 'id',
        orderQuery: 'order_by',
      })
    );

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

describe('useQueryPlatformOptions - pagination and value types', () => {
  let capturedUrl = '';

  const server = setupServer(
    http.get(gatewayAPI`/test-endpoint/`, ({ request }) => {
      capturedUrl = request.url;
      return HttpResponse.json(multiItemResponse);
    })
  );

  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterAll(() => server.close());
  beforeEach(() => {
    capturedUrl = '';
    server.resetHandlers();
  });

  function setupHook() {
    return renderHook(() =>
      useQueryPlatformOptions<{ id: number; username: string }, 'username', 'id'>({
        url: gatewayAPI`/test-endpoint/`,
        labelKey: 'username',
        valueKey: 'id',
        orderQuery: 'order_by',
      })
    );
  }

  test('should use cursor pagination (username__gt) on next page load', async () => {
    const { result } = setupHook();
    await result.current({ next: 'testuser09', signal: new AbortController().signal });

    await waitFor(() => {
      expect(capturedUrl).toContain('username__gt=testuser09');
      expect(capturedUrl).not.toMatch(/order_by=testuser09/);
      expect(capturedUrl).toContain('order_by=username');
    });
  });

  test('should return option values as strings even when valueKey holds a number', async () => {
    const { result } = setupHook();
    const queryResult = await result.current({ signal: new AbortController().signal });

    expect(typeof queryResult.options[0].value).toBe('string');
    expect(queryResult.options[0].value).toBe('10');
  });
});
