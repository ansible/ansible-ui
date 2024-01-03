import {
  Masthead,
  MastheadBrand,
  MastheadContent,
  MastheadMain,
  MastheadToggle,
  PageToggleButton,
  Toolbar,
  ToolbarContent,
} from '@patternfly/react-core';
import { BarsIcon } from '@patternfly/react-icons';
import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { usePageNavSideBar } from '../PageNavigation/PageNavSidebar';
import { useBreakpoint } from '../components/useBreakPoint';

export function PageMasthead(props: { brand: ReactNode; children?: ReactNode }) {
  const isSmallOrLarger = useBreakpoint('sm');
  return (
    <Masthead
      display={{ default: 'inline' }}
      style={{
        borderBottom: '1px solid #fff4',
        paddingRight: 0,
      }}
    >
      <PageMastheadToggle />
      {isSmallOrLarger && (
        <MastheadMain>
          <MastheadBrand component={(props) => <Link {...props} to="/" />}>
            {props.brand}
          </MastheadBrand>
        </MastheadMain>
      )}
      <MastheadContent style={{ marginLeft: 0, minHeight: 0 }}>
        <Toolbar
          id="toolbar"
          data-cy="toolbar"
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
      <PageToggleButton data-cy={'nav-toggle'} variant="plain" aria-label="Global navigation">
        <BarsIcon />
      </PageToggleButton>
    </MastheadToggle>
  );
}
