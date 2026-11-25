import { createContext, ReactNode, useMemo, useContext, useEffect, useLayoutEffect } from 'react';
import { PageNavigationItem } from '../PageNavigation/PageNavigationItem';
import { useLocation } from 'react-router-dom';
import { findNavigationItemByPath, getNavigationTitle } from './findNavigationItemByPath';
import { useApplicationName } from './useApplicationName';

const TitleContext = createContext<{
  currentPageNavigation: PageNavigationItem[];
  applicationName: string;
} | null>(null);

export function PageTitleProvider(
  props: Readonly<{
    navigation: PageNavigationItem[];
    children: ReactNode;
    /**
     * Application name suffix for document titles. Callers that inject a build-time
     * name (for example via bundler env) should pass it here so framework code does
     * not rely on `process.env` in the browser.
     */
    applicationName?: string;
  }>
) {
  if (props.applicationName !== undefined) {
    return (
      <PageTitleProviderInner navigation={props.navigation} applicationName={props.applicationName}>
        {props.children}
      </PageTitleProviderInner>
    );
  }

  return (
    <PageTitleProviderWithDefaultName navigation={props.navigation}>
      {props.children}
    </PageTitleProviderWithDefaultName>
  );
}

function PageTitleProviderWithDefaultName(
  props: Readonly<{
    navigation: PageNavigationItem[];
    children: ReactNode;
  }>
) {
  const applicationName = useApplicationName();
  return (
    <PageTitleProviderInner navigation={props.navigation} applicationName={applicationName}>
      {props.children}
    </PageTitleProviderInner>
  );
}

function PageTitleProviderInner(
  props: Readonly<{
    navigation: PageNavigationItem[];
    children: ReactNode;
    applicationName: string;
  }>
) {
  const location = useLocation();
  const currentPageNavigation = useMemo(
    () => findNavigationItemByPath(props.navigation, location.pathname),
    [props.navigation, location.pathname]
  );

  const pageTitle = useMemo(() => {
    if (!currentPageNavigation.length) return null;

    return getNavigationTitle(currentPageNavigation);
  }, [currentPageNavigation]);

  const documentTitle = useMemo(() => {
    if (!pageTitle) return props.applicationName;
    return `${pageTitle} | ${props.applicationName}`;
  }, [props.applicationName, pageTitle]);

  const value = useMemo(
    () => ({ currentPageNavigation, applicationName: props.applicationName }),
    [currentPageNavigation, props.applicationName]
  );

  useLayoutEffect(() => {
    document.title = documentTitle;
  }, [documentTitle]);

  return <TitleContext.Provider value={value}>{props.children}</TitleContext.Provider>;
}

export function usePageTitle(title: string | null | undefined) {
  const context = useContext(TitleContext);
  const pageTitle = context?.currentPageNavigation.length
    ? getNavigationTitle(context.currentPageNavigation, title)
    : null;
  let documentTitle: string | undefined;
  if (context) {
    documentTitle = context.applicationName;
    if (pageTitle) {
      documentTitle = `${pageTitle} | ${context.applicationName}`;
    }
  }

  useEffect(() => {
    if (documentTitle !== undefined) {
      document.title = documentTitle;
    }
  }, [documentTitle]);
}
