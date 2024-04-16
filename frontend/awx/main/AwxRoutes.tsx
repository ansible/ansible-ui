export enum AwxRoute {
  Awx = 'awx',

  Overview = 'awx-overview',

  // Views
  Jobs = 'awx-jobs',
  JobPage = 'awx-job-page',
  JobOutput = 'awx-job-output',
  JobDetails = 'awx-job-details',

  Schedules = 'awx-schedules',
  CreateSchedule = 'awx-create-schedule',
  EditSchedule = 'awx-edit-schedule',

  ActivityStream = 'awx-activity-stream',

  WorkflowApprovals = 'awx-workflow-approvals',
  WorkflowApprovalPage = 'awx-workflow-approval-page',
  WorkflowApprovalDetails = 'awx-workflow-approval-details',
  WorkflowApprovalWorkflowJobDetails = 'awx-workflow-approval-workflow-job-details',

  // Resources
  Templates = 'awx-templates',
  CreateJobTemplate = 'awx-create-job-template',
  CreateWorkflowJobTemplate = 'awx-create-workflow-job-template',
  EditJobTemplate = 'awx-edit-template',
  JobTemplatePage = 'awx-template-page',
  JobTemplateDetails = 'awx-template-details',
  JobTemplateScheduleDetails = 'awx-job-template-schedule-details',
  JobTemplateAccess = 'awx-job-template-access',
  JobTemplateJobs = 'awx-job-template-jobs',
  JobTemplateSurvey = 'awx-job-template-survey',
  AddJobTemplateSurvey = 'awx-add-job-template-survey',
  EditJobTemplateSurvey = 'awx-edit-job-template-survey',
  JobTemplateNotifications = 'awx-job-template-notifications',
  JobTemplateSchedules = 'awx-job-template-schedules',
  JobTemplateSchedulePage = 'awx-template-schedule-page',
  JobTemplateScheduleCreate = 'awx-template-schedule-create',
  JobTemplateEditSchedule = 'awx-job-template-edit-schedule',
  JobTemplateScheduleRules = 'awx-template-schedule-rules',
  JobTemplateCreateScheduleRules = 'awx-job-template-create-schedule-rules',
  TemplateLaunchWizard = 'awx-template-launch-wizard',

  WorkflowJobTemplatePage = 'awx-workflow-job-template-page',
  WorkflowJobTemplateDetails = 'awx-workflow-job-template-details',
  WorkflowJobTemplateAccess = 'awx-workflow-job-template-access',
  WorkflowJobTemplateSchedules = 'awx-workflow-job-template-schedules',
  WorkflowJobTemplateSchedulePage = 'awx-workflow-job-template-schedule-page',
  WorkflowJobTemplateScheduleDetails = 'awx-workflow-job-template-schedule-details',
  WorkflowJobTemplateScheduleRules = 'awx-workflow-job-template-schedule-rules',
  WorkflowJobTemplateScheduleCreate = 'awx-workflow-job-template-schedule-create',
  WorkflowJobTemplateCreateScheduleRules = 'awx-workflow-job-template-create-schedule-rules',
  WorkflowJobTemplateEditSchedule = 'awx-workflow-job-template-edit-schedule',
  WorkflowJobTemplateJobs = 'awx-workflow-job-template-jobs',
  WorkflowJobTemplateSurvey = 'awx-workflow-job-template-survey',
  AddWorkflowJobTemplateSurvey = 'awx-add-workflow-job-template-survey',
  EditWorkflowJobTemplateSurvey = 'awx-edit-workflow-job-template-survey',
  WorkflowJobTemplateNotifications = 'awx-workflow-job-template-notifications',
  EditWorkflowJobTemplate = 'awx-edit-workflow-job-template',
  WorkflowVisualizer = 'awx-workflow-visualizer',
  WorkflowJobTemplateLaunchWizard = 'awx-workflow-job-template-launch-wizard',

  Credentials = 'awx-credentials',
  CreateCredential = 'awx-create-credential',
  EditCredential = 'awx-edit-credential',
  CredentialPage = 'awx-credential-page',
  CredentialDetails = 'awx-credential-details',
  CredentialAccess = 'awx-credentials-access',
  CredentialJobTemplates = 'awx-credentials-job-templates',

  Projects = 'awx-projects',
  CreateProject = 'awx-create-project',
  ProjectPage = 'awx-project-page',
  EditProject = 'awx-edit-project',
  ProjectDetails = 'awx-project-details',
  ProjectAccess = 'awx-project-access',
  ProjectJobTemplates = 'awx-project-job-templates',
  ProjectNotifications = 'awx-project-notifications',
  ProjectScheduleCreate = 'awx-project-schedule-create',
  ProjectScheduleEdit = 'awx-project-schedule-edit',
  ProjectSchedules = 'awx-project-schedules',

  ProjectSchedulePage = 'awx-project-schedule-page',
  ProjectScheduleDetails = 'awx-project-schedule-details',
  ProjectScheduleRules = 'awx-project-schedule-rules',
  ProjectCreateScheduleRules = 'awx-project-create-schedule-rules',

  Inventories = 'awx-inventories',
  CreateInventory = 'awx-create-inventory',
  CreateSmartInventory = 'awx-create-smart-inventory',
  CreateConstructedInventory = 'awx-create-constructed-inventory',
  EditInventory = 'awx-edit-inventory',
  InventoryPage = 'awx-inventory-page',
  InventoryHostPage = 'awx-inventory-host-page',
  InventoryDetails = 'awx-inventory-details',
  InventoryAccess = 'awx-inventory-access',
  InventoryGroups = 'awx-inventory-groups',
  InventoryGroupCreate = 'awx-inventory-group-create',
  InventoryGroupPage = 'awx-inventory-group-page',
  InventoryGroupEdit = 'awx-inventory-group-edit',
  InventoryGroupDetails = 'awx-inventory-group-details',
  InventoryGroupRelatedGroups = 'awx-inventory-group-related-groups',
  InventoryGroupRelatedGroupsCreate = 'awx-inventory-group-related-groups-create',
  InventoryGroupHost = 'awx-inventory-group-host',
  InventoryGroupHostAdd = 'awx-inventory-group-host-add',
  InventoryHosts = 'awx-inventory-hosts',
  InventoryHostAdd = 'awx-inventory-host-add',
  InventoryHostEdit = 'awx-inventory-host-edit',
  InventoryHostDetails = 'awx-inventory-host-details',
  InventoryHostGroups = 'awx-inventory-host-groups',
  InventoryHostJobs = 'awx-inventory-host-jobs',
  InventoryHostFacts = 'awx-inventory-host-facts',
  InventorySources = 'awx-inventory-sources',
  InventorySourcesAdd = `awx-inventory-sources-add`,
  InventorySourcePage = 'awx-inventory-source-page',
  InventorySourceDetail = 'awx-inventory-source-detail',
  InventorySourceNotifications = 'awx-inventory-source-notifications',
  InventoryJobs = 'awx-inventory-jobs',
  InventoryJobTemplates = 'awx-inventory-job-templates',
  InventorySourceEdit = 'awx-edit-inventory-source',
  InventorySourceSchedules = 'awx-inventory-schedules',
  InventorySourceScheduleCreate = 'awx-inventory-schedule-create',
  InventorySourceScheduleEdit = 'awx-inventory-schedule-edit',
  InventorySourceSchedulePage = 'awx-inventory-schedule-page',
  InventorySourceScheduleDetails = 'awx-inventory-schedule-details',
  InventorySourceScheduleRules = 'awx-inventory-schedule-rules',
  InventorySourceCreateScheduleRules = 'awx-inventory-source-create-schedule-rules',

  Hosts = 'awx-hosts',
  CreateHost = 'awx-create-host',
  EditHost = 'awx-edit-host',
  HostPage = 'awx-host-page',
  HostDetails = 'awx-host-details',
  HostFacts = 'awx-host-facts',
  HostGroups = 'awx-host-groups',
  HostJobs = 'awx-host-jobs',

  // Access
  Access = 'awx-access',

  Organizations = 'awx-organizations',
  CreateOrganization = 'awx-create-organization',
  EditOrganization = 'awx-edit-organization',
  OrganizationPage = 'awx-organization-page',
  OrganizationDetails = 'awx-organization-details',
  OrganizationUsers = 'awx-organization-users',
  OrganizationTeams = 'awx-organization-teams',
  OrganizationExecutionEnvironments = 'awx-organization-execution-environments',
  OrganizationNotifications = 'awx-organization-notifications',

  Teams = 'awx-teams',
  CreateTeam = 'awx-create-team',
  EditTeam = 'awx-edit-team',
  TeamPage = 'awx-team-page',
  TeamDetails = 'awx-team-details',
  TeamAccess = 'awx-team-access',
  TeamRoles = 'awx-team-roles',
  AddRolesToTeam = 'awx-add-roles-to-team',

  Users = 'awx-users',
  CreateUser = 'awx-create-user',
  EditUser = 'awx-edit-user',
  UserPage = 'awx-user-page',
  UserDetails = 'awx-user-details',
  UserOrganizations = 'awx-user-organizations',
  UserTeams = 'awx-user-teams',
  UserRoles = 'awx-user-roles',
  UserTokens = 'awx-user-tokens',
  AddRolesToUser = 'awx-add-roles-to-user',

  Roles = 'awx-roles',
  Role = 'awx-role',
  RoleDetails = 'awx-role-details',

  // Administration
  Administration = 'awx-administration',
  Infrastructure = 'awx-infrastructure',

  CredentialTypes = 'awx-credential-types',
  CredentialTypePage = 'awx-credential-type-page',
  CredentialTypeDetails = 'awx-credential-type-details',
  CredentialTypeCredentials = 'awx-credential-type-credentials',
  CreateCredentialType = 'awx-create-credential-type',
  EditCredentialType = 'awx-edit-credential-type',

  NotificationTemplates = 'awx-notification-templates',
  NotificationTemplatePage = 'awx-notification-template-page',
  NotificationTemplateDetails = 'awx-notification-template-details',
  EditNotificationTemplate = 'awx-edit-notification-template',
  AddNotificationTemplate = 'awx-add-notification-template',

  ManagementJobs = 'awx-management-jobs',
  ManagementJobPage = 'awx-management-job-page',
  ManagementJobDetails = 'awx-management-job-details',
  ManagementJobSchedules = 'awx-management-job-schedules',
  ManagementJobSchedulesDetails = 'awx-management-job-schedules-details',
  ManagementJobNotifications = 'awx-management-job-notifications',

  ManagementJobSchedulePage = 'awx-management-job-schedule-page',
  ManagementJobScheduleDetails = 'awx-management-job-schedule-details',
  ManagementJobScheduleRules = 'awx-management-job-schedule-rules',
  ManagementJobEditSchedule = 'awx-management-job-edit-schedule',
  ManagementJobScheduleCreate = 'awx-management-job-schedule-create',

  CreateInstanceGroup = 'awx-create-instance-group',
  EditInstanceGroup = 'awx-edit-instance-group',
  InstanceGroupPage = 'awx-instance-group-page',
  InstanceGroupDetails = 'awx-instance-group-details',
  InstanceGroups = 'awx-instance-groups',

  Instances = 'awx-instances',
  AddInstance = 'awx-add-instance',
  EditInstance = 'awx-edit-instance',
  InstancePage = 'awx-instance-page',
  InstanceDetails = 'awx-instance-details',
  InstancePeers = 'awx-instance-peers',
  InstanceListenerAddresses = 'awx-instance-listener-addresses',

  Applications = 'awx-applications',
  ApplicationPage = 'awx-application-page',
  ApplicationDetails = 'awx-application-details',
  ApplicationTokens = 'awx-application-tokens',
  CreateApplication = 'awx-create-application',
  EditApplication = 'awx-edit-application',

  ExecutionEnvironments = 'awx-execution-environments',
  ExecutionEnvironmentPage = 'awx-execution-environments-page',
  ExecutionEnvironmentDetails = 'awx-execution-environments-details',
  ExecutionEnvironmentTemplates = 'awx-execution-environments-templates',
  CreateExecutionEnvironment = 'awx-create-execution-environment',
  EditExecutionEnvironment = 'awx-edit-execution-environment',

  TopologyView = 'awx-topology-view',

  // Analytics
  Analytics = 'awx-analytics',
  Reports = 'awx-reports',
  AutomationCalculator = 'awx-automation-calculator',
  AnalyticsBuilder = 'awx-analytics-builder',
  HostMetrics = 'awx-host-metrics',
  SubscriptionUsage = 'awx-subscription-usage',

  // Settings
  Settings = 'awx-settings',
  SettingsPreferences = 'awx-settings-preferences',
  SettingsSystem = 'awx-settings-system',
  SettingsJobs = 'awx-settings-jobs',
  SettingsLogging = 'awx-settings-logging',
  SettingsCustomizeLogin = 'awx-settings-customize-login',
  SettingsTroubleshooting = 'awx-settings-troubleshooting',
  SettingsAuthentication = 'awx-settings-authentication',
  SettingsCategory = 'awx-settings-category',

  Login = 'awx-login',
}
