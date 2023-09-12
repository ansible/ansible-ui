import { Nav, NavExpandable, NavItem, NavList, PageSidebar } from '@patternfly/react-core';
import { useMemo } from 'react';
import { usePageNavBarClick, usePageNavSideBar } from '../PageNav/PageNavSidebar';

export function PageNavigation(props: { navigationItems: PageNavigationItem[] }) {
  const { navigationItems } = props;
  const navBar = usePageNavSideBar();
  return (
    <PageSidebar
      isNavOpen={navBar.isOpen}
      nav={
        <Nav>
          <NavList>
            <PageNavigationItems baseRoute={''} items={navigationItems} />
          </NavList>
        </Nav>
      }
    />
  );
}

interface PageNavigationGroup {
  label?: string;
  path: string;
  children: PageNavigationItem[];
}

interface PageNavigationComponent {
  id: string;
  label?: string;
  path: string;
  element: JSX.Element;
}

export type PageNavigationItem = PageNavigationGroup | PageNavigationComponent;

export function PageNavigationItems(props: { items: PageNavigationItem[]; baseRoute: string }) {
  return (
    <>
      {props.items.map((item, index) => (
        <PageNavigationItem key={index} item={item} baseRoute={props.baseRoute} />
      ))}
    </>
  );
}

function PageNavigationItem(props: { item: PageNavigationItem; baseRoute: string }) {
  let id: string | undefined;
  if ('id' in props.item) {
    id = props.item.id;
  } else if ('children' in props.item) {
    const rootChild = props.item.children.find((child) => child.path === '');
    if (rootChild && 'id' in rootChild) {
      id = rootChild.id;
    }
  }

  const onClickNavItem = usePageNavBarClick();
  const { item } = props;
  let route = props.baseRoute + '/' + item.path;
  route = route.replace('//', '/');
  if (item.path === '/' && 'children' in item) {
    return <PageNavigationItems items={item.children} baseRoute={''} />;
  } else if (
    'children' in item &&
    item.children.find((child) => child.label !== undefined) !== undefined
  ) {
    if (item.label === undefined) return <></>;
    if (item.label === '') return <PageNavigationItems items={item.children} baseRoute={route} />;
    return (
      <NavExpandable title={item.label} isActive={location.pathname.startsWith(route)} isExpanded>
        <PageNavigationItems items={item.children} baseRoute={route} />
      </NavExpandable>
    );
  } else if ('label' in item) {
    return (
      <NavItem
        id={id}
        isActive={location.pathname.startsWith(route)}
        onClick={() => onClickNavItem(route)}
        data-cy={id}
      >
        {item.label}
      </NavItem>
    );
  }
  return <></>;
}

/** Creates a map of navigation item IDs to their routes. */
export function useNavigationRoutes(navigationItems: PageNavigationItem[]) {
  return useMemo(() => createNavigateToRoutes('', navigationItems), [navigationItems]);
}

function createNavigateToRoutes(base: string, navigationItems: PageNavigationItem[]) {
  const routes: { [key: string]: string } = {};
  navigationItems.forEach((item) => {
    if ('id' in item) {
      routes[item.id] = item.path;
    }
    if ('children' in item) {
      const itemBase = (base + '/' + item.path).replace('//', '/');
      Object.assign(routes, createNavigateToRoutes(itemBase, item.children));
    }
  });
  return routes;
}
