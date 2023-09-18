import {
  Masthead,
  MastheadBrand,
  MastheadContent,
  MastheadMain,
  MastheadToggle,
  PageToggleButton,
  Stack,
  Text,
  Title,
  Toolbar,
  ToolbarContent,
  Truncate,
} from '@patternfly/react-core';
import { BarsIcon } from '@patternfly/react-icons';
import { ReactNode } from 'react';
import { usePageNavSideBar } from '../PageNavigation/PageNavSidebar';

export function PageMasthead(props: {
  icon?: ReactNode;
  brand?: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <Masthead display={{ default: 'inline' }}>
      <PageMastheadToggle />
      <MastheadMain>
        <MastheadBrand style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {props.icon}
          <Stack style={{ color: 'white', cursor: 'default' }}>
            {props.brand && (
              <Text>
                <Truncate content={props.brand} style={{ minWidth: 0 }} />
              </Text>
            )}
            <Title headingLevel="h1" style={{ lineHeight: 1 }}>
              <Truncate content={props.title} style={{ minWidth: 0 }} />
            </Title>
          </Stack>
        </MastheadBrand>
      </MastheadMain>
      <MastheadContent>
        <Toolbar id="toolbar">
          <ToolbarContent>{props.children}</ToolbarContent>
        </Toolbar>
      </MastheadContent>
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
