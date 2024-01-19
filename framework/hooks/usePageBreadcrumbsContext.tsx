import { Dispatch, SetStateAction, createContext, useContext, useEffect } from 'react';
import { ICatalogBreadcrumb } from '../PageHeader';

export type BreadcrumbsContext = {
  breadcrumbs: ICatalogBreadcrumb[];
  setBreadcrumbs: Dispatch<SetStateAction<ICatalogBreadcrumb[]>>;
};

export const BreadcrumbsContext = createContext<BreadcrumbsContext>({
  breadcrumbs: [],
  setBreadcrumbs: () => {},
});

export const usePageBreadcrumbsContext = (): BreadcrumbsContext => useContext(BreadcrumbsContext);

/**
 * Hook for updating the existing breadcrumbs within a page with the breadcrumb for a new tab.
 * The breadcrumb is cleared away when the user navigates away from the given tab.
 * @param breadcrumb: Breadcrumb for the new tab that is being added, eg. { label: t(`Details`) }
 */
export function useUpdatePageBreadcrumbs(breadcrumb: ICatalogBreadcrumb) {
  const context = useContext(BreadcrumbsContext);
  if (context === undefined) {
    throw new Error('useBreadcrumb must be used within a BreadcrumbsContext provider');
  }
  useEffect(() => {
    context.setBreadcrumbs((prevBreadcrumbs) => {
      if (
        prevBreadcrumbs.length &&
        prevBreadcrumbs.slice(-1) &&
        prevBreadcrumbs.slice(-1)[0].label !== breadcrumb.label
      ) {
        return [...prevBreadcrumbs, breadcrumb];
      }
      return prevBreadcrumbs;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [breadcrumb]);
  useEffect(() => {
    // Cleanup - to remove breadcrumb when navigating away from a tab
    return () => {
      context.setBreadcrumbs((prevBreadcrumbs) => {
        if (
          prevBreadcrumbs.length &&
          prevBreadcrumbs.slice(-1) &&
          prevBreadcrumbs.slice(-1)[0].label === breadcrumb.label
        ) {
          return [...prevBreadcrumbs.slice(0, -1)];
        }
        return prevBreadcrumbs;
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
