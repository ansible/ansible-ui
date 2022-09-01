export enum RouteE {
    // Views
    Dashboard = '/dashboard',
    Jobs = '/jobs',
    Schedules = '/schedules',
    ActivityStream = '/activity-stream',
    WorkflowApprovals = '/workflow-approvals',

    // Resources
    Templates = '/templates',
    Credentials = '/credentials',
    Projects = '/projects',
    ProjectDetails = '/projects/:id/details',
    ProjectEdit = '/projects/:id/edit',
    Inventories = '/inventories',
    Hosts = '/hosts',

    // Access
    Organizations = '/organizations',
    OrganizationDetails = '/organizations/details/:id',
    CreateOrganization = '/organizations/create',
    EditOrganization = '/organizations/edit/:id',
    Users = '/users',
    UserDetails = '/users/:id/details',
    CreateUser = '/users/create',
    EditUser = '/users/:id/edit',

    Teams = '/teams',
    TeamDetails = '/teams/details/:id',
    CreateTeam = '/teams/create',
    EditTeam = '/teams/edit/:id',

    // Administration
    CredentialTypes = '/credential-types',
    Notifications = '/notifications',
    ManagementJobs = '/management-jobs',
    InstanceGroups = '/instance-groups',
    Instances = '/instances',
    Applications = '/applications',
    ExecutionEnvironments = '/execution-environments',
    TopologyView = '/topology-view',

    // Settings
    Settings = '/settings',
    Login = '/login',
}
