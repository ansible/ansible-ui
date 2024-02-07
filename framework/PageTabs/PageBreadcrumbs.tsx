import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useState } from 'react';
import { ICatalogBreadcrumb } from '../PageHeader';

export type PageBreadcrumbsContext = {
  /** The tab breadcrumb is used to display the current active tab
   * in the page breadcrumbs (displayed by the PageHeader component) */
  tabBreadcrumb?: ICatalogBreadcrumb;
  setTabBreadcrumb: Dispatch<SetStateAction<ICatalogBreadcrumb | undefined>>;
};

export const PageBreadcrumbsContext = createContext<PageBreadcrumbsContext>({
  tabBreadcrumb: {},
  setTabBreadcrumb: () => {},
});

export function PageBreadcrumbsProvider(props: { children: ReactNode }) {
  const [tabBreadcrumb, setTabBreadcrumb] = useState<ICatalogBreadcrumb | undefined>();
  return (
    <PageBreadcrumbsContext.Provider value={{ tabBreadcrumb, setTabBreadcrumb }}>
      {props.children}
    </PageBreadcrumbsContext.Provider>
  );
}

export const usePageBreadcrumbs = (): PageBreadcrumbsContext => useContext(PageBreadcrumbsContext);
