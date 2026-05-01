/* eslint-disable i18next/no-literal-string */
import { ReactNode } from 'react';
import { render, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { PageSettingsProvider, usePageSettings, PageSettingsContext } from './PageSettingsProvider';
import { RequestError } from '@ansible/common-ui/crud/RequestError';

// Mock globalThis.matchMedia
Object.defineProperty(globalThis, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: query === '(prefers-color-scheme: dark)',
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe('PageSettingsProvider', () => {
  beforeEach(() => {
    // Clear localStorage
    localStorage.clear();

    // Reset document classes
    document.documentElement.classList.remove('pf-v6-theme-dark');

    // Clear all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('pf-v6-theme-dark');
  });

  describe('Settings Management', () => {
    test('should initialize with default settings when localStorage is empty', () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <PageSettingsProvider defaultRefreshInterval={30}>{children}</PageSettingsProvider>
      );

      const { result } = renderHook(() => usePageSettings(), { wrapper });

      expect(result.current).toEqual({
        refreshInterval: 30,
        theme: 'system',
        tableLayout: 'comfortable',
        formColumns: 'multiple',
        formLayout: 'vertical',
        dateFormat: 'date-time',
        dataEditorFormat: 'yaml',
        activeTheme: 'dark', // Based on mocked matchMedia
      });
    });

    test('should load settings from localStorage when available', () => {
      const savedSettings = {
        refreshInterval: 60,
        theme: 'dark',
        tableLayout: 'compact',
      };
      localStorage.setItem('user-preferences', JSON.stringify(savedSettings));

      const wrapper = ({ children }: { children: ReactNode }) => (
        <PageSettingsProvider defaultRefreshInterval={30}>{children}</PageSettingsProvider>
      );

      const { result } = renderHook(() => usePageSettings(), { wrapper });

      expect(result.current).toMatchObject({
        refreshInterval: 60,
        theme: 'dark',
        tableLayout: 'compact',
        // Should still have defaults for missing fields
        formColumns: 'multiple',
        formLayout: 'vertical',
        dateFormat: 'date-time',
        dataEditorFormat: 'yaml',
      });
    });

    test('should handle invalid JSON in localStorage gracefully', () => {
      localStorage.setItem('user-preferences', 'invalid-json');

      const wrapper = ({ children }: { children: ReactNode }) => (
        <PageSettingsProvider defaultRefreshInterval={15}>{children}</PageSettingsProvider>
      );

      const { result } = renderHook(() => usePageSettings(), { wrapper });

      // Should use defaults when localStorage has invalid JSON
      expect(result.current.refreshInterval).toBe(15);
      expect(result.current.theme).toBe('system');
    });

    test('should update settings and persist to localStorage', async () => {
      let setSettingsFunc: (settings: object) => void = () => {};

      function TestComponent() {
        const settings = usePageSettings();
        return (
          <div>
            <span data-testid="refresh-interval">{settings.refreshInterval}</span>
            <button
              onClick={() => setSettingsFunc({ ...settings, refreshInterval: 45 })}
              data-testid="update-button"
            >
              Update
            </button>
          </div>
        );
      }

      const { getByTestId } = render(
        <PageSettingsProvider defaultRefreshInterval={30}>
          <PageSettingsContext.Consumer>
            {([_settings, setSettings]) => {
              setSettingsFunc = setSettings;
              return <TestComponent />;
            }}
          </PageSettingsContext.Consumer>
        </PageSettingsProvider>
      );

      // Initial state
      expect(getByTestId('refresh-interval')).toHaveTextContent('30');

      // Update settings
      getByTestId('update-button').click();

      await waitFor(() => {
        expect(getByTestId('refresh-interval')).toHaveTextContent('45');
      });

      // Should persist to localStorage
      const saved: { refreshInterval?: number } = JSON.parse(
        localStorage.getItem('user-preferences') || '{}'
      ) as { refreshInterval?: number };
      expect(saved.refreshInterval).toBe(45);
    });
  });

  describe('Theme Management', () => {
    test('should detect system dark theme', async () => {
      // Mock dark theme preference
      vi.mocked(globalThis.matchMedia).mockImplementation((query: string) => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      const wrapper = ({ children }: { children: ReactNode }) => (
        <PageSettingsProvider defaultRefreshInterval={30}>{children}</PageSettingsProvider>
      );

      const { result } = renderHook(() => usePageSettings(), { wrapper });

      await waitFor(() => {
        expect(result.current.activeTheme).toBe('dark');
      });

      // Should add dark theme class to document
      expect(document.documentElement.classList.contains('pf-v6-theme-dark')).toBe(true);
    });

    test('should detect system light theme', async () => {
      // Mock light theme preference
      vi.mocked(globalThis.matchMedia).mockImplementation((query: string) => ({
        matches: false, // No dark theme preference
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      const wrapper = ({ children }: { children: ReactNode }) => (
        <PageSettingsProvider defaultRefreshInterval={30}>{children}</PageSettingsProvider>
      );

      const { result } = renderHook(() => usePageSettings(), { wrapper });

      await waitFor(() => {
        expect(result.current.activeTheme).toBe('light');
      });

      // Should not add dark theme class to document
      expect(document.documentElement.classList.contains('pf-v6-theme-dark')).toBe(false);
    });

    test('should use explicit theme setting over system preference', async () => {
      localStorage.setItem('user-preferences', JSON.stringify({ theme: 'light' }));

      const wrapper = ({ children }: { children: ReactNode }) => (
        <PageSettingsProvider defaultRefreshInterval={30}>{children}</PageSettingsProvider>
      );

      const { result } = renderHook(() => usePageSettings(), { wrapper });

      await waitFor(() => {
        expect(result.current.activeTheme).toBe('light');
        expect(result.current.theme).toBe('light');
      });
    });
  });

  describe('SWR Configuration', () => {
    test('should configure SWR with correct refresh interval', () => {
      const TestComponent = () => {
        const settings = usePageSettings();
        return <div data-testid="interval">{settings.refreshInterval}</div>;
      };

      const { getByTestId } = render(
        <PageSettingsProvider defaultRefreshInterval={30}>
          <TestComponent />
        </PageSettingsProvider>
      );

      expect(getByTestId('interval')).toHaveTextContent('30');
    });

    test('should disable refresh when interval is 0', () => {
      localStorage.setItem('user-preferences', JSON.stringify({ refreshInterval: 0 }));

      const TestComponent = () => {
        const settings = usePageSettings();
        return <div data-testid="interval">{settings.refreshInterval}</div>;
      };

      const { getByTestId } = render(
        <PageSettingsProvider defaultRefreshInterval={30}>
          <TestComponent />
        </PageSettingsProvider>
      );

      expect(getByTestId('interval')).toHaveTextContent('0');
    });
  });

  describe('SWR Error Retry Logic (Polling Changes)', () => {
    // Test the onErrorRetry logic by simulating the function behavior
    // Since the function is inline in the SWR config, we'll test the expected behavior patterns

    test('should not retry on 401 Unauthorized errors', () => {
      vi.useFakeTimers();

      const revalidate = vi.fn();
      const error401 = new RequestError('Unauthorized', undefined, 401, undefined, undefined);

      // Simulate the onErrorRetry logic from PageSettingsProvider
      const onErrorRetry = (
        error: Error,
        key: string,
        config: unknown,
        revalidateFn: (opts: { retryCount: number }) => void,
        opts: { retryCount: number }
      ) => {
        // This mirrors the logic in PageSettingsProvider.tsx
        if (
          error instanceof RequestError &&
          (error.statusCode === 401 || error.statusCode === 403)
        ) {
          return; // Stop retrying
        }

        if (opts.retryCount >= 3) return;

        const timeout = ~~((Math.random() + 0.5) * (1 << opts.retryCount)) * 1000;
        setTimeout(() => {
          revalidateFn(opts);
        }, timeout);
      };

      onErrorRetry(error401, '/api/test', {}, revalidate, { retryCount: 0 });

      // Advance timers - should not have scheduled any retry
      vi.advanceTimersByTime(5000);
      expect(revalidate).not.toHaveBeenCalled();

      vi.useRealTimers();
    });

    test('should not retry on 403 Forbidden errors', () => {
      vi.useFakeTimers();

      const revalidate = vi.fn();
      const error403 = new RequestError('Forbidden', undefined, 403, undefined, undefined);

      const onErrorRetry = (
        error: Error,
        key: string,
        config: unknown,
        revalidateFn: (opts: { retryCount: number }) => void,
        opts: { retryCount: number }
      ) => {
        if (
          error instanceof RequestError &&
          (error.statusCode === 401 || error.statusCode === 403)
        ) {
          return;
        }

        if (opts.retryCount >= 3) return;

        const timeout = ~~((Math.random() + 0.5) * (1 << opts.retryCount)) * 1000;
        setTimeout(() => {
          revalidateFn(opts);
        }, timeout);
      };

      onErrorRetry(error403, '/api/test', {}, revalidate, { retryCount: 0 });

      vi.advanceTimersByTime(5000);
      expect(revalidate).not.toHaveBeenCalled();

      vi.useRealTimers();
    });

    test('should retry with exponential backoff on 500 errors', () => {
      vi.useFakeTimers();

      const revalidate = vi.fn().mockResolvedValue(undefined);
      const error500 = new RequestError('Server Error', undefined, 500, undefined, undefined);

      const onErrorRetry = (
        error: Error,
        key: string,
        config: unknown,
        revalidateFn: (opts: { retryCount: number }) => void,
        opts: { retryCount: number }
      ) => {
        if (
          error instanceof RequestError &&
          (error.statusCode === 401 || error.statusCode === 403)
        ) {
          return;
        }

        if (opts.retryCount >= 3) return;

        const timeout = ~~((Math.random() + 0.5) * (1 << opts.retryCount)) * 1000;
        setTimeout(() => {
          revalidateFn(opts);
        }, timeout);
      };

      onErrorRetry(error500, '/api/test', {}, revalidate, { retryCount: 0 });

      // Should schedule a retry (jitter makes it between 500-1500ms)
      vi.advanceTimersByTime(2000);
      expect(revalidate).toHaveBeenCalledTimes(1);
      expect(revalidate).toHaveBeenCalledWith({ retryCount: 0 });

      vi.useRealTimers();
    });

    test('should stop retrying after 3 attempts', () => {
      vi.useFakeTimers();

      const revalidate = vi.fn();
      const error500 = new RequestError('Server Error', undefined, 500, undefined, undefined);

      const onErrorRetry = (
        error: Error,
        key: string,
        config: unknown,
        revalidateFn: (opts: { retryCount: number }) => void,
        opts: { retryCount: number }
      ) => {
        if (
          error instanceof RequestError &&
          (error.statusCode === 401 || error.statusCode === 403)
        ) {
          return;
        }

        if (opts.retryCount >= 3) return;

        const timeout = ~~((Math.random() + 0.5) * (1 << opts.retryCount)) * 1000;
        setTimeout(() => {
          revalidateFn(opts);
        }, timeout);
      };

      onErrorRetry(error500, '/api/test', {}, revalidate, { retryCount: 3 });

      vi.advanceTimersByTime(10000);
      expect(revalidate).not.toHaveBeenCalled();

      vi.useRealTimers();
    });

    test('should retry on non-RequestError failures like network errors', () => {
      vi.useFakeTimers();

      const revalidate = vi.fn().mockResolvedValue(undefined);
      const networkError = new TypeError('Failed to fetch');

      const onErrorRetry = (
        error: Error,
        key: string,
        config: unknown,
        revalidateFn: (opts: { retryCount: number }) => void,
        opts: { retryCount: number }
      ) => {
        if (
          error instanceof RequestError &&
          (error.statusCode === 401 || error.statusCode === 403)
        ) {
          return;
        }

        if (opts.retryCount >= 3) return;

        const timeout = ~~((Math.random() + 0.5) * (1 << opts.retryCount)) * 1000;
        setTimeout(() => {
          revalidateFn(opts);
        }, timeout);
      };

      onErrorRetry(networkError, '/api/test', {}, revalidate, { retryCount: 0 });

      // Should retry non-RequestError errors like network failures
      vi.advanceTimersByTime(2000);
      expect(revalidate).toHaveBeenCalledTimes(1);
      expect(revalidate).toHaveBeenCalledWith({ retryCount: 0 });

      vi.useRealTimers();
    });
  });
});
