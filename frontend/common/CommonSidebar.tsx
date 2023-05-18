import { Nav, NavItem, NavItemSeparator, NavList, PageSidebar } from '@patternfly/react-core';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { usePageNavBarClick, usePageNavSideBar } from '../../framework/PageNav/PageNavSidebar';
import { RouteObj } from '../Routes';
import { AutomationServerSwitcher } from '../automation-servers/components/AutomationServerSwitcher';
import { useAutomationServers } from '../automation-servers/contexts/AutomationServerProvider';
import { AutomationServerType } from '../automation-servers/interfaces/AutomationServerType';
import { isRouteActive } from './Masthead';
import { shouldShowAutmationServers } from './should-show-autmation-servers';

export function CommonSidebar(props: { children?: ReactNode }) {
  const { t } = useTranslation();
  const location = useLocation();
  const { automationServer } = useAutomationServers();
  const navBar = usePageNavSideBar();
  const onClick = usePageNavBarClick();
  const { showAutomationServers } = shouldShowAutmationServers();
  return (
    <PageSidebar
      isNavOpen={navBar.isOpen}
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
