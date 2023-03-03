import { NavExpandable, NavItem } from '@patternfly/react-core';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { useBreakpoint } from '../../framework';
import { CommonSidebar } from '../common/CommonSidebar';
import { isRouteActive } from '../common/Masthead';
import { RouteObj, RouteType } from '../Routes';

export function HubSidebar(props: { isNavOpen: boolean; setNavOpen: (open: boolean) => void }) {
  const { isNavOpen, setNavOpen } = props;
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const isXl = useBreakpoint('xl');
  const onClick = useCallback(
    (route: RouteType) => {
      navigate(route);
      if (!isXl) setNavOpen(false);
    },
    [navigate, isXl, setNavOpen]
  );
  return (
    <CommonSidebar isNavOpen={isNavOpen} setNavOpen={setNavOpen}>
      <NavItem
        isActive={isRouteActive(RouteObj.HubDashboard, location)}
        onClick={() => onClick(RouteObj.HubDashboard)}
      >
        {t('Dashboard')}
      </NavItem>
      <NavExpandable
        key="automation-content"
        title={t('Automation Content')}
        isExpanded
        isActive={isRouteActive(
          [RouteObj.Collections, RouteObj.Namespaces, RouteObj.Repositories],
          location
        )}
      >
        <NavItem
          isActive={isRouteActive(RouteObj.Namespaces, location)}
          onClick={() => onClick(RouteObj.Namespaces)}
        >
          {t('Namespaces')}
        </NavItem>
        <NavItem
          isActive={isRouteActive(RouteObj.Collections, location)}
          onClick={() => onClick(RouteObj.Collections)}
        >
          {t('Collections')}
        </NavItem>
        <NavItem
          isActive={isRouteActive(RouteObj.HubExecutionEnvironments, location)}
          onClick={() => onClick(RouteObj.HubExecutionEnvironments)}
        >
          {t('Execution environments')}
        </NavItem>
        <NavItem
          isActive={isRouteActive(RouteObj.SignatureKeys, location)}
          onClick={() => onClick(RouteObj.SignatureKeys)}
        >
          {t('Signature keys')}
        </NavItem>
      </NavExpandable>
      <NavExpandable
        key="administration"
        title={t('Administration')}
        isExpanded
        isActive={isRouteActive(
          [RouteObj.HubExecutionEnvironments, RouteObj.RemoteRegistries],
          location
        )}
      >
        <NavItem
          isActive={isRouteActive(RouteObj.Repositories, location)}
          onClick={() => onClick(RouteObj.Repositories)}
        >
          {t('Repositories')}
        </NavItem>
        <NavItem
          isActive={isRouteActive(RouteObj.RemoteRegistries, location)}
          onClick={() => onClick(RouteObj.RemoteRegistries)}
        >
          {t('Remote registries')}
        </NavItem>
        <NavItem
          isActive={isRouteActive(RouteObj.Tasks, location)}
          onClick={() => onClick(RouteObj.Tasks)}
        >
          {t('Tasks')}
        </NavItem>
        <NavItem
          isActive={isRouteActive(RouteObj.Approvals, location)}
          onClick={() => onClick(RouteObj.Approvals)}
        >
          {t('Approvals')}
        </NavItem>
      </NavExpandable>

      <NavExpandable
        key="access"
        title={t('Access')}
        isExpanded
        isActive={isRouteActive(
          [RouteObj.HubExecutionEnvironments, RouteObj.RemoteRegistries],
          location
        )}
      >
        <NavItem
          isActive={isRouteActive(RouteObj.APIToken, location)}
          onClick={() => onClick(RouteObj.APIToken)}
        >
          {t('API token')}
        </NavItem>
      </NavExpandable>
    </CommonSidebar>
  );
}
