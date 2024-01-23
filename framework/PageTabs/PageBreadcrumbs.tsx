import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useState } from 'react';
import { ICatalogBreadcrumb } from '../PageHeader';

export type PageBreadcrumbsContext = {
  /** The base set of breadcrumbs for a page. eg. Namespaces -> Namespace XYZ */
  baselineBreadcrumbs: ICatalogBreadcrumb[];
  /** The breadcrumbs that will be displayed by the PageHeader component.
   * This usually holds the baselineBreadcrumbs appended with the current active tab if it exists.
   * eg. Namespaces -> Namespace XYZ -> Collections */
  pageBreadcrumbs: ICatalogBreadcrumb[];
  /** Setter for baseline breadcrumbs for a page */
  setPageBreadcrumbs: Dispatch<SetStateAction<ICatalogBreadcrumb[]>>;
  /** Setter for the page breadcrumbs that will be displayed by the PageHeader component. */
  setBaselineBreadcrumbs: Dispatch<SetStateAction<ICatalogBreadcrumb[]>>;
};

export const PageBreadcrumbsContext = createContext<PageBreadcrumbsContext>({
  baselineBreadcrumbs: [],
  setBaselineBreadcrumbs: () => {},
  pageBreadcrumbs: [],
  setPageBreadcrumbs: () => {},
});
export function PageBreadcrumbsProvider(props: { children: ReactNode }) {
  const [baselineBreadcrumbs, setBaselineBreadcrumbs] = useState<ICatalogBreadcrumb[]>([]);
  const [pageBreadcrumbs, setPageBreadcrumbs] = useState<ICatalogBreadcrumb[]>([]);
  return (
    <PageBreadcrumbsContext.Provider
      value={{ baselineBreadcrumbs, setBaselineBreadcrumbs, pageBreadcrumbs, setPageBreadcrumbs }}
    >
      {props.children}
    </PageBreadcrumbsContext.Provider>
  );
}

export const usePageBreadcrumbs = (): PageBreadcrumbsContext => useContext(PageBreadcrumbsContext);
