import { Nav, NavExpandable, NavItem, NavList, PageSidebar } from '@patternfly/react-core';
import { useState } from 'react';
import { usePageNavBarClick, usePageNavSideBar } from './PageNavSidebar';
import './PageNavigation.css';
import { PageNavigationItem } from './PageNavigationItem';

/** Renders a sidebar navigation menu from an arroy of navigation items. */
export function PageNavigation(props: { navigation: PageNavigationItem[] }) {
  const { navigation: navigationItems } = props;
  const navBar = usePageNavSideBar();
  return (
    <>
      <PageSidebar
        isNavOpen={navBar.isOpen}
        nav={
          <Nav data-cy="page-navigation" className="side-nav">
            <NavList>
              <PageNavigationItems baseRoute={''} items={navigationItems} />
            </NavList>
          </Nav>
        }
      />
    </>
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
  const { item } = props;
  const [isExpanded, setIsExpanded] = useState(
    () => localStorage.getItem((item.id ?? item.label) + '-expanded') !== 'false'
  );
  const setExpanded = (expanded: boolean) => {
    setIsExpanded(expanded);
    localStorage.setItem((item.id ?? item.label) + '-expanded', expanded ? 'true' : 'false');
  };

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
      <NavExpandable
        title={item.label}
        isActive={location.pathname.startsWith(route)}
        isExpanded={isExpanded}
        onExpand={(_e, expanded: boolean) => setExpanded(expanded)}
      >
        <PageNavigationItems items={item.children} baseRoute={route} />
      </NavExpandable>
    );
  } else if ('label' in item) {
    return (
      <NavItem
        id={id}
        href={route}
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
