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
    if (activeTheme === 'dark') {
      document.documentElement.classList.add('pf-v5-theme-dark');
    } else {
      document.documentElement.classList.remove('pf-v5-theme-dark');
    }
  }, [activeTheme]);

  return (
    <SWRConfig
      value={{ refreshInterval: settings.refreshInterval ? settings.refreshInterval * 1000 : 0 }}
    >
      <PageSettingsContext.Provider value={[settings, setSettings]}>
        {props.children}
      </PageSettingsContext.Provider>
    </SWRConfig>
  );
}
