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
import { useTranslation } from 'react-i18next';
import { findNavigationItemByPath, getNavigationTitle } from './findNavigationItemByPath';

const TitleContext = createContext<{
  setTitle?: Dispatch<SetStateAction<string | null>>;
  setOverrideTitle?: Dispatch<SetStateAction<string | null>>;
}>({});

export function PageTitleProvider(
  props: Readonly<{
    navigation: PageNavigationItem[];
    children: ReactNode;
  }>
) {
  const [title, setTitle] = useState<string | null>(null);
  const location = useLocation();
  const currentPageNavigation = useMemo(
    () => findNavigationItemByPath(props.navigation, location.pathname),
    [props.navigation, location.pathname]
  );
  const { t } = useTranslation();

  const pageTitle = useMemo(() => {
    if (!currentPageNavigation) return null;

    return getNavigationTitle(currentPageNavigation, title);
  }, [currentPageNavigation, title]);

  const value = useMemo(
    () => ({
      setTitle,
    }),
    [setTitle]
  );

  return (
    <TitleContext.Provider value={value}>
      <title>
        {pageTitle} | {t`Ansible Automation Platform`}
      </title>
      {props.children}
    </TitleContext.Provider>
  );
}

export function usePageTitle(title: string | null | undefined) {
  const context = useContext(TitleContext);

  useEffect(() => {
    if (context.setTitle) {
      context.setTitle(title || null);
    }
  }, [context, title]);
}

export function useOverrideTitle(title: string) {
  const context = useContext(TitleContext);

  if (context.setOverrideTitle) {
    context.setOverrideTitle(title);
  }

  useEffect(() => {
    return () => {
      if (context.setOverrideTitle) {
        context.setOverrideTitle(null);
      }
    };
  }, [context]);
}
