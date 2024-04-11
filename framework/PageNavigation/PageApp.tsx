import { Page } from '@patternfly/react-core';
import { ReactNode, useEffect, useMemo } from 'react';
import { Outlet, Route, RouteObject, Routes } from 'react-router-dom';
import { PageNotFound } from '../PageEmptyStates/PageNotFound';
import { PageNotificationsDrawer } from '../PageNotifications/PageNotificationsProvider';
import { PageNavigation } from './PageNavigation';
import { PageNavigationItem } from './PageNavigationItem';
import { usePageNavigationRoutesContext } from './PageNavigationRoutesProvider';

export function PageApp(props: {
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

  /** The default refresh interval for the page in seconds. */
  defaultRefreshInterval: number;
}) {
  const { navigation, masthead } = props;
  const navigationItems = useMemo(
    () => [
      {
        path: `/`,
        element: (
          <Page header={masthead} sidebar={<PageNavigation navigation={navigation} />}>
            <PageNotificationsDrawer>
              <Outlet />
            </PageNotificationsDrawer>
          </Page>
        ),
        children: navigation,
      },
      { path: '*', element: <PageNotFound /> },
    ],
    [masthead, navigation]
  );
  const [_, setNavigation] = usePageNavigationRoutesContext();
  useEffect(() => {
    setNavigation(navigation);
  }, [navigation, setNavigation]);

  return <Routes>{navigationItems.map(NavigationRoute)}</Routes>;
}

function NavigationRoute(route: RouteObject) {
  return (
    <Route path={route.path} element={route.element}>
      {route.children?.map(NavigationRoute)}
    </Route>
  );
}
