/* istanbul ignore file */

export enum RouteE {
  Login = '/login',

  AWX = '/controller',

  // Views
  Dashboard = '/controller/dashboard',
  Jobs = '/controller/jobs',
  JobOutput = '/controller/jobs/:job_type/output/:id',
  JobDetails = '/controller/jobs/details/:id',
  Schedules = '/controller/schedules',
  ActivityStream = '/controller/activity-stream/:type',
  WorkflowApprovals = '/controller/workflow-approvals',

  // Resources
  Templates = '/controller/templates',
  JobTemplateDetails = '/controller/job_template/details/:id',
  WorkflowJobTemplateDetails = '/controller/workflow_job_template/details/:id',
  WorkflowJobTemplateEdit = '/controller/workflow_job_template/edit/:id',
  JobTemplateEdit = '/controller/job_template/edit/:id',
  CreateWorkflowJobTemplate = '/controller/workflow_job_template/create',
  CreateJobTemplate = '/controller/job_template/create',
  EditTemplate = '/controller/templates/edit/:id',

  Credentials = '/controller/credentials',
  CredentialDetails = '/controller/credentials/details/:id',
  CreateCredential = '/controller/credentials/create',
  EditCredential = '/controller/credentials/edit/:id',

  Projects = '/controller/projects',
  ProjectDetails = '/controller/projects/:id/details',
  CreateProject = '/controller/projects/create',
  EditProject = '/controller/projects/edit/:id',

  Inventories = '/controller/inventories',
  InventoryDetails = '/controller/inventories/details/:id',
  CreateInventory = '/controller/inventories/create',
  EditInventory = '/controller/inventories/edit/:id',

  Hosts = '/controller/hosts',
  HostDetails = '/controller/hosts/details/:id',
  CreateHost = '/controller/hosts/create',
  EditHost = '/controller/hosts/edit/:id',

  // Access
  Organizations = '/controller/organizations',
  OrganizationDetails = '/controller/organizations/details/:id',
  CreateOrganization = '/controller/organizations/create',
  EditOrganization = '/controller/organizations/edit/:id',

  Teams = '/controller/teams',
  TeamDetails = '/controller/teams/:id/details',
  CreateTeam = '/controller/teams/create',
  EditTeam = '/controller/teams/:id/edit',
  AddRolesToTeam = '/controller/teams/:id/roles/add',

  Users = '/controller/users',
  UserDetails = '/controller/users/:id/details',
  CreateUser = '/controller/users/create',
  EditUser = '/controller/users/:id/edit',
  AddRolesToUser = '/controller/users/:id/roles/add',

  // Administration
  CredentialTypes = '/controller/credential-types',
  Notifications = '/controller/notifications',
  ManagementJobs = '/controller/management-jobs',

  InstanceGroups = '/controller/instance-groups',
  InstanceGroupDetails = '/controller/instance-groups/details/:id',
  CreateInstanceGroup = '/controller/instance-groups/create',
  EditInstanceGroup = '/controller/instance-groups/edit/:id',

  Applications = '/controller/applications',

  Instances = '/controller/instances',
  InstanceDetails = '/controller/instances/details/:id',
  CreateInstance = '/controller/instances/create',
  EditInstance = '/controller/instances/edit/:id',

  ExecutionEnvironments = '/controller/execution-environments',
  ExecutionEnvironmentDetails = '/controller/execution-environments/details/:id',
  CreateExecutionEnvironment = '/controller/execution-environments/create',
  EditExecutionEnvironment = '/controller/execution-environments/edit/:id',

  TopologyView = '/controller/topology-view',

  // Settings
  Settings = '/controller/settings',

  Hub = '/hub',

  HubDashboard = '/hub/dashboard',

  Collections = '/hub/collections',
  CollectionDetails = '/hub/collections/details/:id',
  UploadCollection = '/hub/collections/upload',

  Repositories = '/hub/repositories',
  RepositoryDetails = '/hub/repositories/details/:id',
  EditRepository = '/hub/repositories/edit/:id',

  Namespaces = '/hub/namespaces',
  NamespaceDetails = '/hub/namespaces/details/:id',
  CreateNamespace = '/hub/namespaces/create/:id',
  EditNamespace = '/hub/namespaces/edit/:id',

  Approvals = '/hub/approvals',
  ApprovalDetails = '/hub/approvals/details/:id',

  HubExecutionEnvironments = '/hub/execution-environments',
  HubExecutionEnvironmentDetails = '/hub/execution-environments/details/:id',

  RemoteRegistries = '/hub/remote-registries',

  Tasks = '/hub/tasks',
  TaskDetails = '/hub/tasks/details/:id',

  SignatureKeys = '/hub/signature-keys',

  APIToken = '/hub/api-token',

  AwxDebug = '/controller/debug',

  AutomationServers = '/automation-servers',
  AwxAutomationServers = '/controller/automation-servers',
  HubAutomationServers = '/hub/automation-servers',

  // Event Driven Automation
  Eda = '/eda',

  EdaAutomationServers = '/eda/automation-servers',

  EdaDashboard = '/eda/dashboard',

  EdaProjects = '/eda/projects',
  EdaProjectDetails = '/eda/projects/details/:id',
  CreateEdaProject = '/eda/projects/create',
  EditEdaProject = '/eda/projects/edit/:id',

  EdaExecutionEnvironments = '/eda/execution-environments',
  EdaExecutionEnvironmentDetails = '/eda/execution-environments/details/:id',
  CreateEdaExecutionEnvironment = '/eda/execution-environments/create',
  EditEdaExecutionEnvironment = '/eda/execution-environments/edit/:id',

  EdaInventories = '/eda/inventories',
  EdaInventoryDetails = '/eda/inventories/details/:id',
  CreateEdaInventory = '/eda/inventories/create',
  EditEdaInventory = '/eda/inventories/edit/:id',

  EdaActions = '/eda/actions',
  EdaActionDetails = '/eda/actions/details/:id',

  EdaRulebookActivations = '/eda/rulebook-activations',
  EdaRulebookActivationDetails = '/eda/rulebook-activations/details/:id',
  CreateEdaRulebookActivation = '/eda/rulebook-activations/create',
  EditEdaRulebookActivation = '/eda/rulebook-activations/edit/:id',

  EdaActivities = '/eda/activities',
  EdaActivityDetails = '/eda/activities/details/:id',
  CreateEdaActivity = '/eda/activities/create',
  EditEdaActivity = '/eda/activities/edit/:id',

  EdaRulebooks = '/eda/rulebooks',
  EdaRulebookDetails = '/eda/rulebooks/details/:id',
  EdaRulesetDetails = '/eda/rulesets/details/:id',
  CreateEdaRulebook = '/eda/rulebooks/create',
  EditEdaRulebook = '/eda/rulebooks/edit/:id',

  EdaRules = '/eda/rules',
  EdaRuleDetails = '/eda/rules/details/:id',
  CreateEdaRule = '/eda/rules/create',
  EditEdaRule = '/eda/rules/edit/:id',

  EdaUsers = '/eda/users',
  EdaGroups = '/eda/groups',
  EdaRoles = '/eda/roles',
  CreateEdaUser = '/eda/users/create',
  EdaUserDetails = '/eda/user/details/:id',
  EditEdaUser = '/eda/user/edit/:id',
}
