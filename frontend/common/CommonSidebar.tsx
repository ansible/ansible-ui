import { Nav, NavItem, NavItemSeparator, NavList, PageSidebar } from '@patternfly/react-core';
import { ReactNode, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { useBreakpoint } from '../../framework';
import { AutomationServerSwitcher } from '../automation-servers/components/AutomationServerSwitcher';
import { useAutomationServers } from '../automation-servers/contexts/AutomationServerProvider';
import { AutomationServerType } from '../automation-servers/interfaces/AutomationServerType';
import { RouteE } from '../Routes';
import { isRouteActive } from './Masthead';
import { shouldShowAutmationServers } from './should-show-autmation-servers';

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

  const { showAutomationServers } = shouldShowAutmationServers();

  return (
    <PageSidebar
      isNavOpen={isNavOpen}
      nav={
        <Nav>
          <NavList>
            {showAutomationServers && (
              <>
                <NavItemSeparator style={{ margin: 0 }} />
                <NavItem
                  isActive={isRouteActive(
                    automationServer?.type === AutomationServerType.AWX
                      ? RouteE.AwxAutomationServers
                      : automationServer?.type === AutomationServerType.Galaxy
                      ? RouteE.HubAutomationServers
                      : automationServer?.type === AutomationServerType.EDA
                      ? RouteE.EdaAutomationServers
                      : RouteE.AutomationServers,
                    location
                  )}
                  onClick={() =>
                    onClick(
                      automationServer?.type === AutomationServerType.AWX
                        ? RouteE.AwxAutomationServers
                        : automationServer?.type === AutomationServerType.Galaxy
                        ? RouteE.HubAutomationServers
                        : automationServer?.type === AutomationServerType.EDA
                        ? RouteE.EdaAutomationServers
                        : RouteE.AutomationServers
                    )
                  }
                >
                  {t('Automation Servers')}
                </NavItem>
                <AutomationServerSwitcher />
              </>
            )}
            <NavItemSeparator style={{ margin: 0 }} />
            {props.children}
          </NavList>
        </Nav>
      }
    />
  );
}
