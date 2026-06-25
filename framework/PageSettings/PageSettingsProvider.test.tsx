/* eslint-disable i18next/no-literal-string */
import { createElement, ReactNode } from 'react';
import { render, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import {
  PageSettingsProvider,
  usePageSettings,
  PageSettingsContext,
  createSWRErrorRetryHandler,
} from './PageSettingsProvider';
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

const capturedSWRConfigValues: Record<string, unknown>[] = [];

vi.mock('swr', async (importOriginal) => {
  const actual = await importOriginal<typeof import('swr')>();

  function CapturingSWRConfig(props: { value?: Record<string, unknown>; children?: ReactNode }) {
    if (props.value) {
      capturedSWRConfigValues.push({ ...props.value });
    }
    return createElement(
      actual.SWRConfig as unknown as React.ComponentType<Record<string, unknown>>,
      props as unknown as Record<string, unknown>
    );
  }

  return {
    ...actual,
    SWRConfig: CapturingSWRConfig,
  };
});

describe('PageSettingsProvider', () => {
  beforeEach(() => {
    // Clear localStorage
    localStorage.clear();

    capturedSWRConfigValues.length = 0;
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
        <PageSettingsProvider>{children}</PageSettingsProvider>
      );

      const { result } = renderHook(() => usePageSettings(), { wrapper });

      expect(result.current).toEqual({
        refreshInterval: 60,
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
        <PageSettingsProvider>{children}</PageSettingsProvider>
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
        <PageSettingsProvider>{children}</PageSettingsProvider>
      );

      const { result } = renderHook(() => usePageSettings(), { wrapper });

      // Should use defaults when localStorage has invalid JSON
      expect(result.current.refreshInterval).toBe(60);
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
        <PageSettingsProvider>
          <PageSettingsContext.Consumer>
            {([_settings, setSettings]) => {
              setSettingsFunc = setSettings;
              return <TestComponent />;
            }}
          </PageSettingsContext.Consumer>
        </PageSettingsProvider>
      );

      // Initial state
      expect(getByTestId('refresh-interval')).toHaveTextContent('60');

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
        <PageSettingsProvider>{children}</PageSettingsProvider>
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
        <PageSettingsProvider>{children}</PageSettingsProvider>
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
        <PageSettingsProvider>{children}</PageSettingsProvider>
      );

      const { result } = renderHook(() => usePageSettings(), { wrapper });

      await waitFor(() => {
        expect(result.current.activeTheme).toBe('light');
        expect(result.current.theme).toBe('light');
      });
    });

    const disabledThemeWrapper = ({ children }: { children: ReactNode }) => (
      <PageSettingsProvider disableThemeManagement>{children}</PageSettingsProvider>
    );

    test('should not modify document theme class when disableThemeManagement is true and theme is dark', async () => {
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

      const { result } = renderHook(() => usePageSettings(), { wrapper: disabledThemeWrapper });

      await waitFor(() => {
        expect(result.current.activeTheme).toBe('dark');
      });

      expect(document.documentElement.classList.contains('pf-v6-theme-dark')).toBe(false);
    });

    test('should not modify document theme class when disableThemeManagement is true and theme is light', async () => {
      document.documentElement.classList.add('pf-v6-theme-dark');

      vi.mocked(globalThis.matchMedia).mockImplementation(() => ({
        matches: false,
        media: '',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      const { result } = renderHook(() => usePageSettings(), { wrapper: disabledThemeWrapper });

      await waitFor(() => {
        expect(result.current.activeTheme).toBe('light');
      });

      expect(document.documentElement.classList.contains('pf-v6-theme-dark')).toBe(true);
    });
  });

  describe('SWR Configuration', () => {
    test('should configure SWRConfig with onErrorRetry to prevent infinite retry loops on 5xx errors', () => {
      render(
        <PageSettingsProvider defaultRefreshInterval={30}>
          <div>test child</div>
        </PageSettingsProvider>
      );

      expect(capturedSWRConfigValues.length).toBeGreaterThan(0);
      const config = capturedSWRConfigValues[capturedSWRConfigValues.length - 1];
      expect(config).toHaveProperty('onErrorRetry');
      expect(typeof config.onErrorRetry).toBe('function');
    });

    test('should disable revalidateOnFocus to prevent refetch storms', () => {
      render(
        <PageSettingsProvider defaultRefreshInterval={30}>
          <div>test child</div>
        </PageSettingsProvider>
      );

      const config = capturedSWRConfigValues[capturedSWRConfigValues.length - 1];
      expect(config).toHaveProperty('revalidateOnFocus', false);
    });

    test('should set a dedupingInterval to prevent duplicate requests', () => {
      render(
        <PageSettingsProvider defaultRefreshInterval={30}>
          <div>test child</div>
        </PageSettingsProvider>
      );

      const config = capturedSWRConfigValues[capturedSWRConfigValues.length - 1];
      expect(config).toHaveProperty('dedupingInterval');
      expect(typeof config.dedupingInterval).toBe('number');
      expect(config.dedupingInterval as number).toBeGreaterThan(0);
    });

    test('should configure SWR with correct refresh interval', () => {
      const TestComponent = () => {
        const settings = usePageSettings();
        return <div data-testid="interval">{settings.refreshInterval}</div>;
      };

      const { getByTestId } = render(
        <PageSettingsProvider>
          <TestComponent />
        </PageSettingsProvider>
      );

      expect(getByTestId('interval')).toHaveTextContent('60');
    });

    test('should disable refresh when interval is 0', () => {
      localStorage.setItem('user-preferences', JSON.stringify({ refreshInterval: 0 }));

      const TestComponent = () => {
        const settings = usePageSettings();
        return <div data-testid="interval">{settings.refreshInterval}</div>;
      };

      const { getByTestId } = render(
        <PageSettingsProvider>
          <TestComponent />
        </PageSettingsProvider>
      );

      expect(getByTestId('interval')).toHaveTextContent('0');
    });
  });

  describe('SWR Error Retry Logic (Polling Changes)', () => {
    // Test the actual extracted onErrorRetry handler for better coverage

    test('should not retry on 401 Unauthorized errors', () => {
      vi.useFakeTimers();

      const revalidate = vi.fn();
      const error401 = new RequestError('Unauthorized', undefined, 401, undefined, undefined);
      const onErrorRetry = createSWRErrorRetryHandler();

      onErrorRetry(error401, '/api/test', {}, revalidate, { retryCount: 0 });

      // Should not have scheduled any retry for 401 errors
      vi.advanceTimersByTime(5000);
      expect(revalidate).not.toHaveBeenCalled();

      vi.useRealTimers();
    });

    test('should not retry on 403 Forbidden errors', () => {
      vi.useFakeTimers();

      const revalidate = vi.fn();
      const error403 = new RequestError('Forbidden', undefined, 403, undefined, undefined);
      const onErrorRetry = createSWRErrorRetryHandler();

      onErrorRetry(error403, '/api/test', {}, revalidate, { retryCount: 0 });

      // Should not have scheduled any retry for 403 errors
      vi.advanceTimersByTime(5000);
      expect(revalidate).not.toHaveBeenCalled();

      vi.useRealTimers();
    });

    test('should retry with exponential backoff on 500 errors', () => {
      vi.useFakeTimers();

      // Mock Math.random to have predictable jitter for testing (avoids SonarCloud warning)
      const originalMathRandom = Math.random;
      Math.random = vi.fn(() => 0.5); // Fixed value for deterministic testing

      const revalidate = vi.fn();
      const error500 = new RequestError('Server Error', undefined, 500, undefined, undefined);
      const onErrorRetry = createSWRErrorRetryHandler();

      onErrorRetry(error500, '/api/test', {}, revalidate, { retryCount: 0 });

      // With our mocked Math.random (0.5), timeout should be exactly 1000ms for retryCount=0
      // timeout = Math.trunc((0.5 + 0.5) * (1 << 0)) * 1000 = Math.trunc(1 * 1) * 1000 = 1000
      vi.advanceTimersByTime(1000);
      expect(revalidate).toHaveBeenCalledTimes(1);
      expect(revalidate).toHaveBeenCalledWith({ retryCount: 0 });

      // Restore original Math.random
      Math.random = originalMathRandom;
      vi.useRealTimers();
    });

    test('should stop retrying after 3 attempts', () => {
      vi.useFakeTimers();

      const revalidate = vi.fn();
      const error500 = new RequestError('Server Error', undefined, 500, undefined, undefined);
      const onErrorRetry = createSWRErrorRetryHandler();

      // Test with retryCount >= 3 (should not retry)
      onErrorRetry(error500, '/api/test', {}, revalidate, { retryCount: 3 });

      vi.advanceTimersByTime(10000);
      expect(revalidate).not.toHaveBeenCalled();

      vi.useRealTimers();
    });

    test('should retry on non-RequestError failures like network errors', () => {
      vi.useFakeTimers();

      // Mock Math.random for deterministic testing
      const originalMathRandom = Math.random;
      Math.random = vi.fn(() => 0.5);

      const revalidate = vi.fn();
      const networkError = new TypeError('Failed to fetch');
      const onErrorRetry = createSWRErrorRetryHandler();

      onErrorRetry(networkError, '/api/test', {}, revalidate, { retryCount: 0 });

      // Should retry non-RequestError errors like network failures
      vi.advanceTimersByTime(1000);
      expect(revalidate).toHaveBeenCalledTimes(1);
      expect(revalidate).toHaveBeenCalledWith({ retryCount: 0 });

      // Restore original Math.random
      Math.random = originalMathRandom;
      vi.useRealTimers();
    });

    test('should retry other HTTP errors (not 401/403)', () => {
      vi.useFakeTimers();

      // Mock Math.random for deterministic testing
      const originalMathRandom = Math.random;
      Math.random = vi.fn(() => 0.25); // Different value to test jitter calculation

      const revalidate = vi.fn();
      const error404 = new RequestError('Not Found', undefined, 404, undefined, undefined);
      const onErrorRetry = createSWRErrorRetryHandler();

      onErrorRetry(error404, '/api/test', {}, revalidate, { retryCount: 1 });

      // With Math.random=0.25, retryCount=1:
      // timeout = Math.trunc((0.25 + 0.5) * (1 << 1)) * 1000 = Math.trunc(0.75 * 2) * 1000 = 1000
      vi.advanceTimersByTime(1000);
      expect(revalidate).toHaveBeenCalledTimes(1);
      expect(revalidate).toHaveBeenCalledWith({ retryCount: 1 });

      // Restore original Math.random
      Math.random = originalMathRandom;
      vi.useRealTimers();
    });
  });
});
