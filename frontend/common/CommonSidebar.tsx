import { Nav, NavItem, NavItemSeparator, NavList, PageSidebar } from '@patternfly/react-core';
import { ReactNode, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { useBreakpoint } from '../../framework';
import { RouteObj, RouteType } from '../Routes';
import { AutomationServerSwitcher } from '../automation-servers/components/AutomationServerSwitcher';
import { useAutomationServers } from '../automation-servers/contexts/AutomationServerProvider';
import { AutomationServerType } from '../automation-servers/interfaces/AutomationServerType';
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
    (route: RouteType) => {
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
                      ? RouteObj.AwxAutomationServers
                      : automationServer?.type === AutomationServerType.HUB
                      ? RouteObj.HubAutomationServers
                      : automationServer?.type === AutomationServerType.EDA
                      ? RouteObj.EdaAutomationServers
                      : RouteObj.AutomationServers,
                    location
                  )}
                  onClick={() =>
                    onClick(
                      automationServer?.type === AutomationServerType.AWX
                        ? RouteObj.AwxAutomationServers
                        : automationServer?.type === AutomationServerType.HUB
                        ? RouteObj.HubAutomationServers
                        : automationServer?.type === AutomationServerType.EDA
                        ? RouteObj.EdaAutomationServers
                        : RouteObj.AutomationServers
                    )
                  }
                >
                  {t('Automation servers')}
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
