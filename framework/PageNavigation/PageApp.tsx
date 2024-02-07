import { Page } from '@patternfly/react-core';
import { ReactNode, useMemo } from 'react';
import { Outlet, RouterProvider, createBrowserRouter } from 'react-router-dom';
import { PageNotFound } from '../PageEmptyStates/PageNotFound';
import { PageFramework } from '../PageFramework';
import { PageNotificationsDrawer } from '../PageNotifications/PageNotificationsProvider';
import { PageNavigation } from './PageNavigation';
import { PageNavigationItem } from './PageNavigationItem';
import { PageNavigationRoutesProvider } from './PageNavigationRoutesProvider';

export function PageApp(props: {
  login: ReactNode;

  root: ReactNode;

  /** Component for the masthead of the page. */
  masthead?: ReactNode;

  /** The navigation items for the page. */
  navigation: PageNavigationItem[];

  /**
   * The basename of the app for situations where you can't deploy to the root of the domain, but a sub directory.
   *
   * SEE: https://reactrouter.com/en/main/routers/create-browser-router#basename
   */
  basename?: string;

  defaultRefreshInterval?: number;
}) {
  const { navigation, basename, masthead } = props;
  const routes = useMemo(
    () => [
      {
        path: '',
        element: (
          <PageFramework defaultRefreshInterval={props.defaultRefreshInterval}>
            <Outlet />
          </PageFramework>
        ),
        children: [
          { path: 'login', element: props.login },
          {
            path: '',
            element: props.root,
            children: [
              {
                path: '',
                element: (
                  <Page header={masthead} sidebar={<PageNavigation navigation={navigation} />}>
                    <PageNotificationsDrawer>
                      <Outlet />
                    </PageNotificationsDrawer>
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
    [masthead, navigation, props.defaultRefreshInterval, props.login, props.root]
  );
  const router = useMemo(() => createBrowserRouter(routes, { basename }), [basename, routes]);
  return (
    <PageNavigationRoutesProvider navigation={navigation}>
      <RouterProvider router={router} />
    </PageNavigationRoutesProvider>
  );
}
