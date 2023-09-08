import { Page } from '@patternfly/react-core';
import { ReactNode, useMemo } from 'react';
import { Outlet, RouterProvider, createBrowserRouter, useNavigate } from 'react-router-dom';
import { Login } from '../../frontend/common/Login';
import { PageNotFound } from '../../frontend/common/PageNotFound';
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
  const routes = useMemo(
    () => [
      {
        path: '',
        element: <PageFrameworkRoute />,
        children: [
          { path: 'login', element: <Login /> },
          {
            path: '',
            element: (
              <PageLayoutRoute
                header={header}
                sidebar={<PageNavigation navigationItems={navigationItems} />}
              />
            ),
            children: navigationItems,
          },
          { path: '*', element: <PageNotFound /> },
        ],
      },
    ],
    [header, navigationItems]
  );
  const router = useMemo(() => createBrowserRouter(routes, { basename }), [basename, routes]);
  return <RouterProvider router={router} />;
}

function PageFrameworkRoute() {
  const navigate = useNavigate();
  return (
    <PageFramework navigate={navigate}>
      <Outlet />
    </PageFramework>
  );
}

function PageLayoutRoute(props: { header?: ReactNode; sidebar?: ReactNode }) {
  const { header, sidebar } = props;
  return (
    <Page header={header} sidebar={sidebar}>
      <PageLayout>
        <Outlet />
      </PageLayout>
    </Page>
  );
}
