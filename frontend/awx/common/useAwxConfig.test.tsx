import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { SWRConfig } from 'swr';
import { ReactNode } from 'react';
import { awxAPI } from './api/awx-utils';
import { AwxConfigProviderInternal, useAwxConfigState } from './useAwxConfig';

const mockConfig = {
  version: '4.5.0',
  license_info: {
    compliant: true,
    time_remaining: 1000000,
  },
};

const wrapper = ({ children }: { children: ReactNode }) => (
  <SWRConfig
    value={{
      dedupingInterval: 0,
      provider: () => new Map(),
      shouldRetryOnError: false,
    }}
  >
    <AwxConfigProviderInternal>{children}</AwxConfigProviderInternal>
  </SWRConfig>
);

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('useAwxConfig', () => {
  describe('serviceDown flag', () => {
    test('should set serviceDown to false when config loads successfully', async () => {
      server.use(
        http.get(awxAPI`/config/`, () => {
          return HttpResponse.json(mockConfig);
        })
      );

      const { result } = renderHook(() => useAwxConfigState(), { wrapper });

      await waitFor(() => {
        expect(result.current.awxConfig).toBeDefined();
      });

      expect(result.current.serviceDown).toBe(false);
      expect(result.current.awxConfigError).toBeUndefined();
    });

    test('should set serviceDown to true for 400 Bad Request error', async () => {
      server.use(
        http.get(awxAPI`/config/`, () => {
          return HttpResponse.json({ detail: 'Bad Request' }, { status: 400 });
        })
      );

      const { result } = renderHook(() => useAwxConfigState(), { wrapper });

      await waitFor(() => {
        expect(result.current.awxConfigError).toBeDefined();
      });

      expect(result.current.serviceDown).toBe(true);
    });

    test('should set serviceDown to true for 401 Unauthorized error', async () => {
      server.use(
        http.get(awxAPI`/config/`, () => {
          return HttpResponse.json({ detail: 'Unauthorized' }, { status: 401 });
        })
      );

      const { result } = renderHook(() => useAwxConfigState(), { wrapper });

      await waitFor(() => {
        expect(result.current.awxConfigError).toBeDefined();
      });

      expect(result.current.serviceDown).toBe(true);
    });

    test('should set serviceDown to true for 403 Forbidden error', async () => {
      server.use(
        http.get(awxAPI`/config/`, () => {
          return HttpResponse.json({ detail: 'Forbidden' }, { status: 403 });
        })
      );

      const { result } = renderHook(() => useAwxConfigState(), { wrapper });

      await waitFor(() => {
        expect(result.current.awxConfigError).toBeDefined();
      });

      expect(result.current.serviceDown).toBe(true);
    });

    test('should set serviceDown to true for 404 Not Found error', async () => {
      server.use(
        http.get(awxAPI`/config/`, () => {
          return HttpResponse.json({ detail: 'Not Found' }, { status: 404 });
        })
      );

      const { result } = renderHook(() => useAwxConfigState(), { wrapper });

      await waitFor(() => {
        expect(result.current.awxConfigError).toBeDefined();
      });

      expect(result.current.serviceDown).toBe(true);
    });

    test('should set serviceDown to true for 500 Internal Server Error', async () => {
      server.use(
        http.get(awxAPI`/config/`, () => {
          return HttpResponse.json({ detail: 'Internal Server Error' }, { status: 500 });
        })
      );

      const { result } = renderHook(() => useAwxConfigState(), { wrapper });

      await waitFor(() => {
        expect(result.current.awxConfigError).toBeDefined();
      });

      expect(result.current.serviceDown).toBe(true);
    });

    test('should set serviceDown to true for 502 Bad Gateway error', async () => {
      server.use(
        http.get(awxAPI`/config/`, () => {
          return HttpResponse.json({ detail: 'Bad Gateway' }, { status: 502 });
        })
      );

      const { result } = renderHook(() => useAwxConfigState(), { wrapper });

      await waitFor(() => {
        expect(result.current.awxConfigError).toBeDefined();
      });

      expect(result.current.serviceDown).toBe(true);
    });

    test('should set serviceDown to true for 503 Service Unavailable error', async () => {
      server.use(
        http.get(awxAPI`/config/`, () => {
          return HttpResponse.json({ detail: 'Service Unavailable' }, { status: 503 });
        })
      );

      const { result } = renderHook(() => useAwxConfigState(), { wrapper });

      await waitFor(() => {
        expect(result.current.awxConfigError).toBeDefined();
      });

      expect(result.current.serviceDown).toBe(true);
    });

    test('should set serviceDown to true for 504 Gateway Timeout error', async () => {
      server.use(
        http.get(awxAPI`/config/`, () => {
          return HttpResponse.json({ detail: 'Gateway Timeout' }, { status: 504 });
        })
      );

      const { result } = renderHook(() => useAwxConfigState(), { wrapper });

      await waitFor(() => {
        expect(result.current.awxConfigError).toBeDefined();
      });

      expect(result.current.serviceDown).toBe(true);
    });
  });
});
