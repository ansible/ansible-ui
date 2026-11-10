import {
  createContext,
  ReactNode,
  useState,
  useMemo,
  useContext,
  SetStateAction,
  Dispatch,
  useEffect,
} from 'react';
import { PageNavigationItem } from '../PageNavigation/PageNavigationItem';
import { useLocation } from 'react-router-dom';
import { findNavigationItemByPath, getNavigationTitle } from './findNavigationItemByPath';
import { useApplicationName } from './useApplicationName';

const TitleContext = createContext<{
  setTitle?: Dispatch<SetStateAction<string | null>>;
}>({});

export function PageTitleProvider(
  props: Readonly<{
    navigation: PageNavigationItem[];
    children: ReactNode;
    /** When set (e.g. by platform build), used instead of `useApplicationName()` so Vite can inject `APPLICATION_NAME`. */
    applicationName?: string;
  }>
) {
  const [title, setTitle] = useState<string | null>(null);
  const location = useLocation();
  const currentPageNavigation = useMemo(
    () => findNavigationItemByPath(props.navigation, location.pathname),
    [props.navigation, location.pathname]
  );
  const applicationNameFromEnv = useApplicationName();
  const applicationName = props.applicationName ?? applicationNameFromEnv;

  const pageTitle = useMemo(() => {
    if (!currentPageNavigation.length) return null;

    return getNavigationTitle(currentPageNavigation, title);
  }, [currentPageNavigation, title]);

  const documentTitle = useMemo(() => {
    if (!pageTitle) return applicationName;
    return `${pageTitle} | ${applicationName}`;
  }, [applicationName, pageTitle]);

  const value = useMemo(
    () => ({
      setTitle,
    }),
    [setTitle]
  );

  useEffect(() => {
    document.title = documentTitle;
  }, [documentTitle]);

  return <TitleContext.Provider value={value}>{props.children}</TitleContext.Provider>;
}

export function usePageTitle(title: string | null | undefined) {
  const context = useContext(TitleContext);

  useEffect(() => {
    if (context.setTitle) {
      context.setTitle(title || null);
    }
  }, [context, title]);
}
