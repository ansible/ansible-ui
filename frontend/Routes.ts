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
  JobOutput: `${awxRoutePrefix}/jobs/:job_type/output/:id`,
  JobDetails: `${awxRoutePrefix}/jobs/:job_type/details/:id`,
  Schedules: `${awxRoutePrefix}/schedules`,
  ActivityStream: `${awxRoutePrefix}/activity-stream/:type`,
  WorkflowApprovals: `${awxRoutePrefix}/workflow-approvals`,

  // Resources
  Templates: `${awxRoutePrefix}/templates`,
  JobTemplateDetails: `${awxRoutePrefix}/job_template/details/:id`,
  WorkflowJobTemplateDetails: `${awxRoutePrefix}/workflow_job_template/details/:id`,
  WorkflowJobTemplateEdit: `${awxRoutePrefix}/workflow_job_template/edit/:id`,
  JobTemplateEdit: `${awxRoutePrefix}/job_template/edit/:id`,
  CreateWorkflowJobTemplate: `${awxRoutePrefix}/workflow_job_template/create`,
  CreateJobTemplate: `${awxRoutePrefix}/job_template/create`,
  EditTemplate: `${awxRoutePrefix}/templates/edit/:id`,

  Credentials: `${awxRoutePrefix}/credentials`,
  CredentialDetails: `${awxRoutePrefix}/credentials/details/:id`,
  CreateCredential: `${awxRoutePrefix}/credentials/create`,
  EditCredential: `${awxRoutePrefix}/credentials/edit/:id`,

  Projects: `${awxRoutePrefix}/projects`,
  ProjectDetails: `${awxRoutePrefix}/projects/:id/details`,
  CreateProject: `${awxRoutePrefix}/projects/create`,
  EditProject: `${awxRoutePrefix}/projects/edit/:id`,

  Inventories: `${awxRoutePrefix}/inventories`,
  InventoryDetails: `${awxRoutePrefix}/inventories/:inventory_type/details/:id`,
  CreateInventory: `${awxRoutePrefix}/inventories/create`,
  EditInventory: `${awxRoutePrefix}/inventories/edit/:id`,
  CreateSmartInventory: `${awxRoutePrefix}/smart_inventory/create`,
  CreateConstructedInventory: `${awxRoutePrefix}/constructed_inventory/create`,
  EditSmartInventory: `${awxRoutePrefix}/smart_inventory/edit/:id`,
  EditConstructedInventory: `${awxRoutePrefix}/constructed_inventory/edit/:id`,

  Hosts: `${awxRoutePrefix}/hosts`,
  HostDetails: `${awxRoutePrefix}/hosts/details/:id`,
  CreateHost: `${awxRoutePrefix}/hosts/create`,
  EditHost: `${awxRoutePrefix}/hosts/edit/:id`,

  // Access
  Organizations: `${awxRoutePrefix}/organizations`,
  OrganizationDetails: `${awxRoutePrefix}/organizations/details/:id`,
  CreateOrganization: `${awxRoutePrefix}/organizations/create`,
  EditOrganization: `${awxRoutePrefix}/organizations/edit/:id`,

  Teams: `${awxRoutePrefix}/teams`,
  TeamDetails: `${awxRoutePrefix}/teams/:id/details`,
  CreateTeam: `${awxRoutePrefix}/teams/create`,
  EditTeam: `${awxRoutePrefix}/teams/:id/edit`,
  AddRolesToTeam: `${awxRoutePrefix}/teams/:id/roles/add`,

  Users: `${awxRoutePrefix}/users`,
  UserDetails: `${awxRoutePrefix}/users/:id/details`,
  CreateUser: `${awxRoutePrefix}/users/create`,
  EditUser: `${awxRoutePrefix}/users/:id/edit`,
  AddRolesToUser: `${awxRoutePrefix}/users/:id/roles/add`,

  // Administration
  CredentialTypes: `${awxRoutePrefix}/credential-types`,
  CredentialTypeDetails: `${awxRoutePrefix}/credential-types/:id/details`,

  Notifications: `${awxRoutePrefix}/notifications`,
  ManagementJobs: `${awxRoutePrefix}/management-jobs`,

  InstanceGroups: `${awxRoutePrefix}/instance-groups`,
  InstanceGroupDetails: `${awxRoutePrefix}/instance-groups/details/:id`,
  CreateInstanceGroup: `${awxRoutePrefix}/instance-groups/create`,
  EditInstanceGroup: `${awxRoutePrefix}/instance-groups/edit/:id`,

  Applications: `${awxRoutePrefix}/applications`,

  Instances: `${awxRoutePrefix}/instances`,
  InstanceDetails: `${awxRoutePrefix}/instances/details/:id`,
  CreateInstance: `${awxRoutePrefix}/instances/create`,
  EditInstance: `${awxRoutePrefix}/instances/edit/:id`,

  ExecutionEnvironments: `${awxRoutePrefix}/execution-environments`,
  ExecutionEnvironmentDetails: `${awxRoutePrefix}/execution-environments/details/:id`,
  CreateExecutionEnvironment: `${awxRoutePrefix}/execution-environments/create`,
  EditExecutionEnvironment: `${awxRoutePrefix}/execution-environments/edit/:id`,

  TopologyView: `${awxRoutePrefix}/topology-view`,

  // Settings
  Settings: `${awxRoutePrefix}/settings`,

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
  CreateEdaRulebookActivation: `${edaRoutePrefix}/rulebook-activations/create`,
  EditEdaRulebookActivation: `${edaRoutePrefix}/rulebook-activations/edit/:id`,

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
  EdaUserDetails: `${edaRoutePrefix}/user/details/:id`,
  EditEdaUser: `${edaRoutePrefix}/user/edit/:id`,
  CreateEdaGroup: `${edaRoutePrefix}/groups/create`,
  EdaGroupDetails: `${edaRoutePrefix}/group/details/:id`,
  EditEdaGroup: `${edaRoutePrefix}/group/edit/:id`,
  CreateEdaRole: `${edaRoutePrefix}/roles/create`,
  EdaRoleDetails: `${edaRoutePrefix}/role/details/:id`,
  EditEdaRole: `${edaRoutePrefix}/role/edit/:id`,
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
