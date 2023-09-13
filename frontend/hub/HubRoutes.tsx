export enum HubRoute {
  Hub = 'hub',

  Dashboard = 'hub-dashboard',

  // Automation Content
  Namespaces = 'hub-namespaces',
  CreateNamespace = 'hub-create-namespace',
  EditNamespace = 'hub-edit-namespace',
  NamespaceDetails = 'hub-namespace-details',

  Collections = 'hub-collections',
  UploadCollection = 'hub-create-collection',
  CollectionDetails = 'hub-collection-details',

  ExecutionEnvironments = 'hub-execution-environments',

  SignatureKeys = 'hub-signature-keys',

  // Administration
  Repositories = 'hub-repositories',

  RemoteRegistries = 'hub-remote-registries',

  Tasks = 'hub-tasks',
  TaskDetails = 'hub-task-details',

  Approvals = 'hub-approvals',

  Remotes = 'hub-remotes',
  CreateRemote = 'hub-create-remote',
  EditRemote = 'hub-edit-remote',
  RemoteDetails = 'hub-remote-details',

  // Access
  APIToken = 'hub-api-token',

  Login = 'hub-login',
}
