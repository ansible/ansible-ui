export enum HubRoute {
  Hub = 'hub',

  Overview = 'hub-overview',

  // Automation Content
  Namespaces = 'hub-namespaces',
  CreateNamespace = 'hub-create-namespace',
  EditNamespace = 'hub-edit-namespace',
  NamespacePage = 'hub-namespace-page',
  NamespaceDetails = 'hub-namespace-details',
  NamespaceCLI = 'hub-namespace-cli',

  CollectionSignatureUpload = 'hub-signature-upload',
  Collections = 'hub-collections',
  UploadCollection = 'hub-create-collection',
  CollectionPage = 'hub-collection-page',
  CollectionDetails = 'hub-collection-details',
  CollectionInstall = 'hub-collection-install',
  CollectionDocumentation = 'hub-collection-documentation',
  CollectionContents = 'hub-collection-contents',
  CollectionImportLog = 'hub-collection-page-import-log',
  CollectionDistributions = 'hub-collection-distributions',
  CollectionDependencies = 'hub-collection-dependencies',

  ExecutionEnvironments = 'hub-execution-environments',
  EditExecutionEnvironment = 'hub-edit-execution-environment',
  CreateExecutionEnvironment = 'hub-create-execution-environment',

  SignatureKeys = 'hub-signature-keys',

  // Administration
  Repositories = 'hub-repositories',
  CreateRepository = 'hub-create-repository',
  EditRepository = 'hub-edit-repository',
  RepositoryPage = 'hub-repository-page',
  RepositoryDetails = 'hub-repository-page-details',
  RepositoryAccess = 'hub-repository-page-access',
  RepositoryCollectionVersion = 'hub-repository-page-collection-version',
  RepositoryVersions = 'hub-repository-page-versions',
  RepositoryVersionPage = 'hub-repository-page-version-page',
  RepositoryVersionDetails = 'hub-repository-page-version-page-details',
  RepositoryVersionCollections = 'hub-repository-page-version-page-collections',

  RemoteRegistries = 'hub-remote-registries',
  CreateRemoteRegistry = 'hub-create-remote-registry',
  EditRemoteRegistry = 'hub-edit-remote-registry',
  RemoteRegistryPage = 'hub-remote-registry-page',

  Tasks = 'hub-tasks',
  TaskPage = 'hub-task-page',

  Approvals = 'hub-approvals',

  Remotes = 'hub-remotes',
  CreateRemote = 'hub-create-remote',
  EditRemote = 'hub-edit-remote',
  RemotePage = 'hub-remote-page',

  // Access
  Access = 'hub-access',
  Organizations = 'hub-organizations',
  Teams = 'hub-teams',
  Users = 'hub-users',
  APIToken = 'hub-api-token',
  Roles = 'hub-roles',
  CreateRole = 'hub-create-role',
  RolePage = 'hub-role-page',
  RoleDetails = 'hub-role-details',
  EditRole = 'hub-edit-role',

  Login = 'hub-login',
}
