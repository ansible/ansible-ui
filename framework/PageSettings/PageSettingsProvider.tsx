/* eslint-disable i18next/no-literal-string */
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
import { isRequestError } from '@ansible/common-ui/crud/RequestError';

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
  defaultRefreshInterval: number;
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
      refreshInterval: props.defaultRefreshInterval,
      theme: 'system',
      tableLayout: 'comfortable',
      formColumns: 'multiple',
      formLayout: 'vertical',
      dateFormat: 'date-time',
      dataEditorFormat: 'yaml',
      ...settings,
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
        refreshInterval: settings.refreshInterval ? settings.refreshInterval * 1000 : 0,
        onErrorRetry: swrErrorRetryHandler,
      }}
    >
      <PageSettingsContext.Provider value={[settings, setSettings]}>
        {props.children}
      </PageSettingsContext.Provider>
    </SWRConfig>
  );
}
