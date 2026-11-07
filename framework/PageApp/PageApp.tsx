import { ChatbotSideBar } from '@ansible/chatbot/ChatbotSideBar';
import { Page } from '@patternfly/react-core';
import { ReactNode, useEffect, useMemo } from 'react';
import { Outlet, Route, RouteObject, Routes } from 'react-router-dom';
import styled from 'styled-components';
import { PageNotFound } from '../PageEmptyStates/PageNotFound';
import { PageNavigation } from '../PageNavigation/PageNavigation';
import { PageNavigationItem } from '../PageNavigation/PageNavigationItem';
import { usePageNavigationRoutesContext } from '../PageNavigation/PageNavigationRoutesProvider';
import { PageNotificationsDrawer } from '../PageNotifications/PageNotificationsDrawer';
import { usePageNotifications } from '../PageNotifications/usePageNotifications';

// The catch-all route renders outside the Page layout, so it does not get the page background.
// Without one it shows the body background, which the login page may set to a dark color, and the
// dark text of PageNotFound is unreadable in the light theme.
const PageNotFoundBackground = styled.div`
  height: 100vh;
  overflow: auto;
  background-color: var(--pf-t--global--background--color--primary--default);
`;

/** Page needs an onPageResize to enable its own size tracking; we only want the side effect. */
function noop() {}

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

  banner?: ReactNode;

  contextSwitcher?: ReactNode;
}) {
  const { navigation, masthead } = props;
  const { notificationsDrawerOpen } = usePageNotifications();

  const navigationItems = useMemo(
    () => [
      {
        path: props.basename ?? '/',
        element: (
          <ChatbotSideBar>
            <Page
              masthead={masthead}
              sidebar={
                <PageNavigation
                  navigation={navigation}
                  basename={props.basename}
                  contextSwitcher={props.contextSwitcher}
                />
              }
              notificationDrawer={<PageNotificationsDrawer />}
              isNotificationDrawerExpanded={notificationsDrawerOpen}
              isContentFilled
              // Page only starts tracking its own size when one of
              // isManagedSidebar / onPageResize is set. Without it, the
              // isMobile it puts on PageContext is stuck false, and
              // PageSidebar adds pf-m-expanded only when isSidebarOpen &&
              // isMobile -- so below the xl breakpoint the sidebar stayed
              // translated off-canvas however often the toggle was pressed.
              // The sidebar's open state stays owned by PageNavSideBarContext;
              // this only lets Page answer "are we on a small viewport?".
              onPageResize={noop}
            >
              {props.banner}
              <Outlet />
            </Page>
          </ChatbotSideBar>
        ),
        children: navigation.filter(({ href }) => !href),
      },
      {
        path: '*',
        element: (
          <PageNotFoundBackground data-testid="page-not-found-background">
            <PageNotFound />
          </PageNotFoundBackground>
        ),
      },
    ],
    [
      masthead,
      navigation,
      notificationsDrawerOpen,
      props.banner,
      props.basename,
      props.contextSwitcher,
    ]
  );
  const [_, setNavigation] = usePageNavigationRoutesContext();
  useEffect(() => setNavigation(navigationItems), [navigationItems, setNavigation]);

  return <Routes>{navigationItems.map(NavigationRoute)}</Routes>;
}

function NavigationRoute(route: RouteObject) {
  return (
    <Route key={route.path} path={route.path} element={route.element}>
      {route.children?.map(NavigationRoute)}
    </Route>
  );
}
