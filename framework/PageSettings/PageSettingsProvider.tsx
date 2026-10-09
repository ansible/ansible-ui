import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { SWRConfig } from 'swr';
import i18n from 'i18next';
import { isRequestError } from '@ansible/common-ui/crud/RequestError';

export const PAGE_SETTING_LANGUAGES = ['en', 'es', 'fr', 'ja', 'ko', 'nl', 'zh'] as const;
export type PageSettingLanguage = (typeof PAGE_SETTING_LANGUAGES)[number];
export type PageSettingLanguagePreference = 'browser' | PageSettingLanguage;

function isPageSettingLanguagePreference(value: unknown): value is PageSettingLanguagePreference {
  return (
    value === 'browser' ||
    (typeof value === 'string' && (PAGE_SETTING_LANGUAGES as readonly string[]).includes(value))
  );
}

function setLanguageCache(language: PageSettingLanguagePreference) {
  if (language === 'browser') {
    localStorage.removeItem('lang');
    document.cookie = 'lang=; Max-Age=0; path=/';
  } else {
    localStorage.setItem('lang', language);
  }
}

function applyLanguage(language: PageSettingLanguagePreference) {
  setLanguageCache(language);

  if (language === 'browser') {
    if (i18n.isInitialized) {
      // keep the active locale on rejection; add notification if recovery UX is needed.
      void i18n
        .changeLanguage()
        .catch(() => undefined)
        .then(() => {
          document.documentElement.lang = i18n.resolvedLanguage ?? i18n.language;
        });
    }
    return;
  }

  if (i18n.isInitialized) {
    void i18n.changeLanguage(language);
  }
  document.documentElement.lang = language;
}

/** Default SWR refresh interval in milliseconds. Overridden by __SWR_REFRESH_INTERVAL__ in tests. */
export const SWR_REFRESH_INTERVAL_MS =
  ((globalThis as unknown as Record<string, number>).__SWR_REFRESH_INTERVAL__ as
    | number
    | undefined) ?? 60000;

/** Default SWR deduping interval in milliseconds. Overridden by __SWR_DEDUPING_INTERVAL__ in tests. */
export const SWR_DEDUPING_INTERVAL_MS =
  ((globalThis as unknown as Record<string, number>).__SWR_DEDUPING_INTERVAL__ as
    | number
    | undefined) ?? 2000;

// Exported for testing
export function createSWRErrorRetryHandler() {
  return (
    error: Error,
    key: string,
    config: unknown,
    revalidate: (opts: { retryCount: number; [key: string]: unknown }) => void,
    opts: { retryCount: number; [key: string]: unknown }
  ) => {
    // Stop retrying on 401 Unauthorized and 403 Forbidden - let session polling handle login redirect
    if (isRequestError(error) && (error.statusCode === 401 || error.statusCode === 403)) {
      return;
    }

    // Custom retry: exponential backoff with jitter (max 3 retries)
    if (opts.retryCount >= 3) return;

    // Add jitter to prevent thundering herd
    // Math.random is sufficient for retry timing - not security-sensitive (SonarCloud S2245)
    const timeout = Math.trunc((Math.random() + 0.5) * (1 << opts.retryCount)) * 1000;

    setTimeout(() => {
      void revalidate(opts);
    }, timeout);
  };
}

const swrErrorRetryHandler = createSWRErrorRetryHandler();

export interface IPageSettings {
  refreshInterval?: number;
  theme?: 'system' | 'light' | 'dark';
  activeTheme?: 'light' | 'dark';
  tableLayout?: 'compact' | 'comfortable';
  formColumns?: 'single' | 'multiple';
  formLayout?: 'vertical' | 'horizontal';
  dateFormat?: 'since' | 'date-time';
  dataEditorFormat?: 'yaml' | 'json';
  language?: PageSettingLanguagePreference;
}

export const PageSettingsContext = createContext<
  [IPageSettings, (settings: IPageSettings) => void]
>([{}, () => null]);

export function usePageSettings() {
  const [settings] = useContext(PageSettingsContext);
  return settings;
}

export function PageSettingsProvider(props: {
  children?: ReactNode;
  disableThemeManagement?: boolean;
}) {
  const [settings, setSettingsState] = useState<IPageSettings>(() => {
    const preferencesStorage = localStorage.getItem('user-preferences');
    let settings: IPageSettings = {};
    if (preferencesStorage) {
      try {
        settings = JSON.parse(preferencesStorage) as IPageSettings;
      } catch (e) {
        // do nothing
      }
    }
    // defaults
    settings = {
      refreshInterval: SWR_REFRESH_INTERVAL_MS / 1000,
      theme: 'system',
      tableLayout: 'comfortable',
      formColumns: 'multiple',
      formLayout: 'vertical',
      dateFormat: 'date-time',
      dataEditorFormat: 'yaml',
      ...settings,
      language: isPageSettingLanguagePreference(settings.language) ? settings.language : 'browser',
    };
    return settings;
  });

  const setSettings = useCallback((settings: IPageSettings) => {
    localStorage.setItem('user-preferences', JSON.stringify(settings));
    setSettingsState(settings);
  }, []);

  const activeTheme = useMemo(() => {
    return settings.theme !== 'light' && settings.theme !== 'dark'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      : settings.theme;
  }, [settings.theme]);

  useEffect(() => {
    if (settings.language) {
      applyLanguage(settings.language);
    }
  }, [settings.language]);

  useEffect(() => {
    setSettingsState((settings) => {
      if (settings.activeTheme === activeTheme) return settings;
      return { ...settings, activeTheme };
    });
    if (!props.disableThemeManagement) {
      if (activeTheme === 'dark') {
        document.documentElement.classList.add('pf-v6-theme-dark');
      } else {
        document.documentElement.classList.remove('pf-v6-theme-dark');
      }
    }
  }, [activeTheme, props.disableThemeManagement]);

  return (
    <SWRConfig
      value={{
        dedupingInterval: SWR_DEDUPING_INTERVAL_MS,
        refreshInterval: settings.refreshInterval ? settings.refreshInterval * 1000 : 0,
        revalidateOnFocus: false,
        onErrorRetry: swrErrorRetryHandler,
      }}
    >
      <PageSettingsContext.Provider value={[settings, setSettings]}>
        {props.children}
      </PageSettingsContext.Provider>
    </SWRConfig>
  );
}
