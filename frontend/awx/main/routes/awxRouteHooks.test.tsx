import { PageNavigationItem } from '@ansible/ansible-ui-framework';
import { collectPageNavigationRouteIds } from '@ansible/ansible-ui-framework/test-utils/collectPageNavigationRoutes';
import { renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, test } from 'vitest';
import { AwxRoute } from '../AwxRoutes';
import { useAwxActivityStreamRoutes } from './useAwxActivityStreamRoutes';
import { useAwxCredentialRoutes } from './useAwxCredentialRoutes';
import { useAwxCredentialTypesRoutes } from './useAwxCredentialTypesRoutes';
import { useAwxDeprecationsRoutes } from './useAwxDeprecationsRoutes';
import { useAwxExecutionEnvironmentRoutes } from './useAwxExecutionEnironmentRoutes';
import { useAwxHostRoutes } from './useAwxHostRoutes';
import { useAwxInstanceGroupsRoutes } from './useAwxInstanceGroupsRoutes';
import { useAwxInstancesRoutes } from './useAwxInstancesRoutes';
import { useAwxInventoryRoutes } from './useAwxInventoryRoutes';
import { useAwxJobsRoutes } from './useAwxJobsRoutes';
import { useAwxManagementJobsRoutes } from './useAwxManagementJobsRoutes';
import { useAwxNotificationsRoutes } from './useAwxNotificationsRoutes';
import { useAwxOrganizationRoutes } from './useAwxOrganizationsRoutes';
import { useAwxProjectRoutes } from './useAwxProjectRoutes';
import { useAwxSchedulesRoutes } from './useAwxSchedulesRoutes';
import { useAwxTeamsRoutes } from './useAwxTeamsRoutes';
import { useAwxTemplateRoutes } from './useAwxTemplateRoutes';
import { useAwxUsersRoutes } from './useAwxUsersRoutes';
import { useAwxWorkflowApprovalRoutes } from './useAwxWorkflowApprovalRoutes';

function renderAwxRouteHook<T>(useRoutes: () => T) {
  return renderHook(useRoutes, {
    wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
  });
}

function sortedRouteIds(navigation: PageNavigationItem) {
  return [...collectPageNavigationRouteIds(navigation)].sort((a, b) => a.localeCompare(b));
}

function expectRouteTreeIds(navigation: PageNavigationItem, routeIds: AwxRoute[]) {
  const expected = routeIds.map(String).sort((a, b) => a.localeCompare(b));
  expect(sortedRouteIds(navigation)).toEqual(expected);
}

describe('AWX route definition hooks', () => {
  test('useAwxActivityStreamRoutes should define the activity stream route', () => {
    const { result } = renderAwxRouteHook(useAwxActivityStreamRoutes);

    expect(result.current.id).toBe(AwxRoute.ActivityStream);
    expect(result.current.path).toBe('activity-stream');
    expectRouteTreeIds(result.current, [AwxRoute.ActivityStream]);
  });

  test('useAwxDeprecationsRoutes should define deprecation routes', () => {
    const { result } = renderAwxRouteHook(useAwxDeprecationsRoutes);

    expect(result.current.id).toBe(AwxRoute.Deprecations);
    expect(result.current.path).toBe('deprecations');
    expectRouteTreeIds(result.current, [
      AwxRoute.Deprecations,
      AwxRoute.DeprecationPage,
      AwxRoute.DeprecationDetails,
      AwxRoute.DeprecationAffectedJobs,
    ]);
  });

  test('useAwxWorkflowApprovalRoutes should define workflow approval routes', () => {
    const { result } = renderAwxRouteHook(useAwxWorkflowApprovalRoutes);

    expect(result.current.id).toBe(AwxRoute.WorkflowApprovals);
    expect(result.current.path).toBe('workflow-approvals');
    expectRouteTreeIds(result.current, [
      AwxRoute.WorkflowApprovals,
      AwxRoute.WorkflowApprovalPage,
      AwxRoute.WorkflowApprovalDetails,
      AwxRoute.WorkflowApprovalWorkflowJobDetails,
    ]);
  });

  test('useAwxSchedulesRoutes should define schedule routes', () => {
    const { result } = renderAwxRouteHook(useAwxSchedulesRoutes);

    expect(result.current.id).toBe(AwxRoute.Schedules);
    expect(result.current.path).toBe('schedules');
    expectRouteTreeIds(result.current, [AwxRoute.Schedules, AwxRoute.CreateSchedule]);
  });

  test('useAwxJobsRoutes should define job routes', () => {
    const { result } = renderAwxRouteHook(useAwxJobsRoutes);

    expect(result.current.id).toBe(AwxRoute.Jobs);
    expect(result.current.path).toBe('jobs');
    expectRouteTreeIds(result.current, [
      AwxRoute.Jobs,
      AwxRoute.JobPage,
      AwxRoute.JobOutput,
      AwxRoute.JobDetails,
      AwxRoute.TemplateLaunchWithPasswordsWizard,
    ]);
  });

  test('useAwxHostRoutes should define host routes', () => {
    const { result } = renderAwxRouteHook(useAwxHostRoutes);

    expect(result.current.id).toBe(AwxRoute.Hosts);
    expect(result.current.path).toBe('hosts');
    expectRouteTreeIds(result.current, [
      AwxRoute.Hosts,
      AwxRoute.HostPage,
      AwxRoute.HostDetails,
      AwxRoute.HostFacts,
      AwxRoute.HostGroups,
      AwxRoute.HostJobs,
      AwxRoute.EditHost,
      AwxRoute.CreateHost,
    ]);
  });

  test('useAwxInstancesRoutes should define instance routes', () => {
    const { result } = renderAwxRouteHook(useAwxInstancesRoutes);

    expect(result.current.id).toBe(AwxRoute.Instances);
    expect(result.current.path).toBe('instances');
    expectRouteTreeIds(result.current, [
      AwxRoute.Instances,
      AwxRoute.InstancePage,
      AwxRoute.InstanceDetails,
      AwxRoute.InstanceListenerAddresses,
      AwxRoute.InstancePeers,
      AwxRoute.AddInstance,
      AwxRoute.EditInstance,
    ]);
  });

  test('useAwxExecutionEnvironmentRoutes should define execution environment routes', () => {
    const { result } = renderAwxRouteHook(useAwxExecutionEnvironmentRoutes);

    expect(result.current.id).toBe(AwxRoute.ExecutionEnvironments);
    expect(result.current.path).toBe('execution-environments');
    expectRouteTreeIds(result.current, [
      AwxRoute.ExecutionEnvironments,
      AwxRoute.ExecutionEnvironmentPage,
      AwxRoute.ExecutionEnvironmentDetails,
      AwxRoute.ExecutionEnvironmentTemplates,
      AwxRoute.ExecutionEnvironmentTeamAccess,
      AwxRoute.ExecutionEnvironmentUserAccess,
      AwxRoute.CreateExecutionEnvironment,
      AwxRoute.EditExecutionEnvironment,
      AwxRoute.ExecutionEnvironmentAddUsers,
      AwxRoute.ExecutionEnvironmentManageUsers,
      AwxRoute.ExecutionEnvironmentAssignTeams,
    ]);
  });

  test('useAwxInstanceGroupsRoutes should define instance group routes', () => {
    const { result } = renderAwxRouteHook(useAwxInstanceGroupsRoutes);

    expect(result.current.id).toBe(AwxRoute.InstanceGroups);
    expect(result.current.path).toBe('instance-groups');
    expectRouteTreeIds(result.current, [
      AwxRoute.InstanceGroups,
      AwxRoute.CreateContainerGroup,
      AwxRoute.EditContainerGroup,
      AwxRoute.CreateInstanceGroup,
      AwxRoute.EditInstanceGroup,
      AwxRoute.InstanceGroupPage,
      AwxRoute.InstanceGroupDetails,
      AwxRoute.InstanceGroupInstances,
      AwxRoute.InstanceGroupTeamAccess,
      AwxRoute.InstanceGroupUserAccess,
      AwxRoute.InstanceGroupJobs,
      AwxRoute.InstanceGroupInstancesPage,
      AwxRoute.InstanceGroupInstanceDetails,
      AwxRoute.InstanceGroupAssignTeams,
      AwxRoute.InstanceGroupAddUsers,
      AwxRoute.InstanceGroupManageUsers,
    ]);
  });

  test('useAwxNotificationsRoutes should define notifier routes', () => {
    const { result } = renderAwxRouteHook(useAwxNotificationsRoutes);

    expect(result.current.id).toBe(AwxRoute.NotificationTemplates);
    expect(result.current.path).toBe('notifiers');
    expectRouteTreeIds(result.current, [
      AwxRoute.NotificationTemplates,
      AwxRoute.NotificationTemplatePage,
      AwxRoute.NotificationTemplateDetails,
      AwxRoute.NotificationTemplateTeamAccess,
      AwxRoute.NotificationTemplateUserAccess,
      AwxRoute.EditNotificationTemplate,
      AwxRoute.NotificationAddUsers,
      AwxRoute.NotificationManageUsers,
      AwxRoute.NotificationAssignTeams,
      AwxRoute.AddNotificationTemplate,
    ]);
  });

  test('useAwxManagementJobsRoutes should define management job routes', () => {
    const { result } = renderAwxRouteHook(useAwxManagementJobsRoutes);

    expect(result.current.id).toBe(AwxRoute.ManagementJobs);
    expect(result.current.path).toBe('management-jobs');
    expectRouteTreeIds(result.current, [
      AwxRoute.ManagementJobs,
      AwxRoute.ManagementJobSchedulePage,
      AwxRoute.ManagementJobScheduleDetails,
      AwxRoute.ManagementJobScheduleEdit,
      AwxRoute.ManagementJobScheduleCreate,
      AwxRoute.ManagementJobPage,
      AwxRoute.ManagementJobSchedules,
      AwxRoute.ManagementJobNotifications,
    ]);
  });

  test('useAwxCredentialRoutes should define credential routes', () => {
    const { result } = renderAwxRouteHook(useAwxCredentialRoutes);

    expect(result.current.id).toBe(AwxRoute.Credentials);
    expect(result.current.path).toBe('credentials');
    expectRouteTreeIds(result.current, [
      AwxRoute.Credentials,
      AwxRoute.CreateCredential,
      AwxRoute.EditCredential,
      AwxRoute.CredentialPage,
      AwxRoute.CredentialDetails,
      AwxRoute.CredentialJobTemplates,
      AwxRoute.CredentialTeamAccess,
      AwxRoute.CredentialUserAccess,
      AwxRoute.CredentialAddUsers,
      AwxRoute.CredentialManageUsers,
      AwxRoute.CredentialAssignTeams,
    ]);
  });

  test('useAwxCredentialTypesRoutes should define credential type routes', () => {
    const { result } = renderAwxRouteHook(useAwxCredentialTypesRoutes);

    expect(result.current.id).toBe(AwxRoute.CredentialTypes);
    expect(result.current.path).toBe('credential-types');
    expectRouteTreeIds(result.current, [
      AwxRoute.CredentialTypes,
      AwxRoute.CreateCredentialType,
      AwxRoute.EditCredentialType,
      AwxRoute.CredentialTypePage,
      AwxRoute.CredentialTypeDetails,
      AwxRoute.CredentialTypeCredentials,
    ]);
  });

  test('useAwxOrganizationRoutes should define organization routes', () => {
    const { result } = renderAwxRouteHook(useAwxOrganizationRoutes);

    expect(result.current.id).toBe(AwxRoute.Organizations);
    expect(result.current.path).toBe('organizations');
    expectRouteTreeIds(result.current, [
      AwxRoute.Organizations,
      AwxRoute.CreateOrganization,
      AwxRoute.EditOrganization,
      AwxRoute.OrganizationPage,
      AwxRoute.OrganizationDetails,
      AwxRoute.OrganizationUsersAccess,
      AwxRoute.OrganizationTeamsAccess,
      AwxRoute.OrganizationExecutionEnvironments,
      AwxRoute.OrganizationNotifications,
      AwxRoute.OrganizationAddUsers,
      AwxRoute.OrganizationAssignTeams,
    ]);
  });

  test('useAwxTeamsRoutes should define team routes', () => {
    const { result } = renderAwxRouteHook(useAwxTeamsRoutes);

    expect(result.current.id).toBe(AwxRoute.Teams);
    expect(result.current.path).toBe('teams');
    expectRouteTreeIds(result.current, [
      AwxRoute.Teams,
      AwxRoute.CreateTeam,
      AwxRoute.EditTeam,
      AwxRoute.AddRolesToTeam,
      AwxRoute.TeamPage,
      AwxRoute.TeamDetails,
      AwxRoute.TeamMembers,
      AwxRoute.TeamRoles,
      AwxRoute.TeamAddMembers,
    ]);
  });

  test('useAwxUsersRoutes should define user routes', () => {
    const { result } = renderAwxRouteHook(useAwxUsersRoutes);

    expect(result.current.id).toBe(AwxRoute.Users);
    expect(result.current.path).toBe('users');
    expectRouteTreeIds(result.current, [
      AwxRoute.Users,
      AwxRoute.CreateUser,
      AwxRoute.EditUser,
      AwxRoute.UserPage,
      AwxRoute.UserDetails,
      AwxRoute.UserOrganizations,
      AwxRoute.UserTeams,
      AwxRoute.UserRoles,
      AwxRoute.UserTokens,
      AwxRoute.AddRolesToUser,
      AwxRoute.CreateUserToken,
      AwxRoute.UserTokenPage,
      AwxRoute.UserTokenDetails,
    ]);
  });

  test('useAwxProjectRoutes should define project routes', () => {
    const { result } = renderAwxRouteHook(useAwxProjectRoutes);

    expect(result.current.id).toBe(AwxRoute.Projects);
    expect(result.current.path).toBe('projects');
    expectRouteTreeIds(result.current, [
      AwxRoute.Projects,
      AwxRoute.CreateProject,
      AwxRoute.EditProject,
      AwxRoute.ProjectScheduleCreate,
      AwxRoute.ProjectScheduleEdit,
      AwxRoute.ProjectSchedulePage,
      AwxRoute.ProjectScheduleDetails,
      AwxRoute.ProjectPage,
      AwxRoute.ProjectDetails,
      AwxRoute.ProjectJobTemplates,
      AwxRoute.ProjectNotifications,
      AwxRoute.ProjectSchedules,
      AwxRoute.ProjectUsers,
      AwxRoute.ProjectTeams,
      AwxRoute.ProjectAddUsers,
      AwxRoute.ProjectManageUsers,
      AwxRoute.ProjectAssignTeams,
    ]);
  });

  test('useAwxInventoryRoutes should define inventory routes', () => {
    const { result } = renderAwxRouteHook(useAwxInventoryRoutes);

    expect(result.current.id).toBe(AwxRoute.Inventories);
    expect(result.current.path).toBe('inventories');
    expectRouteTreeIds(result.current, [
      AwxRoute.Inventories,
      AwxRoute.InventorySourceSchedulePage,
      AwxRoute.InventorySourceScheduleDetails,
      AwxRoute.InventorySourceScheduleCreate,
      AwxRoute.InventorySourceScheduleEdit,
      AwxRoute.InventorySourcePage,
      AwxRoute.InventorySourceDetail,
      AwxRoute.InventorySourceNotifications,
      AwxRoute.InventorySourceSchedules,
      AwxRoute.InventoryHostAdd,
      AwxRoute.InventoryHostEdit,
      AwxRoute.InventoryGroupRelatedGroupsCreate,
      AwxRoute.InventoryRunCommand,
      AwxRoute.InventoryGroupPage,
      AwxRoute.InventoryGroupDetails,
      AwxRoute.InventoryGroupRelatedGroups,
      AwxRoute.InventoryGroupHost,
      AwxRoute.InventoryGroupHostAdd,
      AwxRoute.InventoryGroupEdit,
      AwxRoute.InventoryGroupCreate,
      AwxRoute.InventoryPage,
      AwxRoute.InventoryDetails,
      AwxRoute.InventoryGroups,
      AwxRoute.InventoryHosts,
      AwxRoute.InventorySources,
      AwxRoute.InventoryJobs,
      AwxRoute.InventoryJobTemplates,
      AwxRoute.InventoryTeamAccess,
      AwxRoute.InventoryUserAccess,
      AwxRoute.InventoryHostPage,
      AwxRoute.InventoryHostDetails,
      AwxRoute.InventoryHostGroups,
      AwxRoute.InventoryHostJobs,
      AwxRoute.InventoryHostFacts,
      AwxRoute.EditInventory,
      AwxRoute.CreateInventory,
      AwxRoute.CreateSmartInventory,
      AwxRoute.CreateConstructedInventory,
      AwxRoute.InventoryAddUsers,
      AwxRoute.InventoryManageUsers,
      AwxRoute.InventoryAssignTeams,
      AwxRoute.InventorySourceEdit,
      AwxRoute.InventorySourcesAdd,
    ]);
  });

  test('useAwxTemplateRoutes should define template routes', () => {
    const { result } = renderAwxRouteHook(useAwxTemplateRoutes);

    expect(result.current.id).toBe(AwxRoute.Templates);
    expect(result.current.path).toBe('templates');
    expectRouteTreeIds(result.current, [
      AwxRoute.Templates,
      AwxRoute.CreateJobTemplate,
      AwxRoute.EditJobTemplate,
      AwxRoute.JobTemplateScheduleCreate,
      AwxRoute.JobTemplateScheduleEdit,
      AwxRoute.JobTemplateSchedulePage,
      AwxRoute.JobTemplateScheduleDetails,
      AwxRoute.JobTemplatePage,
      AwxRoute.JobTemplateDetails,
      AwxRoute.JobTemplateTeamAccess,
      AwxRoute.JobTemplateUserAccess,
      AwxRoute.JobTemplateJobs,
      AwxRoute.JobTemplateNotifications,
      AwxRoute.JobTemplateSurvey,
      AwxRoute.AddJobTemplateSurvey,
      AwxRoute.EditJobTemplateSurvey,
      AwxRoute.JobTemplateSchedules,
      AwxRoute.JobTemplateAssignTeams,
      AwxRoute.JobTemplateAddUsers,
      AwxRoute.JobTemplateManageUsers,
      AwxRoute.TemplateLaunchWizard,
      AwxRoute.CreateWorkflowJobTemplate,
      AwxRoute.EditWorkflowJobTemplate,
      AwxRoute.WorkflowJobTemplateScheduleCreate,
      AwxRoute.WorkflowJobTemplateScheduleEdit,
      AwxRoute.WorkflowJobTemplateSchedulePage,
      AwxRoute.WorkflowJobTemplateScheduleDetails,
      AwxRoute.WorkflowVisualizer,
      AwxRoute.WorkflowJobTemplatePage,
      AwxRoute.WorkflowJobTemplateDetails,
      AwxRoute.WorkflowJobTemplateTeamAccess,
      AwxRoute.WorkflowJobTemplateUserAccess,
      AwxRoute.WorkflowJobTemplateJobs,
      AwxRoute.WorkflowJobTemplateSurvey,
      AwxRoute.AddWorkflowJobTemplateSurvey,
      AwxRoute.EditWorkflowJobTemplateSurvey,
      AwxRoute.WorkflowJobTemplateSchedules,
      AwxRoute.WorkflowJobTemplateNotifications,
      AwxRoute.WorkflowJobTemplateAssignTeams,
      AwxRoute.WorkflowJobTemplateAddUsers,
      AwxRoute.WorkflowJobTemplateManageUsers,
      AwxRoute.WorkflowJobTemplateLaunchWizard,
    ]);
  });
});
