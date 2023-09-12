export enum AwxRoute {
  Awx = 'awx',

  Dashboard = 'awx-dashboard',

  // Views

  Jobs = 'awx-jobs',
  JobDetails = 'awx-job-details',

  Schedules = 'awx-schedules',
  CreateSchedule = 'awx-create-schedule',
  EditSchedule = 'awx-edit-schedule',

  ActivityStream = 'awx-activity-stream',

  WorkflowApprovals = 'awx-workflow-approvals',
  WorkflowApprovalDetails = 'awx-workflow-approval-details',

  // Resources

  Templates = 'awx-templates',
  CreateTemplate = 'awx-create-template',
  EditTemplate = 'awx-edit-template',
  TemplateDetails = 'awx-template-details',
  TemplateSchedule = 'awx-template-schedule',

  WorkflowJobTemplateSchedule = 'awx-workflow-job-template-schedule',
  WorkflowJobTemplateDetails = 'awx-workflow-job-template-details',

  Credentials = 'awx-credentials',
  CreateCredential = 'awx-create-credential',
  EditCredential = 'awx-edit-credential',
  CredentialDetails = 'awx-credential-details',

  Projects = 'awx-projects',
  CreateProject = 'awx-create-project',
  EditProject = 'awx-edit-project',
  ProjectDetails = 'awx-project-details',
  ProjectSchedules = 'awx-project-schedules',

  Inventories = 'awx-inventories',
  CreateInventory = 'awx-create-inventory',
  EditInventory = 'awx-edit-inventory',
  InventoryDetails = 'awx-inventory-details',
  InventorySchedules = 'awx-inventory-schedules',

  Hosts = 'awx-hosts',
  HostDetails = 'awx-host-details',

  // Access

  Organizations = 'awx-organizations',
  CreateOrganization = 'awx-create-organization',
  EditOrganization = 'awx-edit-organization',
  OrganizationDetails = 'awx-organization-details',

  Teams = 'awx-teams',
  CreateTeam = 'awx-create-team',
  EditTeam = 'awx-edit-team',
  TeamDetails = 'awx-team-details',
  AddRolesToTeam = 'awx-add-roles-to-team',

  Users = 'awx-users',
  CreateUser = 'awx-create-user',
  EditUser = 'awx-edit-user',
  UserDetails = 'awx-user-details',
  AddRolesToUser = 'awx-add-roles-to-user',

  // Administration

  CredentialTypes = 'awx-credential-types',
  CredentialType = 'awx-credential-type',

  Notifications = 'awx-notifications',
  NotificationDetails = 'awx-notification-details',

  ManagementJobs = 'awx-management-jobs',
  ManagementJobDetails = 'awx-management-job-details',
  ManagementJobSchedules = 'awx-management-job-schedules',

  InstanceGroups = 'awx-instance-groups',

  Instances = 'awx-instances',
  EditInstance = 'awx-edit-instance',
  InstanceDetails = 'awx-instance-details',

  Applications = 'awx-applications',
  ApplicationDetails = 'awx-application-details',

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
