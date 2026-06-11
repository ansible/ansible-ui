import {
  Masthead,
  MastheadBrand,
  MastheadContent,
  MastheadLogo,
  MastheadMain,
  MastheadToggle,
  PageToggleButton,
  Toolbar,
  ToolbarContent,
} from '@patternfly/react-core';
import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { usePageNavSideBar } from '../PageNavigation/PageNavSidebar';

export function PageMasthead(props: { brand: ReactNode; children?: ReactNode }) {
  return (
    <Masthead display={{ default: 'inline' }}>
      <MastheadMain>
        <PageMastheadToggle />
        <MastheadBrand>
          <MastheadLogo
            component={(props: object) => (
              <Link
                {...props}
                to="/"
                style={{ textDecoration: 'none', color: 'light-dark(black, white)' }}
              />
            )}
          >
            {props.brand}
          </MastheadLogo>
        </MastheadBrand>
      </MastheadMain>
      <MastheadContent style={{ marginLeft: 0, minHeight: 0 }}>
        <Toolbar
          id="toolbar"
          data-cy="toolbar"
          data-testid="toolbar"
          inset={{ default: 'insetNone' }}
          style={{ padding: 0 }}
        >
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
      <PageToggleButton
        isHamburgerButton
        data-cy={'nav-toggle'}
        data-testid={'nav-toggle'}
        variant="plain"
        aria-label="Global navigation"
      />
    </MastheadToggle>
  );
}
