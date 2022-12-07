import { NavExpandable, NavItem } from '@patternfly/react-core';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { useBreakpoint } from '../../framework';
import { CommonSidebar } from '../common/CommonSidebar';
import { isRouteActive } from '../common/Masthead';
import { RouteE } from '../Routes';

export function HubSidebar(props: { isNavOpen: boolean; setNavOpen: (open: boolean) => void }) {
  const { isNavOpen, setNavOpen } = props;
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const isXl = useBreakpoint('xl');
  const onClick = useCallback(
    (route: RouteE) => {
      navigate(route);
      if (!isXl) setNavOpen(false);
    },
    [navigate, isXl, setNavOpen]
  );
  return (
    <CommonSidebar isNavOpen={isNavOpen} setNavOpen={setNavOpen}>
      <NavItem
        isActive={isRouteActive(RouteE.HubDashboard, location)}
        onClick={() => onClick(RouteE.HubDashboard)}
      >
        {t('Dashboard')}
      </NavItem>
      <NavExpandable
        key="automation-content"
        title={t('Automation Content')}
        isExpanded
        isActive={isRouteActive(
          [RouteE.Collections, RouteE.Namespaces, RouteE.Repositories],
          location
        )}
      >
        <NavItem
          isActive={isRouteActive(RouteE.Namespaces, location)}
          onClick={() => onClick(RouteE.Namespaces)}
        >
          {t('Namespaces')}
        </NavItem>
        <NavItem
          isActive={isRouteActive(RouteE.Collections, location)}
          onClick={() => onClick(RouteE.Collections)}
        >
          {t('Collections')}
        </NavItem>
        <NavItem
          isActive={isRouteActive(RouteE.HubExecutionEnvironments, location)}
          onClick={() => onClick(RouteE.HubExecutionEnvironments)}
        >
          {t('Execution environments')}
        </NavItem>
        <NavItem
          isActive={isRouteActive(RouteE.SignatureKeys, location)}
          onClick={() => onClick(RouteE.SignatureKeys)}
        >
          {t('Signature keys')}
        </NavItem>
      </NavExpandable>
      <NavExpandable
        key="administration"
        title={t('Administration')}
        isExpanded
        isActive={isRouteActive(
          [RouteE.HubExecutionEnvironments, RouteE.RemoteRegistries],
          location
        )}
      >
        <NavItem
          isActive={isRouteActive(RouteE.Repositories, location)}
          onClick={() => onClick(RouteE.Repositories)}
        >
          {t('Repositories')}
        </NavItem>
        <NavItem
          isActive={isRouteActive(RouteE.RemoteRegistries, location)}
          onClick={() => onClick(RouteE.RemoteRegistries)}
        >
          {t('Remote registries')}
        </NavItem>
        <NavItem
          isActive={isRouteActive(RouteE.Tasks, location)}
          onClick={() => onClick(RouteE.Tasks)}
        >
          {t('Tasks')}
        </NavItem>
        <NavItem
          isActive={isRouteActive(RouteE.Approvals, location)}
          onClick={() => onClick(RouteE.Approvals)}
        >
          {t('Approvals')}
        </NavItem>
      </NavExpandable>

      <NavExpandable
        key="access"
        title={t('Access')}
        isExpanded
        isActive={isRouteActive(
          [RouteE.HubExecutionEnvironments, RouteE.RemoteRegistries],
          location
        )}
      >
        <NavItem
          isActive={isRouteActive(RouteE.APIToken, location)}
          onClick={() => onClick(RouteE.APIToken)}
        >
          {t('API token')}
        </NavItem>
      </NavExpandable>
    </CommonSidebar>
  );
}
