/* istanbul ignore file */

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

export const RouteObj: { [key: string]: RouteType } = {
  Login: '/login',

  AWX: `${awxRoutePrefix}`,

  // Views
  Dashboard: `${awxRoutePrefix}/dashboard`,
  Jobs: `${awxRoutePrefix}/jobs`,
  JobPage: `${awxRoutePrefix}/jobs/:job_type/:id/*`,
  JobOutput: `${awxRoutePrefix}/jobs/:job_type/:id/output`,
  JobDetails: `${awxRoutePrefix}/jobs/:job_type/:id/details`,
  Schedules: `${awxRoutePrefix}/schedules`,
  ActivityStream: `${awxRoutePrefix}/activity-stream/:type`,
  WorkflowApprovals: `${awxRoutePrefix}/workflow-approvals`,
  HostMetrics: `${awxRoutePrefix}/host-metrics`,

  // Resources
  Templates: `${awxRoutePrefix}/templates`,
  JobTemplatePage: `${awxRoutePrefix}/job_template/:id/*`,
  JobTemplateDetails: `${awxRoutePrefix}/job_template/:id/details`,
  JobTemplateAccess: `${awxRoutePrefix}/job_template/:id/access`,
  JobTemplateNotifications: `${awxRoutePrefix}/job_template/:id/notifications`,
  JobTemplateSchedules: `${awxRoutePrefix}/job_template/:id/schedules`,
  JobTemplateJobs: `${awxRoutePrefix}/job_template/:id/jobs`,
  JobTemplateSurveys: `${awxRoutePrefix}/job_template/:id/surveys`,
  WorkflowJobTemplateDetails: `${awxRoutePrefix}/workflow_job_template/:id/details`,
  CreateWorkflowJobTemplate: `${awxRoutePrefix}/workflow_job_template/create`,
  CreateJobTemplate: `${awxRoutePrefix}/job_template/create`,
  EditJobTemplate: `${awxRoutePrefix}/job_template/:id/edit`,
  EditWorkflowJobTemplate: `${awxRoutePrefix}/workflow_job_template/:id/edit`,

  Credentials: `${awxRoutePrefix}/credentials`,
  CredentialPage: `${awxRoutePrefix}/credentials/:id/*`,
  CredentialDetails: `${awxRoutePrefix}/credentials/:id/details`,
  CreateCredential: `${awxRoutePrefix}/credentials/create`,
  EditCredential: `${awxRoutePrefix}/credentials/:id/edit`,

  Projects: `${awxRoutePrefix}/projects`,
  ProjectPage: `${awxRoutePrefix}/projects/:id/*`,
  ProjectDetails: `${awxRoutePrefix}/projects/:id/details`,
  ProjectAccess: `${awxRoutePrefix}/projects/:id/access`,
  ProjectTemplates: `${awxRoutePrefix}/projects/:id/templates`,
  ProjectNotifications: `${awxRoutePrefix}/projects/:id/notifications`,
  ProjectSchedules: `${awxRoutePrefix}/projects/:id/schedules`,
  CreateProject: `${awxRoutePrefix}/projects/create`,
  EditProject: `${awxRoutePrefix}/projects/:id/edit`,

  Inventories: `${awxRoutePrefix}/inventories`,
  InventoryPage: `${awxRoutePrefix}/inventories/:inventory_type/:id/*`,
  InventoryDetails: `${awxRoutePrefix}/inventories/:inventory_type/:id/details`,
  InventoryAccess: `${awxRoutePrefix}/inventories/:inventory_type/:id/access`,
  InventoryGroups: `${awxRoutePrefix}/inventories/:inventory_type/:id/groups`,
  InventoryHosts: `${awxRoutePrefix}/inventories/:inventory_type/:id/hosts`,
  InventorySources: `${awxRoutePrefix}/inventories/:inventory_type/:id/sources`,
  InventoryJobs: `${awxRoutePrefix}/inventories/:inventory_type/:id/jobs`,
  InventoryJobTemplates: `${awxRoutePrefix}/inventories/:inventory_type/:id/job_templates`,
  CreateInventory: `${awxRoutePrefix}/inventories/create`,
  EditInventory: `${awxRoutePrefix}/inventories/:id/edit`,
  CreateSmartInventory: `${awxRoutePrefix}/smart_inventory/create`,
  CreateConstructedInventory: `${awxRoutePrefix}/constructed_inventory/create`,
  EditSmartInventory: `${awxRoutePrefix}/smart_inventory/:id/edit`,
  EditConstructedInventory: `${awxRoutePrefix}/constructed_inventory/:id/edit`,

  Hosts: `${awxRoutePrefix}/hosts`,
  HostDetails: `${awxRoutePrefix}/hosts/:id/details`,
  CreateHost: `${awxRoutePrefix}/hosts/create`,
  EditHost: `${awxRoutePrefix}/hosts/:id/edit`,

  // Access
  Organizations: `${awxRoutePrefix}/organizations`,
  OrganizationPage: `${awxRoutePrefix}/organizations/:id/*`,
  OrganizationDetails: `${awxRoutePrefix}/organizations/:id/details`,
  OrganizationAccess: `${awxRoutePrefix}/organizations/:id/access`,
  OrganizationTeams: `${awxRoutePrefix}/organizations/:id/teams`,
  OrganizationExecutionEnvironments: `${awxRoutePrefix}/organizations/:id/execution_environments`,
  OrganizationNotifications: `${awxRoutePrefix}/organizations/:id/notifications`,
  CreateOrganization: `${awxRoutePrefix}/organizations/create`,
  EditOrganization: `${awxRoutePrefix}/organizations/:id/edit`,

  Teams: `${awxRoutePrefix}/teams`,
  TeamPage: `${awxRoutePrefix}/teams/:id/*`,
  TeamDetails: `${awxRoutePrefix}/teams/:id/details`,
  TeamAccess: `${awxRoutePrefix}/teams/:id/access`,
  TeamRoles: `${awxRoutePrefix}/teams/:id/roles`,
  CreateTeam: `${awxRoutePrefix}/teams/create`,
  EditTeam: `${awxRoutePrefix}/teams/:id/edit`,
  AddRolesToTeam: `${awxRoutePrefix}/teams/:id/roles/add`,

  Users: `${awxRoutePrefix}/users`,
  UserPage: `${awxRoutePrefix}/users/:id/*`,
  UserDetails: `${awxRoutePrefix}/users/:id/details`,
  UserOrganizations: `${awxRoutePrefix}/users/:id/organizations`,
  UserTeams: `${awxRoutePrefix}/users/:id/teams`,
  UserRoles: `${awxRoutePrefix}/users/:id/roles`,
  CreateUser: `${awxRoutePrefix}/users/create`,
  EditUser: `${awxRoutePrefix}/users/:id/edit`,
  AddRolesToUser: `${awxRoutePrefix}/users/:id/roles/add`,

  // Administration
  CredentialTypes: `${awxRoutePrefix}/credential-types`,
  CredentialTypeDetails: `${awxRoutePrefix}/credential-types/:id/details`,

  Notifications: `${awxRoutePrefix}/notifications`,
  ManagementJobs: `${awxRoutePrefix}/management-jobs`,

  InstanceGroups: `${awxRoutePrefix}/instance-groups`,
  InstanceGroupDetails: `${awxRoutePrefix}/instance-groups/:id/details`,
  CreateInstanceGroup: `${awxRoutePrefix}/instance-groups/create`,
  EditInstanceGroup: `${awxRoutePrefix}/instance-groups/:id/edit`,

  Applications: `${awxRoutePrefix}/applications`,

  Instances: `${awxRoutePrefix}/instances`,
  InstanceDetails: `${awxRoutePrefix}/instances/details/:id`,
  CreateInstance: `${awxRoutePrefix}/instances/create`,
  EditInstance: `${awxRoutePrefix}/instances/:id/edit`,

  ExecutionEnvironments: `${awxRoutePrefix}/execution-environments`,
  ExecutionEnvironmentDetails: `${awxRoutePrefix}/execution-environments/:id/details`,
  CreateExecutionEnvironment: `${awxRoutePrefix}/execution-environments/create`,
  EditExecutionEnvironment: `${awxRoutePrefix}/execution-environments/:id/edit`,

  TopologyView: `${awxRoutePrefix}/topology-view`,

  // Settings
  Settings: `${awxRoutePrefix}/settings`,

  //Analytics
  ControllerReports: `${awxRoutePrefix}/reports`,
  ControllerReport: `${awxRoutePrefix}/report/:id`,

  Hub: `${hubRoutePrefix}`,

  HubDashboard: `${hubRoutePrefix}/dashboard`,
  Collections: `${hubRoutePrefix}/collections`,
  CollectionDetails: `${hubRoutePrefix}/collections/details/:id`,
  UploadCollection: `${hubRoutePrefix}/collections/upload`,

  Repositories: `${hubRoutePrefix}/repositories`,
  RepositoryDetails: `${hubRoutePrefix}/repositories/details/:id`,
  EditRepository: `${hubRoutePrefix}/repositories/edit/:id`,

  Namespaces: `${hubRoutePrefix}/namespaces`,
  NamespaceDetails: `${hubRoutePrefix}/namespaces/details/:id`,
  CreateNamespace: `${hubRoutePrefix}/namespaces/create/:id`,
  EditNamespace: `${hubRoutePrefix}/namespaces/edit/:id`,

  Approvals: `${hubRoutePrefix}/approvals`,
  ApprovalDetails: `${hubRoutePrefix}/approvals/details/:id`,

  HubExecutionEnvironments: `${hubRoutePrefix}/execution-environments`,
  HubExecutionEnvironmentDetails: `${hubRoutePrefix}/execution-environments/details/:id`,

  RemoteRegistries: `${hubRoutePrefix}/remote-registries`,

  Tasks: `${hubRoutePrefix}/tasks`,
  TaskDetails: `${hubRoutePrefix}/tasks/details/:id`,

  SignatureKeys: `${hubRoutePrefix}/signature-keys`,

  APIToken: `${hubRoutePrefix}/api-token`,

  AwxDebug: `${awxRoutePrefix}/debug`,

  AutomationServers: `/automation-servers`,
  AwxAutomationServers: `${awxRoutePrefix}/automation-servers`,
  HubAutomationServers: `${hubRoutePrefix}/automation-servers`,

  // EDA server prefix
  Eda: `${edaRoutePrefix}`,

  EdaAutomationServers: `${edaRoutePrefix}/automation-servers`,

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
  EdaRuleAuditDetails: `${edaRoutePrefix}/rule-audit/details/:id`,

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
};

export function useRoutesWithoutPrefix(prefix: RouteType) {
  const routesWithoutPrefix: { [key: string]: RouteType } = useMemo(() => {
    const routes: { [key: string]: RouteType } = {};
    for (const route in RouteObj) {
      if (RouteObj[route].startsWith(prefix)) {
        routes[route] = RouteObj[route].replace(prefix, '') as RouteType;
      }
    }
    return routes;
  }, [prefix]);
  return routesWithoutPrefix;
}
