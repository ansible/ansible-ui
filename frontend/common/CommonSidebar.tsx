import { Nav, NavItem, NavItemSeparator, NavList, PageSidebar } from '@patternfly/react-core';
import { ReactNode, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { useBreakpoint } from '../../framework';
import { useAutomationServers } from '../automation-servers/AutomationServerProvider';
import { AutomationServerSwitcher } from '../automation-servers/AutomationServerSwitcher';
import { RouteE } from '../Routes';
import { isRouteActive } from './Masthead';

export function CommonSidebar(props: {
  isNavOpen: boolean;
  setNavOpen: (open: boolean) => void;
  children?: ReactNode;
}) {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { automationServer } = useAutomationServers();

  const isXl = useBreakpoint('xl');
  const { isNavOpen, setNavOpen } = props;
  const onClick = useCallback(
    (route: RouteE) => {
      navigate(route);
      if (!isXl) {
        setNavOpen(false);
      }
    },
    [navigate, isXl, setNavOpen]
  );
  return (
    <PageSidebar
      isNavOpen={isNavOpen}
      nav={
        <Nav>
          <NavList>
            <NavItemSeparator style={{ margin: 0 }} />
            <NavItem
              isActive={isRouteActive(
                automationServer?.type === 'controller'
                  ? RouteE.ControllerAutomationServers
                  : automationServer?.type === 'hub'
                  ? RouteE.HubAutomationServers
                  : automationServer?.type === 'eda'
                  ? RouteE.EdaAutomationServers
                  : RouteE.AutomationServers,
                location
              )}
              onClick={() =>
                onClick(
                  automationServer?.type === 'controller'
                    ? RouteE.ControllerAutomationServers
                    : automationServer?.type === 'hub'
                    ? RouteE.HubAutomationServers
                    : automationServer?.type === 'eda'
                    ? RouteE.EdaAutomationServers
                    : RouteE.AutomationServers
                )
              }
            >
              {t('Automation Servers')}
            </NavItem>
            <AutomationServerSwitcher />
            <NavItemSeparator style={{ margin: 0 }} />
            {props.children}
          </NavList>
        </Nav>
      }
    />
  );
}
