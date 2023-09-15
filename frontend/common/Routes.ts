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

  // Dashboard: `${awxRoutePrefix}/dashboard`,

  // Views/Jobs
  // Jobs: `${awxRoutePrefix}/views/jobs`,
  // JobPage: `${awxRoutePrefix}/views/jobs/:job_type/:id/*`,
  JobOutput: `${awxRoutePrefix}/views/jobs/:job_type/:id/output`,
  JobDetails: `${awxRoutePrefix}/views/jobs/:job_type/:id/details`,
  // Schedules: `${awxRoutePrefix}/views/schedules`,
  // EditSchedule: `${awxRoutePrefix}/views/:resource_type/:resource_id/schedules/:schedule_id/edit`,
  ScheduleDetails: `${awxRoutePrefix}/views/:schedule_id/:resource_id/schedules/:schedule_id/details`,
  CreateSchedule: `${awxRoutePrefix}/views/schedules/create`,

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

  HostPage: `${awxRoutePrefix}/resources/hosts/:id/*`,
  HostDetails: `${awxRoutePrefix}/resources/hosts/:id/details`,
  HostFacts: `${awxRoutePrefix}/resources/hosts/:id/facts`,
  HostGroups: `${awxRoutePrefix}/resources/hosts/:id/groups`,
  HostJobs: `${awxRoutePrefix}/resources/hosts/:id/jobs`,
  CreateHost: `${awxRoutePrefix}/resources/hosts/create`,
  EditHost: `${awxRoutePrefix}/resources/hosts/:id/edit`,

  // Access
  OrganizationPage: `${awxRoutePrefix}/access/organizations/:id/*`,
  OrganizationDetails: `${awxRoutePrefix}/access/organizations/:id/details`,
  OrganizationAccess: `${awxRoutePrefix}/access/organizations/:id/access`,
  OrganizationTeams: `${awxRoutePrefix}/access/organizations/:id/teams`,
  OrganizationExecutionEnvironments: `${awxRoutePrefix}/access/organizations/:id/execution_environments`,
  OrganizationNotifications: `${awxRoutePrefix}/access/organizations/:id/notifications`,
  CreateOrganization: `${awxRoutePrefix}/access/organizations/create`,
  EditOrganization: `${awxRoutePrefix}/access/organizations/:id/edit`,

  TeamPage: `${awxRoutePrefix}/access/teams/:id/*`,
  TeamDetails: `${awxRoutePrefix}/access/teams/:id/details`,
  TeamAccess: `${awxRoutePrefix}/access/teams/:id/access`,
  TeamRoles: `${awxRoutePrefix}/access/teams/:id/roles`,
  CreateTeam: `${awxRoutePrefix}/access/teams/create`,
  EditTeam: `${awxRoutePrefix}/access/teams/:id/edit`,
  AddRolesToTeam: `${awxRoutePrefix}/access/teams/:id/roles/add`,

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

  NotificationPage: `${awxRoutePrefix}/administration/notification_templates/:id/*`,
  NotificationDetails: `${awxRoutePrefix}/administration/notification_templates/:id/details`,
  ManagementJobs: `${awxRoutePrefix}/administration/management_jobs`,
  ManagementJobPage: `${awxRoutePrefix}/administration/management_jobs/:id/*`,
  ManagementJobSchedules: `${awxRoutePrefix}/administration/management_jobs/:id/schedules`,
  ManagementJobSchedulesDetails: `${awxRoutePrefix}/administration/management_jobs/:id/schedules/:schedule_id/details`,
  ManagementJobNotifications: `${awxRoutePrefix}/administration/management_jobs/:id/notifications`,

  InstanceGroupDetails: `${awxRoutePrefix}/administration/instance-groups/:id`,
  CreateInstanceGroup: `${awxRoutePrefix}/administration/instance-groups/create`,
  EditInstanceGroup: `${awxRoutePrefix}/administration/instance-groups/:id/edit`,

  ApplicationPage: `${awxRoutePrefix}/administration/applications/:id/*`,
  ApplicationDetails: `${awxRoutePrefix}/administration/applications/:id/details`,
  ApplicationTokens: `${awxRoutePrefix}/administration/applications/:id/tokens`,

  InstanceDetails: `${awxRoutePrefix}/administration/instances/:id`,
  CreateInstance: `${awxRoutePrefix}/administration/instances/create`,
  EditInstance: `${awxRoutePrefix}/administration/instances/:id/edit`,

  ExecutionEnvironmentDetails: `${awxRoutePrefix}/administration/execution-environments/:id/details`,
  CreateExecutionEnvironment: `${awxRoutePrefix}/administration/execution-environments/create`,
  EditExecutionEnvironment: `${awxRoutePrefix}/administration/execution-environments/:id/edit`,

  // Hub
  Collections: `${hubRoutePrefix}/automation-content/collections`,
  CollectionDetails: `${hubRoutePrefix}/automation-content/collections/details/`,

  // EDA
  EdaRulebookActivationDetailsHistory: `${edaRoutePrefix}/views/rulebook-activations/details/:id/history`,
  ActivationInstancePage: `${edaRoutePrefix}/views/rulebook-activations/activations-instances/details/:id`,
  RulesetPage: `${edaRoutePrefix}/rulesets/details/:id`,
  EdaUserDetailsTokens: `${edaRoutePrefix}/access/users/details/:id/tokens`,
};
