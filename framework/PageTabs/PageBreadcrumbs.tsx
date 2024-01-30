import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useState } from 'react';
import { ICatalogBreadcrumb } from '../PageHeader';

export type PageBreadcrumbsContext = {
  /** The page breadcrumbs are used to display the current page in the page breadcrumbs */
  breadcrumbs?: ICatalogBreadcrumb[];
  setBreadcrumbs: Dispatch<SetStateAction<ICatalogBreadcrumb[] | undefined>>;

  /** The tab breadcrumb is used to display the current active tab in the page breadcrumbs */
  tabBreadcrumb?: ICatalogBreadcrumb;
  setTabBreadcrumb: Dispatch<SetStateAction<ICatalogBreadcrumb | undefined>>;
};

export const PageBreadcrumbsContext = createContext<PageBreadcrumbsContext>({
  breadcrumbs: [],
  setBreadcrumbs: () => {},
  tabBreadcrumb: {},
  setTabBreadcrumb: () => {},
});

export function PageBreadcrumbsProvider(props: { children: ReactNode }) {
  const [breadcrumbs, setBreadcrumbs] = useState<ICatalogBreadcrumb[] | undefined>([]);
  const [tabBreadcrumb, setTabBreadcrumb] = useState<ICatalogBreadcrumb | undefined>({});
  return (
    <PageBreadcrumbsContext.Provider
      value={{ breadcrumbs, setBreadcrumbs, tabBreadcrumb, setTabBreadcrumb }}
    >
      {props.children}
    </PageBreadcrumbsContext.Provider>
  );
}

export const usePageBreadcrumbs = (): PageBreadcrumbsContext => useContext(PageBreadcrumbsContext);
