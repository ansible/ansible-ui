import { NavExpandable, NavItem } from '@patternfly/react-core';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { useBreakpoint } from '../../framework';
import { CommonSidebar } from '../common/CommonSidebar';
import { isRouteActive } from '../common/Masthead';
import { RouteE } from '../Routes';

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
    (route: RouteE) => {
      navigate(route);
      if (!isXl) setNavOpen(false);
    },
    [navigate, isXl, setNavOpen]
  );
  return (
    <CommonSidebar isNavOpen={isNavOpen} setNavOpen={setNavOpen}>
      <NavItem
        isActive={isRouteActive(RouteE.EdaDashboard, location)}
        onClick={() => onClick(RouteE.EdaDashboard)}
      >
        {t('Dashboard')}
      </NavItem>
      <NavExpandable
        key="resources"
        title={t('Resources')}
        isExpanded
        isActive={isRouteActive(
          [RouteE.EdaProjects, RouteE.EdaExecutionEnvironments, RouteE.EdaInventories],
          location
        )}
      >
        <NavItem
          isActive={isRouteActive(RouteE.EdaProjects, location)}
          onClick={() => onClick(RouteE.EdaProjects)}
        >
          {t('Projects')}
        </NavItem>
        <NavItem
          isActive={isRouteActive(RouteE.EdaExecutionEnvironments, location)}
          onClick={() => onClick(RouteE.EdaExecutionEnvironments)}
        >
          {t('Execution environments')}
        </NavItem>
        <NavItem
          isActive={isRouteActive(RouteE.EdaInventories, location)}
          onClick={() => onClick(RouteE.EdaInventories)}
        >
          {t('Inventories')}
        </NavItem>
      </NavExpandable>
      <NavExpandable
        key="views"
        title={t('Views')}
        isExpanded
        isActive={isRouteActive([RouteE.EdaActions, RouteE.EdaRulebookActivations], location)}
      >
        <NavItem
          isActive={isRouteActive(RouteE.EdaActions, location)}
          onClick={() => onClick(RouteE.EdaActions)}
        >
          {t('Actions')}
        </NavItem>
        <NavItem
          isActive={isRouteActive(RouteE.EdaRulebookActivations, location)}
          onClick={() => onClick(RouteE.EdaRulebookActivations)}
        >
          {t('Rulebook activations')}
        </NavItem>
      </NavExpandable>
      <NavItem
        isActive={isRouteActive(RouteE.EdaActivities, location)}
        onClick={() => onClick(RouteE.EdaActivities)}
      >
        {t('Activities')}
      </NavItem>
      <NavItem
        isActive={isRouteActive(RouteE.EdaRulebooks, location)}
        onClick={() => onClick(RouteE.EdaRulebooks)}
      >
        {t('Rulebooks')}
      </NavItem>
      <NavItem
        isActive={isRouteActive(RouteE.EdaRules, location)}
        onClick={() => onClick(RouteE.EdaRules)}
      >
        {t('Rules')}
      </NavItem>
      <NavExpandable
        key="user"
        title={t('User Access')}
        isExpanded
        isActive={isRouteActive([RouteE.EdaUsers, RouteE.EdaGroups, RouteE.EdaRoles], location)}
      >
        <NavItem
          isActive={isRouteActive(RouteE.EdaUsers, location)}
          onClick={() => onClick(RouteE.EdaUsers)}
        >
          {t('Users')}
        </NavItem>
        <NavItem
          isActive={isRouteActive(RouteE.EdaGroups, location)}
          onClick={() => onClick(RouteE.EdaGroups)}
        >
          {t('Groups')}
        </NavItem>
        <NavItem
          isActive={isRouteActive(RouteE.EdaRoles, location)}
          onClick={() => onClick(RouteE.EdaRoles)}
        >
          {t('Roles')}
        </NavItem>
      </NavExpandable>
    </CommonSidebar>
  );
}
