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
    HostsDetails = '/controller/hosts/details/:id',
    CreateHosts = '/controller/hosts/create',
    EditHosts = '/controller/hosts/edit/:id',

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
