import {
  Masthead,
  MastheadMain,
  MastheadToggle,
  PageToggleButton,
  Title,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from '@patternfly/react-core';
import { BarsIcon } from '@patternfly/react-icons';
import { Children, ReactNode } from 'react';
import { usePageNavSideBar } from './PageNav/PageNavSidebar';

export function PageMasthead(props: { title: string; brand?: string; children?: ReactNode }) {
  return (
    <Masthead>
      <PageMastheadToggle />
      <MastheadMain>
        <Title headingLevel="h1" style={{ fontWeight: 'bold', lineHeight: 1.2 }}>
          {props.title}
        </Title>
      </MastheadMain>
      <Toolbar id="toolbar" style={{ padding: 0 }}>
        <ToolbarContent>
          <div style={{ flexGrow: 1 }} />
          {Children.toArray(props.children).map((child, index) => (
            <ToolbarItem key={index}>{child}</ToolbarItem>
          ))}
        </ToolbarContent>
      </Toolbar>
    </Masthead>
  );
}

export function PageMastheadToggle() {
  const navBar = usePageNavSideBar();
  return (
    <MastheadToggle onClick={() => navBar.setState({ isOpen: !navBar.isOpen })}>
      <PageToggleButton variant="plain" aria-label="Global navigation">
        <BarsIcon />
      </PageToggleButton>
    </MastheadToggle>
  );
}
