import { useMemo } from 'react';

export type RouteType = `/${string}`;

const awxRoutePrefix: RouteType = process.env.AWX_ROUTE_PREFIX
  ? (process.env.AWX_ROUTE_PREFIX as RouteType)
  : '/ui_next';

const hubRoutePrefix: RouteType = process.env.HUB_ROUTE_PREFIX
  ? (process.env.HUB_ROUTE_PREFIX as RouteType)
  : '/hub';

const edaRoutePrefix: RouteType = process.env.EDA_ROUTE_PREFIX
  ? (process.env.EDA_ROUTE_PREFIX as RouteType)
  : '/eda';

export const RouteObj = {
  Login: '/login',

  AWX: `${awxRoutePrefix}`,

  Dashboard: `${awxRoutePrefix}/dashboard`,

  // Views/Jobs
  Jobs: `${awxRoutePrefix}/views/jobs`,
  JobPage: `${awxRoutePrefix}/views/jobs/:job_type/:id/*`,
  JobOutput: `${awxRoutePrefix}/views/jobs/:job_type/:id/output`,
  JobDetails: `${awxRoutePrefix}/views/jobs/:job_type/:id/details`,
  Schedules: `${awxRoutePrefix}/views/schedules`,
  EditSchedule: `${awxRoutePrefix}/views/:resource_type/:resource_id/schedules/:schedule_id/edit`,
  ScheduleDetails: `${awxRoutePrefix}/views/:schedule_id/:resource_id/schedules/:schedule_id/details`,
  CreateSchedule: `${awxRoutePrefix}/views/schedules/create`,

  ActivityStream: `${awxRoutePrefix}/views/activity_stream`,
  WorkflowApprovals: `${awxRoutePrefix}/views/workflow_approvals`,
  WorkflowApprovalPage: `${awxRoutePrefix}/views/workflow_approvals/:id/*`,
  WorkflowApprovalDetails: `${awxRoutePrefix}/views/workflow_approvals/:id/details`,

  // Resources
  Templates: `${awxRoutePrefix}/resources/templates`,
  JobTemplatePage: `${awxRoutePrefix}/resources/job_template/:id/*`,
  JobTemplateDetails: `${awxRoutePrefix}/resources/job_template/:id/details`,
  JobTemplateAccess: `${awxRoutePrefix}/resources/job_template/:id/access`,
  JobTemplateNotifications: `${awxRoutePrefix}/resources/job_template/:id/notifications`,
  JobTemplateJobs: `${awxRoutePrefix}/resources/job_template/:id/jobs`,
  JobTemplateSurvey: `${awxRoutePrefix}/resources/job_template/:id/survey`,

  JobTemplateSchedules: `${awxRoutePrefix}/resources/job_template/:id/schedules/`,
  JobTemplateSchedulePage: `${awxRoutePrefix}/resources/job_template/:id/schedules/:schedule_id/*`,
  JobTemplateScheduleDetails: `${awxRoutePrefix}/resources/job_template/:id/schedules/:schedule_id/details`,
  JobTemplateScheduleRules: `${awxRoutePrefix}/resources/job_template/:id/schedules/:schedule_id/rules`,
  JobTemplateCreateScheduleRules: `${awxRoutePrefix}/resources/job_template/:id/schedules/:schedule_id/rules/create`,
  JobTemplateSchedulesCreate: `${awxRoutePrefix}/resources/job_template/:id/schedules/create`,
  WorkflowJobTemplatePage: `${awxRoutePrefix}/resources/workflow_job_template/:id/*`,
  WorkflowJobTemplateDetails: `${awxRoutePrefix}/resources/workflow_job_template/:id/details`,
  WorkflowJobTemplateAccess: `${awxRoutePrefix}/resources/workflow_job_template/:id/access`,
  WorkflowJobTemplateNotifications: `${awxRoutePrefix}/resources/workflow_job_template/:id/notifications`,
  WorkflowJobTemplateSchedules: `${awxRoutePrefix}/resources/workflow_job_template/:id/schedules`,
  WorkflowJobTemplateSchedulePage: `${awxRoutePrefix}/resources/workflow_job_template/:id/schedules/:schedule_id/*`,
  WorkflowJobTemplateSchedulesCreate: `${awxRoutePrefix}/resources/workflow_job_template/:id/schedules/create`,
  WorkflowJobTemplateScheduleDetails: `${awxRoutePrefix}/resources/workflow_job_template/:id/schedules/:schedule_id/details`,
  WorkflowJobTemplateCreateScheduleRules: `${awxRoutePrefix}/resources/workflow_job_template/:id/schedules/:schedule_id/rules/create`,
  WorkflowJobTemplateScheduleRules: `${awxRoutePrefix}/resources/workflow_job_template/:id/schedules/:schedule_id/rules`,
  WorkflowJobTemplateJobs: `${awxRoutePrefix}/resources/workflow_job_template/:id/jobs`,
  WorkflowJobTemplateSurvey: `${awxRoutePrefix}/resources/workflow_job_template/:id/survey`,
  WorkflowJobTemplateVisualizer: `${awxRoutePrefix}/resources/workflow_job_template/:id/visualizer`,
  CreateWorkflowJobTemplate: `${awxRoutePrefix}/resources/workflow_job_template/create`,
  CreateJobTemplate: `${awxRoutePrefix}/resources/job_template/create`,
  EditJobTemplate: `${awxRoutePrefix}/resources/job_template/:id/edit`,
  EditWorkflowJobTemplate: `${awxRoutePrefix}/resources/workflow_job_template/:id/edit`,

  Credentials: `${awxRoutePrefix}/resources/credentials`,
  CredentialPage: `${awxRoutePrefix}/resources/credentials/:id/*`,
  CredentialDetails: `${awxRoutePrefix}/resources/credentials/:id/details`,
  CredentialAccess: `${awxRoutePrefix}/resources/credentials/:id/access`,
  CreateCredential: `${awxRoutePrefix}/resources/credentials/create`,
  EditCredential: `${awxRoutePrefix}/resources/credentials/:id/edit`,

  Projects: `${awxRoutePrefix}/resources/projects`,
  ProjectPage: `${awxRoutePrefix}/resources/projects/:id/*`,
  ProjectDetails: `${awxRoutePrefix}/resources/projects/:id/details`,
  ProjectAccess: `${awxRoutePrefix}/resources/projects/:id/access`,
  ProjectTemplates: `${awxRoutePrefix}/resources/projects/:id/templates`,
  ProjectNotifications: `${awxRoutePrefix}/resources/projects/:id/notifications`,
  ProjectSchedules: `${awxRoutePrefix}/resources/projects/:id/schedules`,
  ProjectSchedulePage: `${awxRoutePrefix}/resources/projects/:id/schedules/:schedule_id/*`,
  ProjectSchedulesCreate: `${awxRoutePrefix}/resources/projects/:id/schedules/create`,
  ProjectScheduleDetails: `${awxRoutePrefix}/resources/projects/:id/schedules/:schedule_id/details`,
  ProjectCreateScheduleRules: `${awxRoutePrefix}/resources/project/:id/schedules/:schedule_id/rules/create`,
  ProjectScheduleRules: `${awxRoutePrefix}/resources/project/:id/schedules/:schedule_id/rules`,
  CreateProject: `${awxRoutePrefix}/resources/projects/create`,
  EditProject: `${awxRoutePrefix}/resources/projects/:id/edit`,

  Inventories: `${awxRoutePrefix}/resources/inventories`,
  InventoryPage: `${awxRoutePrefix}/resources/inventories/:inventory_type/:id/*`,
  InventoryDetails: `${awxRoutePrefix}/resources/inventories/:inventory_type/:id/details`,
  InventoryAccess: `${awxRoutePrefix}/resources/inventories/:inventory_type/:id/access`,
  InventoryGroups: `${awxRoutePrefix}/resources/inventories/:inventory_type/:id/groups`,
  InventoryHosts: `${awxRoutePrefix}/resources/inventories/:inventory_type/:id/hosts`,
  InventorySources: `${awxRoutePrefix}/resources/inventories/:inventory_type/:id/sources`,
  InventorySourcesPage: `${awxRoutePrefix}/resources/inventories/:inventory_type/:id/sources/:source_id/*`,
  InventorySourcesDetails: `${awxRoutePrefix}/resources/inventories/:inventory_type/:id/sources/:source_id/details`,
  InventorySourceSchedulesCreate: `${awxRoutePrefix}/resources/inventories/:inventory_type/:id/sources/:source_id/schedules/create`,
  InventorySourceSchedules: `${awxRoutePrefix}/resources/inventories/:inventory_type/:id/sources/:source_id/schedules`,
  InventorySourceSchedulePage: `${awxRoutePrefix}/resources/inventories/:inventory_type/:id/sources/:source_id/schedules/:schedule_id/*`,
  InventorySourceScheduleDetails: `${awxRoutePrefix}/resources/inventories/inventory/:id/sources/:source_id/schedules/:schedule_id/details`,
  InventorySourceCreateScheduleRules: `${awxRoutePrefix}/resources/inventories/inventory/:id/sources/:source_id/schedules/:schedule_id/rules/create`,
  InventorySourceScheduleRules: `${awxRoutePrefix}/resources/inventories/inventory/:id/sources/:source_id/schedules/:schedule_id/rules`,
  InventoryJobs: `${awxRoutePrefix}/resources/inventories/:inventory_type/:id/jobs`,
  InventoryJobTemplates: `${awxRoutePrefix}/resources/inventories/:inventory_type/:id/job_templates`,
  CreateInventory: `${awxRoutePrefix}/resources/inventories/create`,
  EditInventory: `${awxRoutePrefix}/resources/inventories/:id/edit`,
  CreateSmartInventory: `${awxRoutePrefix}/resources/smart_inventory/create`,
  CreateConstructedInventory: `${awxRoutePrefix}/resources/constructed_inventory/create`,
  EditSmartInventory: `${awxRoutePrefix}/resources/smart_inventory/:id/edit`,
  EditConstructedInventory: `${awxRoutePrefix}/resources/constructed_inventory/:id/edit`,

  Hosts: `${awxRoutePrefix}/resources/hosts`,
  HostPage: `${awxRoutePrefix}/resources/hosts/:id/*`,
  HostDetails: `${awxRoutePrefix}/resources/hosts/:id/details`,
  HostFacts: `${awxRoutePrefix}/resources/hosts/:id/facts`,
  HostGroups: `${awxRoutePrefix}/resources/hosts/:id/groups`,
  HostJobs: `${awxRoutePrefix}/resources/hosts/:id/jobs`,
  CreateHost: `${awxRoutePrefix}/resources/hosts/create`,
  EditHost: `${awxRoutePrefix}/resources/hosts/:id/edit`,

  // Access
  Organizations: `${awxRoutePrefix}/access/organizations`,
  OrganizationPage: `${awxRoutePrefix}/access/organizations/:id/*`,
  OrganizationDetails: `${awxRoutePrefix}/access/organizations/:id/details`,
  OrganizationAccess: `${awxRoutePrefix}/access/organizations/:id/access`,
  OrganizationTeams: `${awxRoutePrefix}/access/organizations/:id/teams`,
  OrganizationExecutionEnvironments: `${awxRoutePrefix}/access/organizations/:id/execution_environments`,
  OrganizationNotifications: `${awxRoutePrefix}/access/organizations/:id/notifications`,
  CreateOrganization: `${awxRoutePrefix}/access/organizations/create`,
  EditOrganization: `${awxRoutePrefix}/access/organizations/:id/edit`,

  Teams: `${awxRoutePrefix}/access/teams`,
  TeamPage: `${awxRoutePrefix}/access/teams/:id/*`,
  TeamDetails: `${awxRoutePrefix}/access/teams/:id/details`,
  TeamAccess: `${awxRoutePrefix}/access/teams/:id/access`,
  TeamRoles: `${awxRoutePrefix}/access/teams/:id/roles`,
  CreateTeam: `${awxRoutePrefix}/access/teams/create`,
  EditTeam: `${awxRoutePrefix}/access/teams/:id/edit`,
  AddRolesToTeam: `${awxRoutePrefix}/access/teams/:id/roles/add`,

  Users: `${awxRoutePrefix}/access/users`,
  UserPage: `${awxRoutePrefix}/access/users/:id/*`,
  UserDetails: `${awxRoutePrefix}/access/users/:id/details`,
  UserOrganizations: `${awxRoutePrefix}/access/users/:id/organizations`,
  UserTeams: `${awxRoutePrefix}/access/users/:id/teams`,
  UserRoles: `${awxRoutePrefix}/access/users/:id/roles`,
  CreateUser: `${awxRoutePrefix}/access/users/create`,
  EditUser: `${awxRoutePrefix}/access/users/:id/edit`,
  AddRolesToUser: `${awxRoutePrefix}/access/users/:id/roles/add`,

  // Administration
  CredentialTypes: `${awxRoutePrefix}/administration/credential_types`,
  CredentialTypePage: `${awxRoutePrefix}/administration/credential_types/:id/*`,
  CredentialTypeDetails: `${awxRoutePrefix}/administration/credential_types/:id/details`,

  Notifications: `${awxRoutePrefix}/administration/notification_templates`,
  NotificationPage: `${awxRoutePrefix}/administration/notification_templates/:id/*`,
  NotificationDetails: `${awxRoutePrefix}/administration/notification_templates/:id/details`,
  ManagementJobs: `${awxRoutePrefix}/administration/management_jobs`,
  ManagementJobPage: `${awxRoutePrefix}/administration/management_jobs/:id/*`,
  ManagementJobSchedules: `${awxRoutePrefix}/administration/management_jobs/:id/schedules`,
  ManagementJobSchedulesDetails: `${awxRoutePrefix}/administration/management_jobs/:id/schedules/:schedule_id/details`,
  ManagementJobNotifications: `${awxRoutePrefix}/administration/management_jobs/:id/notifications`,

  InstanceGroups: `${awxRoutePrefix}/administration/instance-groups`,
  InstanceGroupDetails: `${awxRoutePrefix}/administration/instance-groups/:id`,
  CreateInstanceGroup: `${awxRoutePrefix}/administration/instance-groups/create`,
  EditInstanceGroup: `${awxRoutePrefix}/administration/instance-groups/:id/edit`,

  Applications: `${awxRoutePrefix}/administration/applications`,
  ApplicationPage: `${awxRoutePrefix}/administration/applications/:id/*`,
  ApplicationDetails: `${awxRoutePrefix}/administration/applications/:id/details`,
  ApplicationTokens: `${awxRoutePrefix}/administration/applications/:id/tokens`,

  Instances: `${awxRoutePrefix}/administration/instances`,
  InstanceDetails: `${awxRoutePrefix}/administration/instances/:id`,
  CreateInstance: `${awxRoutePrefix}/administration/instances/create`,
  EditInstance: `${awxRoutePrefix}/administration/instances/:id/edit`,

  ExecutionEnvironments: `${awxRoutePrefix}/administration/execution-environments`,
  ExecutionEnvironmentDetails: `${awxRoutePrefix}/administration/execution-environments/:id/details`,
  CreateExecutionEnvironment: `${awxRoutePrefix}/administration/execution-environments/create`,
  EditExecutionEnvironment: `${awxRoutePrefix}/administration/execution-environments/:id/edit`,

  TopologyView: `${awxRoutePrefix}/administration/topology`,

  // Settings
  Settings: `${awxRoutePrefix}/settings`,

  //Analytics
  ControllerReports: `${awxRoutePrefix}/analytics/reports`,
  ControllerReport: `${awxRoutePrefix}/analytics/reports/:id`,
  HostMetrics: `${awxRoutePrefix}/analytics//host-metrics`,
  SubscriptionUsage: `${awxRoutePrefix}/analytics/subscription-usage`,

  Hub: `${hubRoutePrefix}`,

  HubDashboard: `${hubRoutePrefix}/dashboard`,
  Collections: `${hubRoutePrefix}/collections`,
  CollectionDetails: `${hubRoutePrefix}/collections/details/`,
  UploadCollection: `${hubRoutePrefix}/collections/upload`,

  Repositories: `${hubRoutePrefix}/repositories`,
  RepositoryDetails: `${hubRoutePrefix}/repositories/details/:id`,
  EditRepository: `${hubRoutePrefix}/repositories/edit/:id`,

  Namespaces: `${hubRoutePrefix}/namespaces`,
  NamespaceDetails: `${hubRoutePrefix}/namespaces/:id`,
  CreateNamespace: `${hubRoutePrefix}/namespaces/create`,
  EditNamespace: `${hubRoutePrefix}/namespaces/:id/edit`,

  Approvals: `${hubRoutePrefix}/approvals`,
  ApprovalDetails: `${hubRoutePrefix}/approvals/details/:id`,

  HubExecutionEnvironments: `${hubRoutePrefix}/execution-environments`,
  HubExecutionEnvironmentDetails: `${hubRoutePrefix}/execution-environments/details/:id`,

  Remotes: `${hubRoutePrefix}/remotes`,
  CreateRemotes: `${hubRoutePrefix}/remotes/create`,
  EditRemotes: `${hubRoutePrefix}/remotes/:id/edit`,
  RemoteDetails: `${hubRoutePrefix}/remotes/details/:id`,

  RemoteRegistries: `${hubRoutePrefix}/remote-registries`,

  Tasks: `${hubRoutePrefix}/tasks`,
  TaskDetails: `${hubRoutePrefix}/tasks/details/:id`,

  SignatureKeys: `${hubRoutePrefix}/signature-keys`,

  APIToken: `${hubRoutePrefix}/api-token`,

  AwxDebug: `${awxRoutePrefix}/debug`,

  // EDA server prefix
  Eda: `${edaRoutePrefix}`,

  EdaDashboard: `${edaRoutePrefix}/dashboard`,

  EdaProjects: `${edaRoutePrefix}/projects`,
  EdaProjectDetails: `${edaRoutePrefix}/projects/details/:id`,
  CreateEdaProject: `${edaRoutePrefix}/projects/create`,
  EditEdaProject: `${edaRoutePrefix}/projects/edit/:id`,

  EdaCredentials: `${edaRoutePrefix}/credentials`,
  EdaCredentialDetails: `${edaRoutePrefix}/credentials/details/:id`,
  CreateEdaCredential: `${edaRoutePrefix}/credentials/create`,
  EditEdaCredential: `${edaRoutePrefix}/credentials/edit/:id`,

  EdaDecisionEnvironments: `${edaRoutePrefix}/decision-environments`,
  EdaDecisionEnvironmentDetails: `${edaRoutePrefix}/decision-environments/details/:id`,
  CreateEdaDecisionEnvironment: `${edaRoutePrefix}/decision-environments/create`,
  EditEdaDecisionEnvironment: `${edaRoutePrefix}/decision-environments/edit/:id`,

  EdaRuleAudit: `${edaRoutePrefix}/rule-audit`,
  EdaRuleAuditDetails: `${edaRoutePrefix}/rule-audit/:id`,

  EdaRulebookActivations: `${edaRoutePrefix}/rulebook-activations`,
  EdaRulebookActivationDetails: `${edaRoutePrefix}/rulebook-activations/details/:id`,
  EdaRulebookActivationDetailsHistory: `${edaRoutePrefix}/rulebook-activations/details/:id/history`,
  CreateEdaRulebookActivation: `${edaRoutePrefix}/rulebook-activations/create`,
  EditEdaRulebookActivation: `${edaRoutePrefix}/rulebook-activations/edit/:id`,
  EdaActivationInstanceDetails: `${edaRoutePrefix}/rulebook-activations/activations-instances/details/:id`,

  EdaRulebooks: `${edaRoutePrefix}/rulebooks`,
  EdaRulebookDetails: `${edaRoutePrefix}/rulebooks/details/:id`,
  EdaRulesetDetails: `${edaRoutePrefix}/rulesets/details/:id`,
  CreateEdaRulebook: `${edaRoutePrefix}/rulebooks/create`,
  EditEdaRulebook: `${edaRoutePrefix}/rulebooks/edit/:id`,

  EdaRules: `${edaRoutePrefix}/rules`,
  EdaRuleDetails: `${edaRoutePrefix}/rules/details/:id`,
  CreateEdaRule: `${edaRoutePrefix}/rules/create`,
  EditEdaRule: `${edaRoutePrefix}/rules/edit/:id`,

  EdaUsers: `${edaRoutePrefix}/users`,
  EdaGroups: `${edaRoutePrefix}/groups`,
  EdaRoles: `${edaRoutePrefix}/roles`,
  CreateEdaUser: `${edaRoutePrefix}/users/create`,
  EdaUserDetailsTokens: `${edaRoutePrefix}/users/details/:id/tokens`,
  EdaUserDetails: `${edaRoutePrefix}/users/details/:id`,
  EditEdaUser: `${edaRoutePrefix}/users/edit/:id`,
  CreateEdaGroup: `${edaRoutePrefix}/groups/create`,
  EdaGroupDetails: `${edaRoutePrefix}/groups/details/:id`,
  EditEdaGroup: `${edaRoutePrefix}/group/edit/:id`,
  CreateEdaRole: `${edaRoutePrefix}/roles/create`,
  EdaRoleDetails: `${edaRoutePrefix}/roles/details/:id`,
  EditEdaRole: `${edaRoutePrefix}/roles/edit/:id`,
  CreateEdaControllerToken: `${edaRoutePrefix}/users/tokens/create`,

  EdaMyDetails: `${edaRoutePrefix}/users/me`,
  EdaMyTokens: `${edaRoutePrefix}/users/me/tokens`,
};

export function useRoutesWithoutPrefix(prefix: string) {
  const routesWithoutPrefix = useMemo(() => {
    const routes = { ...RouteObj };
    for (const route in RouteObj) {
      const routePath = (RouteObj as Record<string, string>)[route];
      if (routePath.startsWith(prefix)) {
        (routes as Record<string, string>)[route] = routePath.replace(prefix, '');
      }
    }
    return routes;
  }, [prefix]);
  return routesWithoutPrefix;
}
