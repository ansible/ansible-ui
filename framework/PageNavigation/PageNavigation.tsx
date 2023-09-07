import { Nav, NavExpandable, NavItem, NavList, PageSidebar } from '@patternfly/react-core';
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
  label?: string;
  path: string;
  element: JSX.Element;
}

export type PageNavigationItem = PageNavigationGroup | PageNavigationComponent;

export function PageNavigationItems(props: { items: PageNavigationItem[]; baseRoute: string }) {
  return (
    <>
      {props.items.map((item) => (
        <PageNavigationItem key={item.path} item={item} baseRoute={props.baseRoute} />
      ))}
    </>
  );
}

function PageNavigationItem(props: { item: PageNavigationItem; baseRoute: string }) {
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
      <NavItem isActive={location.pathname.startsWith(route)} onClick={() => onClickNavItem(route)}>
        {item.label}
      </NavItem>
    );
  }
  return <></>;
}
