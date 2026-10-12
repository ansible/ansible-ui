import { renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, test } from 'vitest';
import { collectPageNavigationRouteIds } from '../../test-utils/collectPageNavigationRoutes';
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

describe('AWX route definition hooks', () => {
  test('useAwxActivityStreamRoutes should define the activity stream route', () => {
    const { result } = renderAwxRouteHook(useAwxActivityStreamRoutes);

    expect(result.current.id).toBe(AwxRoute.ActivityStream);
    expect(result.current.path).toBe('activity-stream');
    expect(collectPageNavigationRouteIds(result.current)).toEqual([AwxRoute.ActivityStream]);
  });

  test('useAwxDeprecationsRoutes should define deprecation routes', () => {
    const { result } = renderAwxRouteHook(useAwxDeprecationsRoutes);
    const routeIds = collectPageNavigationRouteIds(result.current);

    expect(result.current.id).toBe(AwxRoute.Deprecations);
    expect(result.current.path).toBe('deprecations');
    expect(routeIds).toEqual(
      expect.arrayContaining([
        AwxRoute.DeprecationPage,
        AwxRoute.DeprecationDetails,
        AwxRoute.DeprecationAffectedJobs,
      ])
    );
  });

  test('useAwxWorkflowApprovalRoutes should define workflow approval routes', () => {
    const { result } = renderAwxRouteHook(useAwxWorkflowApprovalRoutes);
    const routeIds = collectPageNavigationRouteIds(result.current);

    expect(result.current.id).toBe(AwxRoute.WorkflowApprovals);
    expect(result.current.path).toBe('workflow-approvals');
    expect(routeIds).toEqual(
      expect.arrayContaining([
        AwxRoute.WorkflowApprovalPage,
        AwxRoute.WorkflowApprovalDetails,
        AwxRoute.WorkflowApprovalWorkflowJobDetails,
      ])
    );
  });

  test('useAwxSchedulesRoutes should define schedule routes', () => {
    const { result } = renderAwxRouteHook(useAwxSchedulesRoutes);
    const routeIds = collectPageNavigationRouteIds(result.current);

    expect(result.current.id).toBe(AwxRoute.Schedules);
    expect(result.current.path).toBe('schedules');
    expect(routeIds).toEqual(expect.arrayContaining([AwxRoute.CreateSchedule]));
  });

  test('useAwxJobsRoutes should define job routes', () => {
    const { result } = renderAwxRouteHook(useAwxJobsRoutes);
    const routeIds = collectPageNavigationRouteIds(result.current);

    expect(result.current.id).toBe(AwxRoute.Jobs);
    expect(result.current.path).toBe('jobs');
    expect(routeIds).toEqual(
      expect.arrayContaining([
        AwxRoute.JobPage,
        AwxRoute.JobOutput,
        AwxRoute.JobDetails,
        AwxRoute.TemplateLaunchWithPasswordsWizard,
      ])
    );
  });

  test('useAwxHostRoutes should define host routes', () => {
    const { result } = renderAwxRouteHook(useAwxHostRoutes);
    const routeIds = collectPageNavigationRouteIds(result.current);

    expect(result.current.id).toBe(AwxRoute.Hosts);
    expect(result.current.path).toBe('hosts');
    expect(routeIds).toEqual(
      expect.arrayContaining([
        AwxRoute.HostPage,
        AwxRoute.HostDetails,
        AwxRoute.CreateHost,
        AwxRoute.EditHost,
      ])
    );
  });

  test('useAwxInstancesRoutes should define instance routes', () => {
    const { result } = renderAwxRouteHook(useAwxInstancesRoutes);
    const routeIds = collectPageNavigationRouteIds(result.current);

    expect(result.current.id).toBe(AwxRoute.Instances);
    expect(result.current.path).toBe('instances');
    expect(routeIds).toEqual(
      expect.arrayContaining([
        AwxRoute.InstancePage,
        AwxRoute.InstanceDetails,
        AwxRoute.AddInstance,
        AwxRoute.EditInstance,
      ])
    );
  });

  test('useAwxExecutionEnvironmentRoutes should define execution environment routes', () => {
    const { result } = renderAwxRouteHook(useAwxExecutionEnvironmentRoutes);
    const routeIds = collectPageNavigationRouteIds(result.current);

    expect(result.current.id).toBe(AwxRoute.ExecutionEnvironments);
    expect(result.current.path).toBe('execution-environments');
    expect(routeIds).toEqual(
      expect.arrayContaining([
        AwxRoute.ExecutionEnvironmentPage,
        AwxRoute.ExecutionEnvironmentDetails,
        AwxRoute.CreateExecutionEnvironment,
        AwxRoute.EditExecutionEnvironment,
      ])
    );
  });

  test('useAwxInstanceGroupsRoutes should define instance group routes', () => {
    const { result } = renderAwxRouteHook(useAwxInstanceGroupsRoutes);
    const routeIds = collectPageNavigationRouteIds(result.current);

    expect(result.current.id).toBe(AwxRoute.InstanceGroups);
    expect(result.current.path).toBe('instance-groups');
    expect(routeIds).toEqual(
      expect.arrayContaining([
        AwxRoute.InstanceGroupPage,
        AwxRoute.InstanceGroupDetails,
        AwxRoute.CreateInstanceGroup,
        AwxRoute.CreateContainerGroup,
      ])
    );
  });

  test('useAwxNotificationsRoutes should define notifier routes', () => {
    const { result } = renderAwxRouteHook(useAwxNotificationsRoutes);
    const routeIds = collectPageNavigationRouteIds(result.current);

    expect(result.current.id).toBe(AwxRoute.NotificationTemplates);
    expect(result.current.path).toBe('notifiers');
    expect(routeIds).toEqual(
      expect.arrayContaining([
        AwxRoute.NotificationTemplatePage,
        AwxRoute.NotificationTemplateDetails,
        AwxRoute.AddNotificationTemplate,
        AwxRoute.EditNotificationTemplate,
      ])
    );
  });

  test('useAwxManagementJobsRoutes should define management job routes', () => {
    const { result } = renderAwxRouteHook(useAwxManagementJobsRoutes);
    const routeIds = collectPageNavigationRouteIds(result.current);

    expect(result.current.id).toBe(AwxRoute.ManagementJobs);
    expect(result.current.path).toBe('management-jobs');
    expect(routeIds).toEqual(
      expect.arrayContaining([
        AwxRoute.ManagementJobPage,
        AwxRoute.ManagementJobSchedules,
        AwxRoute.ManagementJobScheduleCreate,
      ])
    );
  });

  test('useAwxCredentialRoutes should define credential routes', () => {
    const { result } = renderAwxRouteHook(useAwxCredentialRoutes);
    const routeIds = collectPageNavigationRouteIds(result.current);

    expect(result.current.id).toBe(AwxRoute.Credentials);
    expect(result.current.path).toBe('credentials');
    expect(routeIds).toEqual(
      expect.arrayContaining([
        AwxRoute.CreateCredential,
        AwxRoute.CredentialPage,
        AwxRoute.CredentialDetails,
        AwxRoute.CredentialAssignTeams,
      ])
    );
  });

  test('useAwxCredentialTypesRoutes should define credential type routes', () => {
    const { result } = renderAwxRouteHook(useAwxCredentialTypesRoutes);
    const routeIds = collectPageNavigationRouteIds(result.current);

    expect(result.current.id).toBe(AwxRoute.CredentialTypes);
    expect(result.current.path).toBe('credential-types');
    expect(routeIds).toEqual(
      expect.arrayContaining([
        AwxRoute.CreateCredentialType,
        AwxRoute.CredentialTypePage,
        AwxRoute.CredentialTypeDetails,
      ])
    );
  });

  test('useAwxOrganizationRoutes should define organization routes', () => {
    const { result } = renderAwxRouteHook(useAwxOrganizationRoutes);
    const routeIds = collectPageNavigationRouteIds(result.current);

    expect(result.current.id).toBe(AwxRoute.Organizations);
    expect(result.current.path).toBe('organizations');
    expect(routeIds).toEqual(
      expect.arrayContaining([
        AwxRoute.CreateOrganization,
        AwxRoute.OrganizationPage,
        AwxRoute.OrganizationDetails,
        AwxRoute.OrganizationAddUsers,
      ])
    );
  });

  test('useAwxTeamsRoutes should define team routes', () => {
    const { result } = renderAwxRouteHook(useAwxTeamsRoutes);
    const routeIds = collectPageNavigationRouteIds(result.current);

    expect(result.current.id).toBe(AwxRoute.Teams);
    expect(result.current.path).toBe('teams');
    expect(routeIds).toEqual(
      expect.arrayContaining([
        AwxRoute.CreateTeam,
        AwxRoute.TeamPage,
        AwxRoute.TeamDetails,
        AwxRoute.TeamAddMembers,
      ])
    );
  });

  test('useAwxUsersRoutes should define user routes', () => {
    const { result } = renderAwxRouteHook(useAwxUsersRoutes);
    const routeIds = collectPageNavigationRouteIds(result.current);

    expect(result.current.id).toBe(AwxRoute.Users);
    expect(result.current.path).toBe('users');
    expect(routeIds).toEqual(
      expect.arrayContaining([
        AwxRoute.CreateUser,
        AwxRoute.UserPage,
        AwxRoute.UserDetails,
        AwxRoute.CreateUserToken,
      ])
    );
  });

  test('useAwxProjectRoutes should define project routes', () => {
    const { result } = renderAwxRouteHook(useAwxProjectRoutes);
    const routeIds = collectPageNavigationRouteIds(result.current);

    expect(result.current.id).toBe(AwxRoute.Projects);
    expect(result.current.path).toBe('projects');
    expect(routeIds).toEqual(
      expect.arrayContaining([
        AwxRoute.CreateProject,
        AwxRoute.ProjectPage,
        AwxRoute.ProjectDetails,
        AwxRoute.ProjectAssignTeams,
      ])
    );
  });

  test('useAwxInventoryRoutes should define inventory routes', () => {
    const { result } = renderAwxRouteHook(useAwxInventoryRoutes);
    const routeIds = collectPageNavigationRouteIds(result.current);

    expect(result.current.id).toBe(AwxRoute.Inventories);
    expect(result.current.path).toBe('inventories');
    expect(routeIds).toEqual(
      expect.arrayContaining([
        AwxRoute.CreateInventory,
        AwxRoute.InventoryPage,
        AwxRoute.InventoryDetails,
        AwxRoute.InventoryHostPage,
        AwxRoute.InventorySourcePage,
      ])
    );
  });

  test('useAwxTemplateRoutes should define template routes', () => {
    const { result } = renderAwxRouteHook(useAwxTemplateRoutes);
    const routeIds = collectPageNavigationRouteIds(result.current);

    expect(result.current.id).toBe(AwxRoute.Templates);
    expect(result.current.path).toBe('templates');
    expect(routeIds).toEqual(
      expect.arrayContaining([
        AwxRoute.CreateJobTemplate,
        AwxRoute.JobTemplatePage,
        AwxRoute.JobTemplateDetails,
        AwxRoute.CreateWorkflowJobTemplate,
        AwxRoute.WorkflowJobTemplatePage,
        AwxRoute.WorkflowVisualizer,
        AwxRoute.TemplateLaunchWizard,
      ])
    );
  });
});
