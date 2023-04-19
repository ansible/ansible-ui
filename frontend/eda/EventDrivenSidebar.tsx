import { NavExpandable, NavItem } from '@patternfly/react-core';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { useBreakpoint } from '../../framework';
import { CommonSidebar } from '../common/CommonSidebar';
import { isRouteActive } from '../common/Masthead';
import { RouteObj, RouteType } from '../Routes';

export function EventDrivenSidebar(props: {
  isNavOpen: boolean;
  setNavOpen: (open: boolean) => void;
}) {
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
        isActive={isRouteActive(RouteObj.EdaDashboard, location)}
        onClick={() => onClick(RouteObj.EdaDashboard)}
      >
        {t('Dashboard')}
      </NavItem>
      <NavExpandable
        key="views"
        title={t('Views')}
        isExpanded
        isActive={isRouteActive([RouteObj.EdaRuleAudit, RouteObj.EdaRulebookActivations], location)}
      >
        <NavItem
          isActive={isRouteActive(RouteObj.EdaRuleAudit, location)}
          onClick={() => onClick(RouteObj.EdaRuleAudit)}
        >
          {t('Rule audit')}
        </NavItem>
        <NavItem
          isActive={isRouteActive(RouteObj.EdaRulebookActivations, location)}
          onClick={() => onClick(RouteObj.EdaRulebookActivations)}
        >
          {t('Rulebook activations')}
        </NavItem>
      </NavExpandable>
      <NavExpandable
        key="resources"
        title={t('Resources')}
        isExpanded
        isActive={isRouteActive(
          [RouteObj.EdaProjects, RouteObj.EdaProjects, RouteObj.EdaDecisionEnvironments],
          location
        )}
      >
        <NavItem
          isActive={isRouteActive(RouteObj.EdaProjects, location)}
          onClick={() => onClick(RouteObj.EdaProjects)}
        >
          {t('Projects')}
        </NavItem>
        <NavItem
          isActive={isRouteActive(RouteObj.EdaCredentials, location)}
          onClick={() => onClick(RouteObj.EdaCredentials)}
        >
          {t('Credentials')}
        </NavItem>
        <NavItem
          isActive={isRouteActive(RouteObj.EdaDecisionEnvironments, location)}
          onClick={() => onClick(RouteObj.EdaDecisionEnvironments)}
        >
          {t('Decision environments')}
        </NavItem>
      </NavExpandable>
      <NavExpandable
        key="user"
        title={t('User Access')}
        isExpanded
        isActive={isRouteActive([RouteObj.EdaUsers, RouteObj.EdaRoles], location)}
      >
        <NavItem
          isActive={isRouteActive(RouteObj.EdaUsers, location)}
          onClick={() => onClick(RouteObj.EdaUsers)}
        >
          {t('Users')}
        </NavItem>
        <NavItem
          isActive={isRouteActive(RouteObj.EdaRoles, location)}
          onClick={() => onClick(RouteObj.EdaRoles)}
        >
          {t('Roles')}
        </NavItem>
      </NavExpandable>
    </CommonSidebar>
  );
}
