import { NavExpandable, NavItem } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { usePageNavBarClick } from '../../framework/PageNav/PageNavSidebar';
import { RouteObj } from '../Routes';
import { CommonSidebar } from '../common/CommonSidebar';
import { isRouteActive } from '../common/Masthead';

export function EventDrivenSidebar() {
  const { t } = useTranslation();
  const location = useLocation();
  const onClick = usePageNavBarClick();
  return (
    <CommonSidebar>
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
          {t('Rule Audit')}
        </NavItem>
        <NavItem
          isActive={isRouteActive(RouteObj.EdaRulebookActivations, location)}
          onClick={() => onClick(RouteObj.EdaRulebookActivations)}
        >
          {t('Rulebook Activations')}
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
          isActive={isRouteActive(RouteObj.EdaDecisionEnvironments, location)}
          onClick={() => onClick(RouteObj.EdaDecisionEnvironments)}
        >
          {t('Decision Environments')}
        </NavItem>

        <NavItem
          isActive={isRouteActive(RouteObj.EdaCredentials, location)}
          onClick={() => onClick(RouteObj.EdaCredentials)}
        >
          {t('Credentials')}
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
