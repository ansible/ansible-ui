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
  ToolbarItem,
  Truncate,
} from '@patternfly/react-core';
import { BarsIcon } from '@patternfly/react-icons';
import { ReactNode } from 'react';
import { usePageNavSideBar } from '../PageNavigation/PageNavSidebar';
import { useBreakpoint } from '../components/useBreakPoint';

export function PageMasthead(props: {
  icon?: ReactNode;
  brand?: string;
  title: string;
  children?: ReactNode;
}) {
  const isSmallOrLarger = useBreakpoint('sm');
  return (
    <Masthead display={{ default: 'inline' }}>
      <PageMastheadToggle />
      <MastheadMain>
        <MastheadBrand>{props.icon}</MastheadBrand>
      </MastheadMain>
      <MastheadContent style={{ marginLeft: 0 }}>
        <Toolbar id="toolbar" inset={{ default: 'insetNone' }}>
          <ToolbarContent>
            {isSmallOrLarger && (
              <ToolbarItem>
                <Stack
                  style={{ color: 'white', cursor: 'default', marginTop: -2, marginBottom: -2 }}
                >
                  {props.brand && (
                    <Text style={{ marginTop: -6 }}>
                      <Truncate content={props.brand} style={{ minWidth: 0 }} />
                    </Text>
                  )}
                  <Title headingLevel="h1" style={{ lineHeight: 1 }}>
                    <Truncate content={props.title} style={{ minWidth: 0 }} />
                  </Title>
                </Stack>
              </ToolbarItem>
            )}
            {props.children}
          </ToolbarContent>
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
