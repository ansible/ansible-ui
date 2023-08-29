import { Nav, NavItemSeparator, NavList, PageSidebar } from '@patternfly/react-core';
import { ReactNode } from 'react';
import { usePageNavSideBar } from '../../framework/PageNav/PageNavSidebar';

export function CommonSidebar(props: { children?: ReactNode }) {
  const navBar = usePageNavSideBar();
  return (
    <PageSidebar
      isNavOpen={navBar.isOpen}
      nav={
        <Nav>
          <NavList>
            <NavItemSeparator style={{ margin: 0 }} />
            {props.children}
          </NavList>
        </Nav>
      }
    />
  );
}
