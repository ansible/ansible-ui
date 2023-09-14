import { Page } from '@patternfly/react-core';
import { ReactNode, useMemo } from 'react';
import { Outlet, RouterProvider, createBrowserRouter } from 'react-router-dom';
import { PageNotFound } from '../../frontend/common/PageNotFound';
import { PageFramework } from '../PageFramework';
import { PageLayout } from '../PageLayout';
import { PageNavigation } from './PageNavigation';
import { PageNavigationItem } from './PageNavigationItem';
import { PageNavigationRoutesProvider } from './PageNavigationRoutesProvider';

export function PageApp(props: {
  login: ReactNode;

  root: ReactNode;

  /** Component for the header of the page. */
  header?: ReactNode;

  /** The navigation items for the page. */
  navigation: PageNavigationItem[];

  /**
   * The basename of the app for situations where you can't deploy to the root of the domain, but a sub directory.
   *
   * SEE: https://reactrouter.com/en/main/routers/create-browser-router#basename
   */
  basename?: string;
}) {
  const { navigation, basename, header } = props;
  const routes = useMemo(
    () => [
      {
        path: '',
        element: (
          <PageFramework>
            <Outlet />
          </PageFramework>
        ),
        children: [
          { path: 'login', element: props.login },
          {
            path: '',
            element: props.root ?? <></>,
            children: [
              {
                path: '',
                element: (
                  <Page header={header} sidebar={<PageNavigation navigation={navigation} />}>
                    <PageLayout>
                      <Outlet />
                    </PageLayout>
                  </Page>
                ),
                children: navigation,
              },
            ],
          },
          { path: '*', element: <PageNotFound /> },
        ],
      },
    ],
    [header, navigation, props.login, props.root]
  );
  const router = useMemo(() => createBrowserRouter(routes, { basename }), [basename, routes]);
  return (
    <PageNavigationRoutesProvider navigation={navigation}>
      <RouterProvider router={router} />
    </PageNavigationRoutesProvider>
  );
}
