import { NavExpandable, NavItem } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { usePageNavBarClick } from '../../framework/PageNav/PageNavSidebar';
import { RouteObj } from '../Routes';
import { CommonSidebar } from '../common/CommonSidebar';
import { isRouteActive } from '../common/Masthead';
import { useActiveUser } from '../common/useActiveUser';

export function AwxSidebar() {
  const { t } = useTranslation();
  const location = useLocation();
  const onClick = usePageNavBarClick();
  const activeUser = useActiveUser();

  return (
    <CommonSidebar>
      <NavExpandable
        key="views"
        title={t('Views')}
        isExpanded
        isActive={isRouteActive([RouteObj.Dashboard, RouteObj.Jobs], location)}
      >
        <NavItem
          isActive={isRouteActive(RouteObj.Dashboard, location)}
          onClick={() => onClick(RouteObj.Dashboard)}
        >
          {t('Dashboard')}
        </NavItem>
        <NavItem
          isActive={isRouteActive(RouteObj.Jobs, location)}
          onClick={() => onClick(RouteObj.Jobs)}
        >
          {t('Jobs')}
        </NavItem>
        <NavItem
          isActive={isRouteActive(RouteObj.Schedules, location)}
          onClick={() => onClick(RouteObj.Schedules)}
        >
          {t('Schedules')}
        </NavItem>
        <NavItem
          isActive={isRouteActive(RouteObj.ActivityStream, location)}
          onClick={() => onClick(RouteObj.ActivityStream)}
        >
          {t('Activity Stream')}
        </NavItem>
        <NavItem
          isActive={isRouteActive(RouteObj.WorkflowApprovals, location)}
          onClick={() => onClick(RouteObj.WorkflowApprovals)}
        >
          {t('Workflow Approvals')}
        </NavItem>
      </NavExpandable>
      <NavExpandable
        key="resources"
        title={t('Resources')}
        isExpanded
        isActive={isRouteActive(
          [
            RouteObj.Templates,
            RouteObj.Credentials,
            RouteObj.Projects,
            RouteObj.Inventories,
            RouteObj.Hosts,
          ],
          location
        )}
      >
        <NavItem
          isActive={isRouteActive(RouteObj.Templates, location)}
          onClick={() => onClick(RouteObj.Templates)}
        >
          {t('Templates')}
        </NavItem>
        <NavItem
          isActive={isRouteActive(RouteObj.Credentials, location)}
          onClick={() => onClick(RouteObj.Credentials)}
        >
          {t('Credentials')}
        </NavItem>
        <NavItem
          isActive={isRouteActive(RouteObj.Projects, location)}
          onClick={() => onClick(RouteObj.Projects)}
        >
          {t('Projects')}
        </NavItem>
        <NavItem
          isActive={isRouteActive(RouteObj.Inventories, location)}
          onClick={() => onClick(RouteObj.Inventories)}
        >
          {t('Inventories')}
        </NavItem>
        <NavItem
          isActive={isRouteActive(RouteObj.Hosts, location)}
          onClick={() => onClick(RouteObj.Hosts)}
        >
          {t('Hosts')}
        </NavItem>
      </NavExpandable>
      <NavExpandable
        key="access"
        title={t('Access')}
        isExpanded
        isActive={isRouteActive([RouteObj.Organizations, RouteObj.Users, RouteObj.Teams], location)}
      >
        <NavItem
          isActive={isRouteActive(RouteObj.Organizations, location)}
          onClick={() => onClick(RouteObj.Organizations)}
        >
          {t('Organizations')}
        </NavItem>
        <NavItem
          isActive={isRouteActive(RouteObj.Teams, location)}
          onClick={() => onClick(RouteObj.Teams)}
        >
          {t('Teams')}
        </NavItem>
        <NavItem
          isActive={isRouteActive(RouteObj.Users, location)}
          onClick={() => onClick(RouteObj.Users)}
        >
          {t('Users')}
        </NavItem>
      </NavExpandable>
      <NavExpandable
        key="administration"
        title={t('Administration')}
        isExpanded
        isActive={isRouteActive(
          [
            RouteObj.CredentialTypes,
            RouteObj.Notifications,
            RouteObj.ManagementJobs,
            RouteObj.InstanceGroups,
            RouteObj.Instances,
            RouteObj.Applications,
            RouteObj.ExecutionEnvironments,
            RouteObj.TopologyView,
          ],
          location
        )}
      >
        <NavItem
          isActive={isRouteActive(RouteObj.CredentialTypes, location)}
          onClick={() => onClick(RouteObj.CredentialTypes)}
        >
          {t('Credential Types')}
        </NavItem>
        <NavItem
          isActive={isRouteActive(RouteObj.Notifications, location)}
          onClick={() => onClick(RouteObj.Notifications)}
        >
          {t('Notifications')}
        </NavItem>
        <NavItem
          isActive={isRouteActive(RouteObj.ManagementJobs, location)}
          onClick={() => onClick(RouteObj.ManagementJobs)}
        >
          {t('Management Jobs')}
        </NavItem>
        <NavItem
          isActive={isRouteActive(RouteObj.InstanceGroups, location)}
          onClick={() => onClick(RouteObj.InstanceGroups)}
        >
          {t('Instance Groups')}
        </NavItem>
        <NavItem
          isActive={isRouteActive(RouteObj.Instances, location)}
          onClick={() => onClick(RouteObj.Instances)}
        >
          {t('Instances')}
        </NavItem>
        {/* <NavItem isActive={isRouteActive(RouteObj.Applications, location)}>
                                <Link to={RouteObj.Applications}>Applications</Link>
                            </NavItem> */}
        <NavItem
          isActive={isRouteActive(RouteObj.ExecutionEnvironments, location)}
          onClick={() => onClick(RouteObj.ExecutionEnvironments)}
        >
          {t('Execution Environments')}
        </NavItem>
        {/* <NavItem
          isActive={isRouteActive(RouteObj.TopologyView, location)}
          onClick={() => onClick(RouteObj.TopologyView)}
        >
          {t('Topology view')}
        </NavItem> */}
      </NavExpandable>
      {/* <NavGroup>
                            <NavItem isActive={isRouteActive(RouteObj.Settings, location)}>
                                <Link to={RouteObj.Settings}>Settings</Link>
                            </NavItem>
                        </NavGroup> */}
      {/* </NavExpandable> */}
      {activeUser?.is_superuser && (
        <NavExpandable
          key="analytics"
          title={t('Analytics')}
          isExpanded
          isActive={isRouteActive([RouteObj.ControllerReports], location)}
        >
          <NavItem
            isActive={isRouteActive(RouteObj.ControllerReports, location)}
            onClick={() => onClick(RouteObj.ControllerReports)}
          >
            {t('Reports')}
          </NavItem>

          <NavItem
            isActive={isRouteActive(RouteObj.HostMetrics, location)}
            onClick={() => onClick(RouteObj.HostMetrics)}
          >
            {t('Host Metrics')}
          </NavItem>
        </NavExpandable>
      )}
      {process.env.NODE_ENV === 'development' && (
        <NavItem
          isActive={isRouteActive(RouteObj.AwxDebug, location)}
          onClick={() => onClick(RouteObj.AwxDebug)}
        >
          {t('Debug')}
        </NavItem>
      )}
    </CommonSidebar>
  );
}
