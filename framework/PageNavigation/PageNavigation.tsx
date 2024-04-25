import {
  Flex,
  FlexItem,
  Label,
  Nav,
  NavExpandable,
  NavItem,
  NavList,
  PageSidebar,
  PageSidebarBody,
} from '@patternfly/react-core';
import { useState } from 'react';
import { usePageNavBarClick, usePageNavSideBar } from './PageNavSidebar';
import './PageNavigation.css';
import { PageNavigationItem } from './PageNavigationItem';

/** Renders a sidebar navigation menu from an arroy of navigation items. */
export function PageNavigation(props: { navigation: PageNavigationItem[]; basename?: string }) {
  const { navigation: navigationItems } = props;
  const navBar = usePageNavSideBar();

  return (
    <PageSidebar isSidebarOpen={navBar.isOpen} className="bg-lighten">
      <PageSidebarBody>
        <Nav data-cy="page-navigation" className="side-nav">
          <NavList>
            <PageNavigationItems baseRoute={props.basename ?? ''} items={navigationItems} />
          </NavList>
        </Nav>
      </PageSidebarBody>
    </PageSidebar>
  );
}

function PageNavigationItems(props: { items: PageNavigationItem[]; baseRoute: string }) {
  return (
    <>
      {props.items
        .filter((item) => {
          if ('hidden' in item) {
            return item.hidden !== true;
          }
          return true;
        })
        .map((item, index) => (
          <PageNavigationItemComponent
            key={item.id ?? item.label ?? index}
            item={item}
            baseRoute={props.baseRoute}
          />
        ))}
    </>
  );
}

function PageNavigationItemComponent(props: { item: PageNavigationItem; baseRoute: string }) {
  const { item } = props;
  const [isExpanded, setIsExpanded] = useState(
    () =>
      localStorage.getItem('default-nav-expanded') === 'true' ||
      localStorage.getItem((item.id ?? item.label) + '-expanded') === 'true'
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
  }

  const hasChildNavItems = 'children' in item && item.children?.find((child) => child.label);

  if (!hasChildNavItems && 'label' in item) {
    let path = (process.env?.ROUTE_PREFIX ?? '') + route;
    path = path.replace('//', '/');

    const isActive = location.pathname.startsWith(path);
    return (
      <NavItem
        id={id}
        href={route}
        isActive={isActive}
        className={isActive ? 'bg-lighten' : undefined}
        onClick={() => onClickNavItem(route)}
        data-cy={id}
        style={{ display: 'flex', alignItems: 'stretch', flexDirection: 'column' }}
      >
        <Flex>
          <FlexItem grow={{ default: 'grow' }}>{item.label}</FlexItem>
          {'badge' in item && item.badge && (
            <FlexItem>
              <Label isCompact variant="outline" color={item.badgeColor}>
                {item.badge}
              </Label>
            </FlexItem>
          )}
        </Flex>
        {item.subtitle && (
          <div style={{ fontSize: 'x-small', opacity: 0.5, textAlign: 'left' }}>
            {item.subtitle}
          </div>
        )}
      </NavItem>
    );
  }

  if (!hasChildNavItems || item.label === undefined) {
    return null;
  }

  if (!item.label) {
    return <PageNavigationItems items={item.children} baseRoute={route} />;
  }

  return (
    <NavExpandable
      title={
        (
          <div>
            <div style={{ textAlign: 'left' }}>{item.label}</div>
            {item.subtitle && (
              <div style={{ fontSize: 'small', opacity: 0.5, textAlign: 'left' }}>
                {item.subtitle}
              </div>
            )}
          </div>
        ) as unknown as string
      }
      isExpanded={isExpanded}
      onExpand={(_e, expanded: boolean) => setExpanded(expanded)}
    >
      <PageNavigationItems items={item.children} baseRoute={route} />
    </NavExpandable>
  );
}
