import { usePageNavSideBar } from '@ansible/ansible-ui-framework/PageNavigation/PageNavSidebar';
import {
  Nav,
  NavItemSeparator,
  NavList,
  PageSidebar,
  PageSidebarBody,
} from '@patternfly/react-core';
import { ReactNode } from 'react';

export function CommonSidebar(props: { children?: ReactNode }) {
  const navBar = usePageNavSideBar();
  return (
    <PageSidebar isSidebarOpen={navBar.isOpen}>
      <PageSidebarBody>
        <Nav>
          <NavList>
            <NavItemSeparator style={{ margin: 0 }} />
            {props.children}
          </NavList>
        </Nav>
      </PageSidebarBody>
    </PageSidebar>
  );
}
