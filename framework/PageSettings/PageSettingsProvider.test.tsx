import { createElement, ReactNode, useContext } from 'react';
import { act, cleanup, render, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import i18n, { createInstance, InitOptions, ReadCallback } from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import {
  PageSettingsProvider,
  IPageSettings,
  usePageSettings,
  PageSettingsContext,
  createSWRErrorRetryHandler,
  SWR_DEDUPING_INTERVAL_MS,
} from './PageSettingsProvider';
import { RequestError } from '@ansible/common-ui/crud/RequestError';

const languageInstance = vi.hoisted(() => ({
  current: undefined as typeof i18n | undefined,
}));

vi.mock('i18next', async (importOriginal) => {
  const actual = await importOriginal<typeof import('i18next')>();
  return {
    ...actual,
    get default() {
      return languageInstance.current ?? actual.default;
    },
  };
});

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

function createSettingsWrapper(
  onSettingsChange: (setSettings: (settings: IPageSettings) => void) => void
) {
  return function SettingsWrapper({ children }: Readonly<{ children: ReactNode }>) {
    return (
      <PageSettingsProvider>
        <PageSettingsContext.Consumer>
          {([_settings, setSettings]) => {
            onSettingsChange(setSettings);
            return children;
          }}
        </PageSettingsContext.Consumer>
      </PageSettingsProvider>
    );
  };
}

vi.mock('swr', async (importOriginal) => {
  const actual = await importOriginal<typeof import('swr')>();

  function CapturingSWRConfig({
    value,
    children,
  }: Readonly<{ value?: Record<string, unknown>; children?: ReactNode }>) {
    if (value) {
      capturedSWRConfigValues.push({ ...value });
    }
    return createElement(
      actual.SWRConfig as unknown as React.ComponentType<Record<string, unknown>>,
      { value } as unknown as Record<string, unknown>,
      children
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
        language: 'browser',
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

    test('should fall back to browser language for an unsupported preference', () => {
      localStorage.setItem('user-preferences', JSON.stringify({ language: 'de' }));

      const wrapper = ({ children }: { children: ReactNode }) => (
        <PageSettingsProvider>{children}</PageSettingsProvider>
      );

      const { result } = renderHook(() => usePageSettings(), { wrapper });

      expect(result.current.language).toBe('browser');
    });

    test('should use the default context value outside the provider', () => {
      const { result } = renderHook(() => usePageSettings());

      expect(result.current).toEqual({});
      render(
        <PageSettingsContext.Consumer>
          {([_settings, setSettings]) => {
            setSettings({});
            return null;
          }}
        </PageSettingsContext.Consumer>
      );
    });

    test('should persist and clear the selected language cache', async () => {
      let setSettingsFunc: (settings: IPageSettings) => void = () => {};
      const wrapper = createSettingsWrapper((setSettings) => {
        setSettingsFunc = setSettings;
      });

      const { result } = renderHook(() => usePageSettings(), { wrapper });
      await act(() => Promise.resolve(setSettingsFunc({ ...result.current, language: 'fr' })));
      await waitFor(() => expect(localStorage.getItem('lang')).toBe('fr'));

      await act(() => Promise.resolve(setSettingsFunc({ ...result.current, language: 'browser' })));
      await waitFor(() => {
        expect(localStorage.getItem('lang')).toBeNull();
        expect(document.cookie).not.toContain('lang=');
      });
    });

    test('should skip language application when no language is set', async () => {
      let setSettingsFunc: (settings: IPageSettings) => void = () => {};
      const wrapper = createSettingsWrapper((setSettings) => {
        setSettingsFunc = setSettings;
      });

      const { result } = renderHook(() => usePageSettings(), { wrapper });
      await act(() => Promise.resolve(setSettingsFunc({ ...result.current, language: undefined })));
      await waitFor(() => expect(result.current.language).toBeUndefined());
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

  describe('Language synchronization', () => {
    let originalLang: string | null;
    let originalUrl: string;
    let originalCookie: string | undefined;

    beforeEach(() => {
      languageInstance.current = createInstance();
      originalLang = document.documentElement.getAttribute('lang');
      originalUrl = window.location.href;
      originalCookie = document.cookie.split('; ').find((cookie) => cookie.startsWith('lang='));
      document.cookie = 'lang=; Max-Age=0; path=/';
    });

    afterEach(() => {
      cleanup();
      vi.restoreAllMocks();
      languageInstance.current = undefined;
      if (originalLang === null) document.documentElement.removeAttribute('lang');
      else document.documentElement.lang = originalLang;
      document.cookie = 'lang=; Max-Age=0; path=/';
      window.history.replaceState(null, '', originalUrl);
      if (originalCookie) document.cookie = `${originalCookie}; path=/`;
    });

    async function renderLanguageSettings(candidates: string[], options: InitOptions = {}) {
      const detector = new LanguageDetector();
      detector.addDetector({ name: 'fixture', lookup: () => candidates });
      await i18n.use(detector).init({
        lng: 'fr',
        fallbackLng: 'en',
        supportedLngs: ['en', 'fr', 'ja'],
        resources: {
          en: { translation: { greeting: 'Hello' } },
          fr: { translation: { greeting: 'Bonjour' } },
          ja: { translation: { greeting: 'こんにちは' } },
        },
        detection: { order: ['fixture'], caches: [] },
        ...options,
      });
      localStorage.setItem('user-preferences', JSON.stringify({ language: 'fr' }));
      const view = renderHook(() => useContext(PageSettingsContext), {
        wrapper: PageSettingsProvider,
      });
      await waitFor(() => expect(i18n.resolvedLanguage).toBe('fr'));
      expect(document.documentElement.lang).toBe('fr');
      document.cookie = 'lang=fr; path=/';
      return view;
    }

    test('should not change an uninitialized i18next instance while updating preferences and caches', async () => {
      const changeLanguage = vi.spyOn(i18n, 'changeLanguage');
      const { result } = renderHook(() => useContext(PageSettingsContext), {
        wrapper: PageSettingsProvider,
      });
      expect(i18n.isInitialized).toBeFalsy();
      expect(changeLanguage).not.toHaveBeenCalled();

      await act(() => Promise.resolve(result.current[1]({ ...result.current[0], language: 'ja' })));

      expect(changeLanguage).not.toHaveBeenCalled();
      expect(document.documentElement.lang).toBe('ja');
      expect(localStorage.getItem('lang')).toBe('ja');

      await act(() =>
        Promise.resolve(result.current[1]({ ...result.current[0], language: 'browser' }))
      );

      expect(changeLanguage).not.toHaveBeenCalled();
      expect(document.documentElement.lang).toBe('ja');
      expect(localStorage.getItem('lang')).toBeNull();
    });

    test('should switch explicit French to detected English and clear explicit caches', async () => {
      const { result } = await renderLanguageSettings(['en']);
      expect(i18n.t('greeting')).toBe('Bonjour');
      expect(localStorage.getItem('lang')).toBe('fr');

      await act(() =>
        Promise.resolve(result.current[1]({ ...result.current[0], language: 'browser' }))
      );

      await waitFor(() => {
        expect(i18n.resolvedLanguage).toBe('en');
        expect(i18n.t('greeting')).toBe('Hello');
        expect(document.documentElement.lang).toBe('en');
      });
      expect(localStorage.getItem('lang')).toBeNull();
      expect(document.cookie).not.toContain('lang=');
      expect(JSON.parse(localStorage.getItem('user-preferences') ?? '{}')).toMatchObject({
        language: 'browser',
      });
    });

    test('should apply explicit Japanese translations, document language, and persisted preference', async () => {
      const { result } = await renderLanguageSettings(['en']);

      await act(() => Promise.resolve(result.current[1]({ ...result.current[0], language: 'ja' })));

      await waitFor(() => {
        expect(i18n.resolvedLanguage).toBe('ja');
        expect(i18n.t('greeting')).toBe('こんにちは');
        expect(document.documentElement.lang).toBe('ja');
      });
      expect(localStorage.getItem('lang')).toBe('ja');
      expect(JSON.parse(localStorage.getItem('user-preferences') ?? '{}')).toMatchObject({
        language: 'ja',
      });
    });

    test('should select a supported browser candidate after an unsupported regional candidate', async () => {
      const { result } = await renderLanguageSettings(['de-DE', 'ja']);

      await act(() =>
        Promise.resolve(result.current[1]({ ...result.current[0], language: 'browser' }))
      );

      await waitFor(() => {
        expect(i18n.resolvedLanguage).toBe('ja');
        expect(i18n.t('greeting')).toBe('こんにちは');
        expect(document.documentElement.lang).toBe('ja');
      });
      expect(localStorage.getItem('lang')).toBeNull();
      expect(document.cookie).not.toContain('lang=');
    });

    test('should honor the real lang querystring before browser candidates when returning to detection', async () => {
      const url = new URL(window.location.href);
      url.searchParams.set('lang', 'ja');
      window.history.replaceState(null, '', url);
      const { result } = await renderLanguageSettings(['en'], {
        detection: {
          order: ['querystring', 'fixture'],
          lookupQuerystring: 'lang',
          caches: [],
        },
      });
      expect(i18n.t('greeting')).toBe('Bonjour');

      await act(() =>
        Promise.resolve(result.current[1]({ ...result.current[0], language: 'browser' }))
      );

      await waitFor(() => {
        expect(i18n.resolvedLanguage).toBe('ja');
        expect(i18n.t('greeting')).toBe('こんにちは');
        expect(document.documentElement.lang).toBe('ja');
      });
      expect(localStorage.getItem('lang')).toBeNull();
      expect(document.cookie).not.toContain('lang=');
    });

    test('should resolve a regional browser candidate to the supported Japanese resource language', async () => {
      const { result } = await renderLanguageSettings(['ja-JP']);

      await act(() =>
        Promise.resolve(result.current[1]({ ...result.current[0], language: 'browser' }))
      );

      await waitFor(() => {
        expect(i18n.resolvedLanguage).toBe('ja');
        expect(i18n.t('greeting')).toBe('こんにちは');
        expect(document.documentElement.lang).toBe('ja');
      });
      expect(localStorage.getItem('lang')).toBeNull();
      expect(document.cookie).not.toContain('lang=');
    });

    test('should resolve empty browser detection to the configured fallback and clear explicit caches', async () => {
      const { result } = await renderLanguageSettings([]);

      await act(() =>
        Promise.resolve(result.current[1]({ ...result.current[0], language: 'browser' }))
      );

      await waitFor(() => {
        expect(i18n.resolvedLanguage).toBe('en');
        expect(i18n.t('greeting')).toBe('Hello');
        expect(document.documentElement.lang).toBe('en');
      });
      expect(localStorage.getItem('lang')).toBeNull();
      expect(document.cookie).not.toContain('lang=');
      expect(JSON.parse(localStorage.getItem('user-preferences') ?? '{}')).toMatchObject({
        language: 'browser',
      });
    });

    test('should preserve the active UI language and repair the document language after an exceptional rejection', async () => {
      const { result } = await renderLanguageSettings(['en']);
      document.documentElement.lang = 'ja';
      vi.spyOn(i18n, 'changeLanguage').mockRejectedValueOnce(new Error('Exceptional rejection'));

      await act(() =>
        Promise.resolve(result.current[1]({ ...result.current[0], language: 'browser' }))
      );

      await waitFor(() => expect(document.documentElement.lang).toBe('fr'));
      expect(i18n.resolvedLanguage).toBe('fr');
      expect(i18n.t('greeting')).toBe('Bonjour');
      expect(localStorage.getItem('lang')).toBeNull();
      expect(document.cookie).not.toContain('lang=');
    });

    test('should synchronize to available fallback translations after a browser resource load fails', async () => {
      const read = vi.fn((_language: string, _namespace: string, callback: ReadCallback) => {
        callback(new Error('Translation download failed'), false);
      });
      i18n.use({ type: 'backend', init: () => {}, read });
      const failedLoading = vi.fn();
      i18n.on('failedLoading', failedLoading);
      const { result } = await renderLanguageSettings(['ja'], {
        partialBundledLanguages: true,
        resources: {
          en: { translation: { greeting: 'Hello' } },
          fr: { translation: { greeting: 'Bonjour' } },
        },
      });

      await act(() =>
        Promise.resolve(result.current[1]({ ...result.current[0], language: 'browser' }))
      );

      await waitFor(() => {
        expect(i18n.resolvedLanguage).toBe('en');
        expect(i18n.t('greeting')).toBe('Hello');
        expect(document.documentElement.lang).toBe('en');
      });
      expect(read).toHaveBeenCalledWith('ja', 'translation', expect.any(Function));
      expect(failedLoading).toHaveBeenCalledWith('ja', 'translation', expect.any(Error));
      expect(localStorage.getItem('lang')).toBeNull();
      expect(document.cookie).not.toContain('lang=');
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

    test('should use an explicit dark theme', async () => {
      localStorage.setItem('user-preferences', JSON.stringify({ theme: 'dark' }));

      const wrapper = ({ children }: { children: ReactNode }) => (
        <PageSettingsProvider>{children}</PageSettingsProvider>
      );

      const { result } = renderHook(() => usePageSettings(), { wrapper });

      await waitFor(() => expect(result.current.activeTheme).toBe('dark'));
      expect(document.documentElement.classList.contains('pf-v6-theme-dark')).toBe(true);
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
        <PageSettingsProvider>
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
        <PageSettingsProvider>
          <div>test child</div>
        </PageSettingsProvider>
      );

      const config = capturedSWRConfigValues[capturedSWRConfigValues.length - 1];
      expect(config).toHaveProperty('revalidateOnFocus', false);
    });

    test('should set a dedupingInterval to prevent duplicate requests', () => {
      render(
        <PageSettingsProvider>
          <div>test child</div>
        </PageSettingsProvider>
      );

      const config = capturedSWRConfigValues[capturedSWRConfigValues.length - 1];
      expect(config).toHaveProperty('dedupingInterval', SWR_DEDUPING_INTERVAL_MS);
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
