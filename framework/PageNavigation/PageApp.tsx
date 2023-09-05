import { Page } from '@patternfly/react-core';
import { ReactNode, useMemo } from 'react';
import {
  Navigate,
  Outlet,
  RouterProvider,
  createBrowserRouter,
  useNavigate,
} from 'react-router-dom';
import { PageFramework } from '../PageFramework';
import { PageLayout } from '../PageLayout';
import { PageNavigation, PageNavigationItem } from './PageNavigation';

export function PageApp(props: {
  /** Component for the header of the page. */
  header?: ReactNode;

  /** The navigation items for the page. */
  navigationItems: PageNavigationItem[];

  /**
   * The basename of the app for situations where you can't deploy to the root of the domain, but a sub directory.
   *
   * SEE: https://reactrouter.com/en/main/routers/create-browser-router#basename
   */
  basename?: string;
}) {
  const { navigationItems, basename, header } = props;
  const navigationItemsWithRoot = useMemo(
    () => [
      {
        path: '/',
        element: (
          <PageRouterLayout
            header={header}
            sidebar={<PageNavigation navigationItems={navigationItems} />}
          />
        ),
        children: navigationItems,
      },
      {
        path: '*',
        element: <Navigate to="/" />,
      },
    ],
    [header, navigationItems]
  );

  const router = useMemo(
    () => createBrowserRouter(navigationItemsWithRoot, { basename }),
    [basename, navigationItemsWithRoot]
  );

  return <RouterProvider router={router} />;
}

function PageRouterLayout(props: { header?: ReactNode; sidebar?: ReactNode }) {
  const { header, sidebar } = props;
  const navigate = useNavigate();
  return (
    <PageFramework navigate={navigate}>
      <Page header={header} sidebar={sidebar}>
        <PageLayout>
          <Outlet />
        </PageLayout>
      </Page>
    </PageFramework>
  );
}
