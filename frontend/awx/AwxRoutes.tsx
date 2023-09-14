export enum AwxRoute {
  Awx = 'awx',

  Dashboard = 'awx-dashboard',

  // Views

  Jobs = 'awx-jobs',
  JobPage = 'awx-job-page',

  Schedules = 'awx-schedules',
  CreateSchedule = 'awx-create-schedule',
  EditSchedule = 'awx-edit-schedule',

  ActivityStream = 'awx-activity-stream',

  WorkflowApprovals = 'awx-workflow-approvals',
  WorkflowApprovalPage = 'awx-workflow-approval-page',

  // Resources

  Templates = 'awx-templates',
  CreateTemplate = 'awx-create-template',
  EditTemplate = 'awx-edit-template',
  TemplatePage = 'awx-template-page',
  TemplateSchedule = 'awx-template-schedule',

  WorkflowJobTemplateSchedule = 'awx-workflow-job-template-schedule',
  WorkflowJobTemplatePage = 'awx-workflow-job-template-page',

  Credentials = 'awx-credentials',
  CreateCredential = 'awx-create-credential',
  EditCredential = 'awx-edit-credential',
  CredentialPage = 'awx-credential-page',

  Projects = 'awx-projects',
  CreateProject = 'awx-create-project',
  EditProject = 'awx-edit-project',
  ProjectPage = 'awx-project-page',
  ProjectSchedules = 'awx-project-schedules',

  Inventories = 'awx-inventories',
  CreateInventory = 'awx-create-inventory',
  EditInventory = 'awx-edit-inventory',
  InventoryPage = 'awx-inventory-page',
  InventorySchedules = 'awx-inventory-schedules',

  Hosts = 'awx-hosts',
  HostPage = 'awx-host-page',

  // Access

  Organizations = 'awx-organizations',
  CreateOrganization = 'awx-create-organization',
  EditOrganization = 'awx-edit-organization',
  OrganizationPage = 'awx-organization-page',

  Teams = 'awx-teams',
  CreateTeam = 'awx-create-team',
  EditTeam = 'awx-edit-team',
  TeamPage = 'awx-team-page',
  AddRolesToTeam = 'awx-add-roles-to-team',

  Users = 'awx-users',
  CreateUser = 'awx-create-user',
  EditUser = 'awx-edit-user',
  UserPage = 'awx-user-page',
  AddRolesToUser = 'awx-add-roles-to-user',

  // Administration

  CredentialTypes = 'awx-credential-types',
  CredentialType = 'awx-credential-type',

  Notifications = 'awx-notifications',
  NotificationPage = 'awx-notification-page',

  ManagementJobs = 'awx-management-jobs',
  ManagementJobPage = 'awx-management-job-page',
  ManagementJobSchedules = 'awx-management-job-schedules',

  InstanceGroups = 'awx-instance-groups',

  Instances = 'awx-instances',
  EditInstance = 'awx-edit-instance',
  InstancePage = 'awx-instance-page',

  Applications = 'awx-applications',
  ApplicationPage = 'awx-application-page',

  ExecutionEnvironments = 'awx-execution-environments',

  TopologyView = 'awx-topology-view',

  // Analytics

  Reports = 'awx-reports',
  HostMetrics = 'awx-host-metrics',
  SubscriptionUsage = 'awx-subscription-usage',

  // Settings

  Settings = 'awx-settings',

  Login = 'awx-login',
}
