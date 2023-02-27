/* istanbul ignore file */

import { useMemo } from 'react';

export type RouteType = `/${string}`;

const awxRoutePrefix: RouteType = process.env.AWX_ROUTE_PREFIX
  ? (process.env.AWX_ROUTE_PREFIX as RouteType)
  : '/ui_next';

const galaxyRoutePrefix: RouteType = process.env.GALAXY_ROUTE_PREFIX
  ? (process.env.GALAXY_ROUTE_PREFIX as RouteType)
  : '/galaxy';
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
  JobDetails: `${awxRoutePrefix}/jobs/details/:id`,
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
  InventoryDetails: `${awxRoutePrefix}/inventories/details/:id`,
  CreateInventory: `${awxRoutePrefix}/inventories/create`,
  EditInventory: `${awxRoutePrefix}/inventories/edit/:id`,

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

  Galaxy: `${galaxyRoutePrefix}`,

  GalaxyDashboard: `${galaxyRoutePrefix}/dashboard`,

  Collections: `${galaxyRoutePrefix}/collections`,
  CollectionDetails: `${galaxyRoutePrefix}/collections/details/:id`,
  UploadCollection: `${galaxyRoutePrefix}/collections/upload`,

  Repositories: `${galaxyRoutePrefix}/repositories`,
  RepositoryDetails: `${galaxyRoutePrefix}/repositories/details/:id`,
  EditRepository: `${galaxyRoutePrefix}/repositories/edit/:id`,

  Namespaces: `${galaxyRoutePrefix}/namespaces`,
  NamespaceDetails: `${galaxyRoutePrefix}/namespaces/details/:id`,
  CreateNamespace: `${galaxyRoutePrefix}/namespaces/create/:id`,
  EditNamespace: `${galaxyRoutePrefix}/namespaces/edit/:id`,

  Approvals: `${galaxyRoutePrefix}/approvals`,
  ApprovalDetails: `${galaxyRoutePrefix}/approvals/details/:id`,

  GalaxyExecutionEnvironments: `${galaxyRoutePrefix}/execution-environments`,
  GalaxyExecutionEnvironmentDetails: `${galaxyRoutePrefix}/execution-environments/details/:id`,

  RemoteRegistries: `${galaxyRoutePrefix}/remote-registries`,

  Tasks: `${galaxyRoutePrefix}/tasks`,
  TaskDetails: `${galaxyRoutePrefix}/tasks/details/:id`,

  SignatureKeys: `${galaxyRoutePrefix}/signature-keys`,

  APIToken: `${galaxyRoutePrefix}/api-token`,

  AwxDebug: `${awxRoutePrefix}/debug`,

  AutomationServers: `/automation-servers`,
  AwxAutomationServers: `${awxRoutePrefix}/automation-servers`,
  GalaxyAutomationServers: `${galaxyRoutePrefix}/automation-servers`,

  // Event Driven Automation
  Eda: `${edaRoutePrefix}`,

  EdaAutomationServers: `${edaRoutePrefix}/automation-servers`,

  EdaDashboard: `${edaRoutePrefix}/dashboard`,

  EdaProjects: `${edaRoutePrefix}/projects`,
  EdaProjectDetails: `${edaRoutePrefix}/projects/details/:id`,
  CreateEdaProject: `${edaRoutePrefix}/projects/create`,
  EditEdaProject: `${edaRoutePrefix}/projects/edit/:id`,

  EdaExecutionEnvironments: `${edaRoutePrefix}/execution-environments`,
  EdaExecutionEnvironmentDetails: `${edaRoutePrefix}/execution-environments/details/:id`,
  CreateEdaExecutionEnvironment: `${edaRoutePrefix}/execution-environments/create`,
  EditEdaExecutionEnvironment: `${edaRoutePrefix}/execution-environments/edit/:id`,

  EdaInventories: `${edaRoutePrefix}/inventories`,
  EdaInventoryDetails: `${edaRoutePrefix}/inventories/details/:id`,
  CreateEdaInventory: `${edaRoutePrefix}/inventories/create`,
  EditEdaInventory: `${edaRoutePrefix}/inventories/edit/:id`,

  EdaActions: `${edaRoutePrefix}/actions`,
  EdaActionDetails: `${edaRoutePrefix}/actions/details/:id`,

  EdaRulebookActivations: `${edaRoutePrefix}/rulebook-activations`,
  EdaRulebookActivationDetails: `${edaRoutePrefix}/rulebook-activations/details/:id`,
  CreateEdaRulebookActivation: `${edaRoutePrefix}/rulebook-activations/create`,
  EditEdaRulebookActivation: `${edaRoutePrefix}/rulebook-activations/edit/:id`,

  EdaActivities: `${edaRoutePrefix}/activities`,
  EdaActivityDetails: `${edaRoutePrefix}/activities/details/:id`,
  CreateEdaActivity: `${edaRoutePrefix}/activities/create`,
  EditEdaActivity: `${edaRoutePrefix}/activities/edit/:id`,

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
};

export function useRoutesWithoutPrefix(prefix: RouteType) {
  const routesWithoutPrefix: { [key: string]: RouteType } = useMemo(() => {
    const routes: { [key: string]: RouteType } = {};
    for (const route in RouteObj) {
      if (RouteObj[route].startsWith(prefix)) {
        routes[route] = RouteObj[route].replace(prefix, '/') as RouteType;
      }
    }
    return routes;
  }, [prefix]);
  return routesWithoutPrefix;
}
