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
import styled from 'styled-components';

const ToolbarSpacingDiv = styled.div`
  flex-grow: 1;
`;

const StyledToolbar = styled(Toolbar)`
  padding: 0px;
`;

export function PageMasthead(props: { title: string; brand?: string; children?: ReactNode }) {
  return (
    <Masthead>
      <PageMastheadToggle />
      <MastheadMain>
        <Title headingLevel="h1" style={{ fontWeight: 'bold', lineHeight: 1.2 }}>
          {props.title}
        </Title>
      </MastheadMain>
      <StyledToolbar id="toolbar">
        <ToolbarContent>
          <ToolbarSpacingDiv />
          {Children.toArray(props.children).map((child, index) => (
            <ToolbarItem key={index}>{child}</ToolbarItem>
          ))}
        </ToolbarContent>
      </StyledToolbar>
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
