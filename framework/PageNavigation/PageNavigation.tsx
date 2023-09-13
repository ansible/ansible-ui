import { Nav, NavExpandable, NavItem, NavList, PageSidebar } from '@patternfly/react-core';
import { usePageNavBarClick, usePageNavSideBar } from './PageNavSidebar';
import { PageNavigationItem } from './PageNavigationItem';

/** Renders a sidebar navigation menu from an arroy of navigation items. */
export function PageNavigation(props: { navigation: PageNavigationItem[] }) {
  const { navigation: navigationItems } = props;
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

function PageNavigationItems(props: { items: PageNavigationItem[]; baseRoute: string }) {
  return (
    <>
      {props.items.map((item, index) => (
        <PageNavigationItemComponent key={index} item={item} baseRoute={props.baseRoute} />
      ))}
    </>
  );
}

function PageNavigationItemComponent(props: { item: PageNavigationItem; baseRoute: string }) {
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
