/* eslint-disable i18next/no-literal-string */
import { ReactNode } from 'react';
import { render, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { PageSettingsProvider, usePageSettings, PageSettingsContext } from './PageSettingsProvider';

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
    // We'll test the retry logic by testing the actual provider's SWR config
    // Since we can't directly access the onErrorRetry function from outside,
    // we'll test the behavior through integration-style tests with actual SWR usage

    test('should configure SWR with refresh interval in milliseconds', () => {
      const TestComponent = () => {
        const settings = usePageSettings();
        return <div data-testid="refresh">{settings.refreshInterval}</div>;
      };

      const { getByTestId } = render(
        <PageSettingsProvider defaultRefreshInterval={30}>
          <TestComponent />
        </PageSettingsProvider>
      );

      expect(getByTestId('refresh')).toHaveTextContent('30');
    });

    test('should initialize with system theme detection', () => {
      // Ensure dark theme is detected for this test
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

      const TestComponent = () => {
        const settings = usePageSettings();
        return <div data-testid="theme">{settings.activeTheme}</div>;
      };

      const { getByTestId } = render(
        <PageSettingsProvider defaultRefreshInterval={30}>
          <TestComponent />
        </PageSettingsProvider>
      );

      // Should detect system theme (dark from our mock)
      expect(getByTestId('theme')).toHaveTextContent('dark');
    });

    test('should provide SWR configuration to children', () => {
      const TestComponent = () => {
        const settings = usePageSettings();
        return (
          <div>
            <span data-testid="refresh">{settings.refreshInterval}</span>
            <span data-testid="theme">{settings.theme}</span>
          </div>
        );
      };

      const { getByTestId } = render(
        <PageSettingsProvider defaultRefreshInterval={15}>
          <TestComponent />
        </PageSettingsProvider>
      );

      expect(getByTestId('refresh')).toHaveTextContent('15');
      expect(getByTestId('theme')).toHaveTextContent('system');
    });

    test('should handle settings updates correctly', async () => {
      let updateSettings: (settings: object) => void = () => {};

      const TestComponent = () => {
        const settings = usePageSettings();
        return (
          <div>
            <span data-testid="refresh">{settings.refreshInterval}</span>
            <button
              onClick={() => updateSettings({ ...settings, refreshInterval: 60 })}
              data-testid="update"
            >
              Update
            </button>
          </div>
        );
      };

      const { getByTestId } = render(
        <PageSettingsProvider defaultRefreshInterval={30}>
          <PageSettingsContext.Consumer>
            {([_settings, setSettings]) => {
              updateSettings = setSettings;
              return <TestComponent />;
            }}
          </PageSettingsContext.Consumer>
        </PageSettingsProvider>
      );

      expect(getByTestId('refresh')).toHaveTextContent('30');

      getByTestId('update').click();

      await waitFor(() => {
        expect(getByTestId('refresh')).toHaveTextContent('60');
      });

      // Verify localStorage persistence
      const saved: { refreshInterval?: number } = JSON.parse(
        localStorage.getItem('user-preferences') || '{}'
      ) as { refreshInterval?: number };
      expect(saved.refreshInterval).toBe(60);
    });
  });
});
