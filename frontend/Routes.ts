/* istanbul ignore file */

export enum RouteE {
  Login = '/login',

  Controller = '/controller',

  // Views
  Dashboard = '/controller/dashboard',
  Jobs = '/controller/jobs',
  Schedules = '/controller/schedules',
  ActivityStream = '/controller/activity-stream',
  WorkflowApprovals = '/controller/workflow-approvals',

  // Resources
  Templates = '/controller/templates',
  JobTemplateDetails = '/controller/job_template/details/:id',
  WorkflowJobTemplateDetails = '/controller/workflow_job_template/details/:id',
  WorkflowJobTemplateEdit = '/controller/workflow_job_template/edit/:id',
  JobTemplateEdit = '/controller/job_template/edit/:id',
  CreateWorkflowJobTemplate = '/controller/workflow_job_template/create',
  CreateJobTemplate = '/controller/job_template/create',

  Credentials = '/controller/credentials',
  CredentialDetails = '/controller/credentials/details/:id',
  CreateCredential = '/controller/credentials/create',
  EditCredential = '/controller/credentials/edit/:id',

  Projects = '/controller/projects',
  ProjectDetails = '/controller/projects/details/:id',
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

  Users = '/controller/users',
  UserDetails = '/controller/users/details/:id',
  CreateUser = '/controller/users/create',
  EditUser = '/controller/users/edit/:id',

  Teams = '/controller/teams',
  TeamDetails = '/controller/teams/details/:id',
  CreateTeam = '/controller/teams/create',
  EditTeam = '/controller/teams/edit/:id',

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

  ControllerDebug = '/controller/debug',

  AutomationServers = '/automation-servers',
  ControllerAutomationServers = '/controller/automation-servers',
  HubAutomationServers = '/hub/automation-servers',

  EventDriven = '/eda',

  EDAProjects = '/eda/projects',
  EDAProjectDetails = '/eda/projects/details/:id',
  CreateEDAProject = '/eda/projects/create',
  EditEDAProject = '/eda/projects/edit/:id',
}
