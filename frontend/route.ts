/* istanbul ignore file */

export enum RouteE {
    // Views
    Dashboard = '/controller/dashboard',
    Jobs = '/controller/jobs',
    Schedules = '/controller/schedules',
    ActivityStream = '/controller/activity-stream',
    WorkflowApprovals = '/controller/workflow-approvals',

    // Resources
    Templates = '/controller/templates',
    Credentials = '/controller/credentials',
    Projects = '/controller/projects',
    ProjectDetails = '/controller/projects/:id/details',
    ProjectEdit = '/controller/projects/:id/edit',
    Inventories = '/controller/inventories',
    Hosts = '/controller/hosts',

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
    Instances = '/controller/instances',
    Applications = '/controller/applications',
    ExecutionEnvironments = '/controller/execution-environments',
    TopologyView = '/controller/topology-view',

    // Settings
    Settings = '/controller/settings',

    Debug = '/debug',
    Login = '/controller/login',
}
