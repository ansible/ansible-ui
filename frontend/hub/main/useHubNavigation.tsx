import { PageNotImplemented } from '@ansible/ansible-ui-framework';
import { PageNavigationItem } from '@ansible/ansible-ui-framework/PageNavigation/PageNavigationItem';
import { PageSettingsDetails } from '@ansible/ansible-ui-framework/PageSettings/PageSettingsDetails';
import { PageSettingsForm } from '@ansible/ansible-ui-framework/PageSettings/PageSettingsForm';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router';
import { HubRoles } from '../access/roles/HubRoles';
import { HubRoleDetails } from '../access/roles/RolePage/HubRoleDetails';
import { CreateRole, EditRole } from '../access/roles/RolePage/HubRoleForm';
import { HubRolePage } from '../access/roles/RolePage/HubRolePage';
import { HubTeamRoles } from '../access/teams/TeamPage/TeamUserRole';
import { HubAddTeamRoles } from '../access/teams/components/HubAddTeamRoles';
import { Token } from '../access/token/Token';
import { HubUserRoles } from '../access/users/UserPage/HubUserRoles';
import { HubAddUserRoles } from '../access/users/components/HubAddUserRoles';
import { Approvals } from '../administration/collection-approvals/Approvals';
import { RemoteRegistries } from '../administration/remote-registries/RemoteRegistries';
import {
  CreateRemoteRegistry,
  EditRemoteRegistry,
} from '../administration/remote-registries/RemoteRegistryForm';
import { RemoteRegistryDetails } from '../administration/remote-registries/RemoteRegistryPage/RemoteRegistryDetails';
import { RemoteRegistryPage } from '../administration/remote-registries/RemoteRegistryPage/RemoteRegistryPage';
import { CreateRemote, EditRemote } from '../administration/remotes/RemoteForm';
import { RemoteAddUsers } from '../administration/remotes/RemotePage/RemoteAddUser';
import { RemoteAssignTeams } from '../administration/remotes/RemotePage/RemoteAssignTeam';
import { RemoteDetails } from '../administration/remotes/RemotePage/RemoteDetails';
import { RemotePage } from '../administration/remotes/RemotePage/RemotePage';
import { RemoteTeamAccess } from '../administration/remotes/RemotePage/RemoteTeamAccess';
import { RemoteUserAccess } from '../administration/remotes/RemotePage/RemoteUserAccess';
import { Remotes } from '../administration/remotes/Remotes';
import { Repositories } from '../administration/repositories/Repositories';
import { RepositoryForm } from '../administration/repositories/RepositoryForm';
import { RepositoryAddUsers } from '../administration/repositories/RepositoryPage/RepositoryAddUser';
import { RepositoryAssignTeams } from '../administration/repositories/RepositoryPage/RepositoryAssignTeam';
import { RepositoryCollectionVersion } from '../administration/repositories/RepositoryPage/RepositoryCollectionVersion';
import { RepositoryDetails } from '../administration/repositories/RepositoryPage/RepositoryDetails';
import { RepositoryDistributions } from '../administration/repositories/RepositoryPage/RepositoryDistributions';
import { RepositoryPage } from '../administration/repositories/RepositoryPage/RepositoryPage';
import { RepositoryTeamAccess } from '../administration/repositories/RepositoryPage/RepositoryTeamAccess';
import { RepositoryUserAccess } from '../administration/repositories/RepositoryPage/RepositoryUserAccess';
import { RepositoryVersions } from '../administration/repositories/RepositoryPage/RepositoryVersions';
import { RepositoryVersionCollections } from '../administration/repositories/RepositoryVersionPage/RepositoryVersionCollections';
import { RepositoryVersionDetails } from '../administration/repositories/RepositoryVersionPage/RepositoryVersionDetails';
import { RepositoryVersionPage } from '../administration/repositories/RepositoryVersionPage/RepositoryVersionPage';
import { SignatureKeys } from '../administration/signature-keys/SignatureKeys';
import { TaskDetails } from '../administration/tasks/TaskDetails';
import { Tasks } from '../administration/tasks/Tasks';
import { CollectionContents } from '../collections/CollectionPage/CollectionContents';
import { CollectionDependencies } from '../collections/CollectionPage/CollectionDependencies';
import { CollectionDetails } from '../collections/CollectionPage/CollectionDetails';
import { CollectionDistributions } from '../collections/CollectionPage/CollectionDistributions';
import { CollectionDocumentation } from '../collections/CollectionPage/CollectionDocumentation';
import { CollectionImportLog } from '../collections/CollectionPage/CollectionImportLog';
import { CollectionInstall } from '../collections/CollectionPage/CollectionInstall';
import { CollectionPage } from '../collections/CollectionPage/CollectionPage';
import { CollectionSignatureUpload } from '../collections/CollectionSignatureUpload';
import { Collections } from '../collections/Collections';
import { UploadCollection } from '../collections/UploadCollection';
import {
  CreateExecutionEnvironment,
  EditExecutionEnvironment,
} from '../execution-environments/ExecutionEnvironmentForm';
import { ExecutionEnvironmentActivity } from '../execution-environments/ExecutionEnvironmentPage/ExecutionEnvironmentActivity';
import { ExecutionEnvironmentAddUsers } from '../execution-environments/ExecutionEnvironmentPage/ExecutionEnvironmentAddUser';
import { ExecutionEnvironmentAssignTeams } from '../execution-environments/ExecutionEnvironmentPage/ExecutionEnvironmentAssignTeam';
import { ExecutionEnvironmentDetails } from '../execution-environments/ExecutionEnvironmentPage/ExecutionEnvironmentDetails';
import { ExecutionEnvironmentImageDetails } from '../execution-environments/ExecutionEnvironmentPage/ExecutionEnvironmentImageDetails';
import { ExecutionEnvironmentImagePage } from '../execution-environments/ExecutionEnvironmentPage/ExecutionEnvironmentImagePage';
import { ExecutionEnvironmentImages } from '../execution-environments/ExecutionEnvironmentPage/ExecutionEnvironmentImages';
import { ExecutionEnvironmentPage } from '../execution-environments/ExecutionEnvironmentPage/ExecutionEnvironmentPage';
import { ExecutionEnvironmentTeamAccess } from '../execution-environments/ExecutionEnvironmentPage/ExecutionEnvironmentTeamAccess';
import { ExecutionEnvironmentUserAccess } from '../execution-environments/ExecutionEnvironmentPage/ExecutionEnvironmentUserAccess';
import { ExecutionEnvironments } from '../execution-environments/ExecutionEnvironments';
import { MyImports } from '../my-imports/MyImports';
import { CreateHubNamespace, EditHubNamespace } from '../namespaces/HubNamespaceForm';
import { HubNamespaceCLI } from '../namespaces/HubNamespacePage/HubNamespaceCLI';
import { HubNamespaceCollections } from '../namespaces/HubNamespacePage/HubNamespaceCollections';
import { HubNamespaceDetails } from '../namespaces/HubNamespacePage/HubNamespaceDetails';
import { HubNamespacePage } from '../namespaces/HubNamespacePage/HubNamespacePage';
import { HubNamespaceTeamAccess } from '../namespaces/HubNamespacePage/HubNamespaceTeamAccess';
import { HubNamespaceUserAccess } from '../namespaces/HubNamespacePage/HubNamespaceUserAccess';
import { Namespaces } from '../namespaces/HubNamespaces';
import { HubNamespaceAddUsers } from '../namespaces/components/HubNamespaceAddUsers';
import { HubNamespaceAssignTeams } from '../namespaces/components/HubNamespaceAssignTeams';
import { HubOverview } from '../overview/HubOverview';
import { HubRoute } from './HubRoutes';
import { RemoteManageUsers } from '../administration/remotes/RemotePage/RemoteManageUser';
import { ExecutionEnvironmentManageUsers } from '../execution-environments/ExecutionEnvironmentPage/ExecutionEnvironmentManageUser';
import { HubNamespaceManageUsers } from '../namespaces/components/HubNamespaceManageUsers';
import { RepositoryManageUsers } from '../administration/repositories/RepositoryPage/RepositoryManageUser';

export function useHubNavigation() {
  const { t } = useTranslation();
  const navigationItems: PageNavigationItem[] = [
    {
      id: HubRoute.Overview,
      label: t('Overview'),
      path: 'overview',
      element: <HubOverview />,
    },
    {
      id: HubRoute.Namespaces,
      label: t('Namespaces'),
      path: 'namespaces',
      children: [
        {
          id: HubRoute.CreateNamespace,
          path: 'create',
          element: <CreateHubNamespace />,
        },
        {
          id: HubRoute.EditNamespace,
          path: 'edit/:id',
          element: <EditHubNamespace />,
        },
        {
          id: HubRoute.NamespacePage,
          path: ':id',
          element: <HubNamespacePage />,
          children: [
            {
              id: HubRoute.NamespaceCollections,
              path: 'collections',
              element: <HubNamespaceCollections />,
            },
            {
              id: HubRoute.NamespaceDetails,
              path: 'details',
              element: <HubNamespaceDetails />,
            },
            {
              id: HubRoute.NamespaceCLI,
              path: 'cli',
              element: <HubNamespaceCLI />,
            },
            {
              id: HubRoute.NamespaceTeamAccess,
              path: 'team-access',
              element: <HubNamespaceTeamAccess />,
            },
            {
              id: HubRoute.NamespaceUserAccess,
              path: 'user-access',
              element: <HubNamespaceUserAccess />,
            },
            {
              path: '',
              element: <Navigate to="details" replace />,
            },
          ],
        },
        {
          id: HubRoute.NamespaceAddUsers,
          path: ':id/user-access/add',
          element: <HubNamespaceAddUsers />,
        },
        {
          id: HubRoute.NamespaceManageUsers,
          path: ':id/:resource_id/user-access/:resource_type/:user_id/manage',
          // eslint-disable-next-line react/jsx-no-undef
          element: <HubNamespaceManageUsers />,
        },
        {
          id: HubRoute.NamespaceAssignTeams,
          path: ':id/team-access/assign',
          element: <HubNamespaceAssignTeams />,
        },
        {
          path: '',
          element: <Namespaces />,
        },
      ],
    },
    {
      id: HubRoute.Collections,
      label: t('Collections'),
      path: 'collections',
      children: [
        {
          id: HubRoute.UploadCollection,
          path: 'upload',
          element: <UploadCollection />,
        },
        {
          id: HubRoute.CollectionSignatureUpload,
          path: 'signature-upload',
          element: <CollectionSignatureUpload />,
        },
        {
          id: HubRoute.CollectionPage,
          path: ':repository/:namespace/:name',
          element: <CollectionPage />,
          children: [
            {
              id: HubRoute.CollectionDetails,
              path: 'details',
              element: <CollectionDetails />,
            },
            {
              id: HubRoute.CollectionInstall,
              path: 'install',
              element: <CollectionInstall />,
            },
            {
              id: HubRoute.CollectionDocumentation,
              path: 'documentation',
              element: <CollectionDocumentation />,
            },
            {
              id: HubRoute.CollectionDocumentation,
              path: 'documentation/:content_name',
              element: <CollectionDocumentation />,
            },
            {
              id: HubRoute.CollectionDocumentationContent,
              path: 'documentation/:content_type/:content_name',
              element: <CollectionDocumentation />,
            },
            {
              id: HubRoute.CollectionContents,
              path: 'contents',
              element: <CollectionContents />,
            },
            {
              id: HubRoute.CollectionImportLog,
              path: 'import_log',
              element: <CollectionImportLog />,
            },
            {
              id: HubRoute.CollectionDistributions,
              path: 'distributions',
              element: <CollectionDistributions />,
            },
            {
              id: HubRoute.CollectionDependencies,
              path: 'dependencies',
              element: <CollectionDependencies />,
            },
            {
              path: '',
              element: <Navigate to="details" replace />,
            },
          ],
        },
        {
          path: '',
          element: <Collections />,
        },
      ],
    },
    {
      id: HubRoute.ExecutionEnvironments,
      label: t('Execution Environments'),
      path: 'execution-environments',
      children: [
        {
          id: HubRoute.CreateExecutionEnvironment,
          path: 'create',
          element: <CreateExecutionEnvironment />,
        },
        {
          id: HubRoute.EditExecutionEnvironment,
          path: ':id/edit',
          element: <EditExecutionEnvironment />,
        },
        {
          path: ':id/',
          id: HubRoute.ExecutionEnvironmentPage,
          element: <ExecutionEnvironmentPage />,
          children: [
            {
              id: HubRoute.ExecutionEnvironmentDetails,
              path: 'details',
              element: <ExecutionEnvironmentDetails />,
            },
            {
              id: HubRoute.ExecutionEnvironmentActivity,
              path: 'activity',
              element: <ExecutionEnvironmentActivity />,
            },
            {
              id: HubRoute.ExecutionEnvironmentImages,
              path: 'images',
              element: <ExecutionEnvironmentImages />,
            },
            {
              id: HubRoute.ExecutionEnvironmentTeamAccess,
              path: 'team-access',
              element: <ExecutionEnvironmentTeamAccess />,
            },
            {
              id: HubRoute.ExecutionEnvironmentUserAccess,
              path: 'user-access',
              element: <ExecutionEnvironmentUserAccess />,
            },
            {
              path: '',
              element: <Navigate to="details" replace />,
            },
          ],
        },
        {
          id: HubRoute.ExecutionEnvironmentAssignTeams,
          path: ':id/team-access/assign',
          element: <ExecutionEnvironmentAssignTeams />,
        },
        {
          id: HubRoute.ExecutionEnvironmentAddUsers,
          path: ':id/user-access/add',
          element: <ExecutionEnvironmentAddUsers />,
        },
        {
          id: HubRoute.ExecutionEnvironmentManageUsers,
          path: ':id/:resource_id/user-access/:resource_type/:user_id/manage',
          element: <ExecutionEnvironmentManageUsers />,
        },
        {
          id: HubRoute.ExecutionEnvironmentImagePage,
          path: ':id/images/:tag/',
          element: <ExecutionEnvironmentImagePage />,
          children: [
            {
              id: HubRoute.ExecutionEnvironmentImageDetails,
              path: '',
              element: <ExecutionEnvironmentImageDetails />,
            },
          ],
        },
        {
          path: '',
          element: <ExecutionEnvironments />,
        },
      ],
    },
    {
      label: t('Administration'),
      path: 'administration',
      children: [
        {
          id: HubRoute.SignatureKeys,
          label: t('Signature Keys'),
          path: 'signature-keys',
          children: [
            {
              path: '',
              element: <SignatureKeys />,
            },
          ],
        },
        {
          id: HubRoute.Repositories,
          label: t('Repositories'),
          path: 'repositories',
          children: [
            {
              path: '',
              element: <Repositories />,
            },
            {
              path: 'create',
              id: HubRoute.CreateRepository,
              element: <RepositoryForm />,
            },
            {
              path: 'edit/:id',
              id: HubRoute.EditRepository,
              element: <RepositoryForm />,
            },
            {
              path: ':id/',
              id: HubRoute.RepositoryPage,
              element: <RepositoryPage />,
              children: [
                {
                  path: 'details',
                  id: HubRoute.RepositoryDetails,
                  element: <RepositoryDetails />,
                },
                {
                  path: 'team-access',
                  id: HubRoute.RepositoryTeamAccess,
                  element: <RepositoryTeamAccess />,
                },
                {
                  path: 'user-access',
                  id: HubRoute.RepositoryUserAccess,
                  element: <RepositoryUserAccess />,
                },
                {
                  path: 'collection-version',
                  id: HubRoute.RepositoryCollectionVersion,
                  element: <RepositoryCollectionVersion />,
                },
                {
                  path: 'versions',
                  id: HubRoute.RepositoryVersions,
                  element: <RepositoryVersions />,
                },
                {
                  path: 'distributions',
                  id: HubRoute.RepositoryDistributions,
                  element: <RepositoryDistributions />,
                },
                {
                  path: '',
                  element: <Navigate to="details" replace />,
                },
              ],
            },
            {
              id: HubRoute.RepositoryAssignTeams,
              path: ':id/team-access/assign',
              element: <RepositoryAssignTeams />,
            },
            {
              id: HubRoute.RepositoryAddUsers,
              path: ':id/users-access/add',
              element: <RepositoryAddUsers />,
            },
            {
              id: HubRoute.RepositoryManageUsers,
              path: ':id/:resource_id/user-access/:resource_type/:user_id/manage',
              element: <RepositoryManageUsers />,
            },
            {
              path: ':id/versions-details/:version/',
              id: HubRoute.RepositoryVersionPage,
              element: <RepositoryVersionPage />,
              children: [
                {
                  path: 'details',
                  id: HubRoute.RepositoryVersionDetails,
                  element: <RepositoryVersionDetails />,
                },
                {
                  path: 'collections',
                  id: HubRoute.RepositoryVersionCollections,
                  element: <RepositoryVersionCollections />,
                },
                {
                  path: '',
                  element: <Navigate to="details" replace />,
                },
              ],
            },
          ],
        },
        {
          id: HubRoute.RemoteRegistries,
          label: t('Remote Registries'),
          path: 'remote-registries',
          children: [
            {
              path: '',
              element: <RemoteRegistries />,
            },
            {
              path: 'create',
              id: HubRoute.CreateRemoteRegistry,
              element: <CreateRemoteRegistry />,
            },
            {
              path: ':id/edit',
              id: HubRoute.EditRemoteRegistry,
              element: <EditRemoteRegistry />,
            },
            {
              path: ':id',
              id: HubRoute.RemoteRegistryPage,
              element: <RemoteRegistryPage />,
              children: [
                {
                  id: HubRoute.RemoteRegistryDetails,
                  path: 'details',
                  element: <RemoteRegistryDetails />,
                },
                {
                  path: '',
                  element: <Navigate to="details" replace />,
                },
              ],
            },
          ],
        },
        {
          id: HubRoute.Tasks,
          label: t('Task Management'),
          path: 'tasks',
          children: [
            {
              id: HubRoute.TaskPage,
              path: ':id/',
              element: <TaskDetails />,
            },
            {
              path: '',
              element: <Tasks />,
            },
          ],
        },
        {
          id: HubRoute.Approvals,
          label: t('Collection Approvals'),
          path: 'approvals',
          children: [
            {
              path: '',
              element: <Approvals />,
            },
          ],
        },
        {
          id: HubRoute.Remotes,
          label: t('Remotes'),
          path: 'remotes',
          children: [
            {
              id: HubRoute.CreateRemote,
              path: 'create',
              element: <CreateRemote />,
            },
            {
              id: HubRoute.EditRemote,
              path: ':id/edit',
              element: <EditRemote />,
            },
            {
              path: ':id/',
              id: HubRoute.RemotePage,
              element: <RemotePage />,
              children: [
                {
                  path: 'details',
                  id: HubRoute.RemoteDetails,
                  element: <RemoteDetails />,
                },
                {
                  path: 'user-access',
                  id: HubRoute.RemoteUserAccess,
                  element: <RemoteUserAccess />,
                },
                {
                  path: 'team-access',
                  id: HubRoute.RemoteTeamAccess,
                  element: <RemoteTeamAccess />,
                },
                {
                  path: '',
                  element: <Navigate to="details" replace />,
                },
              ],
            },
            {
              id: HubRoute.RemoteAddUsers,
              path: ':id/user-access/add',
              element: <RemoteAddUsers />,
            },
            {
              id: HubRoute.RemoteManageUsers,
              path: ':id/:resource_id/user-access/:resource_type/:user_id/manage',
              element: <RemoteManageUsers />,
            },
            {
              id: HubRoute.RemoteAssignTeams,
              path: ':id/team-access/assign',
              element: <RemoteAssignTeams />,
            },
            {
              path: '',
              element: <Remotes />,
            },
          ],
        },
      ],
    },
    {
      id: HubRoute.APIToken,
      label: t('API Token'),
      path: 'api-token',
      element: <Token />,
    },
    {
      id: HubRoute.Access,
      label: t('Access Management'),
      path: 'access',
      children: [
        {
          id: HubRoute.Organizations,
          label: t('Organizations'),
          path: 'organizations',
          element: <PageNotImplemented />,
        },
        {
          id: HubRoute.Teams,
          label: t('Teams'),
          path: 'teams',
          children: [
            {
              id: HubRoute.TeamPage,
              path: ':id',
              children: [
                {
                  id: HubRoute.TeamDetails,
                  path: 'details',
                  element: <PageNotImplemented />,
                },
                {
                  id: HubRoute.TeamRoles,
                  path: 'roles',
                  element: <HubTeamRoles />,
                },
              ],
            },
            {
              id: HubRoute.TeamAddRoles,
              path: ':id/roles/add-roles',
              element: <HubAddTeamRoles />,
            },
          ],
        },
        {
          id: HubRoute.Users,
          label: t('Users'),
          path: 'users',
          children: [
            {
              id: HubRoute.UserPage,
              path: ':id',
              children: [
                {
                  id: HubRoute.UserDetails,
                  path: 'details',
                  element: <PageNotImplemented />,
                },
                {
                  id: HubRoute.UserRoles,
                  path: 'roles',
                  element: <HubUserRoles />,
                },
              ],
            },
            {
              id: HubRoute.UserAddRoles,
              path: ':id/roles/add-roles',
              element: <HubAddUserRoles />,
            },
          ],
        },
        {
          id: HubRoute.Roles,
          label: t('Roles'),
          path: 'roles',
          children: [
            {
              id: HubRoute.CreateRole,
              path: 'create',
              element: <CreateRole />,
            },
            {
              id: HubRoute.EditRole,
              path: ':id/edit',
              element: <EditRole />,
            },
            {
              id: HubRoute.RolePage,
              path: ':id/',
              element: <HubRolePage />,
              children: [
                {
                  id: HubRoute.RoleDetails,
                  path: 'details',
                  element: <HubRoleDetails />,
                },
                {
                  path: '',
                  element: <Navigate to="details" replace />,
                },
              ],
            },
            {
              path: '',
              element: <HubRoles />,
            },
          ],
        },
        {
          id: HubRoute.APIToken,
          label: t('API Token'),
          path: 'api-token',
          element: <Token />,
        },
      ],
    },
    {
      id: HubRoute.MyImports,
      label: t('My imports'),
      path: 'my-imports',
      element: <MyImports />,
      hidden: true,
    },
    {
      id: HubRoute.Settings,
      label: t('Settings'),
      path: 'settings',
      children: [
        {
          id: HubRoute.SettingsPreferences,
          label: t('User Preferences'),
          path: 'preferences',
          children: [
            {
              path: 'edit',
              element: <PageSettingsForm />,
            },
            {
              path: '',
              element: <PageSettingsDetails />,
            },
          ],
        },
      ],
    },
    {
      path: '',
      element: <Navigate to={'./overview'} replace />,
    },
  ];
  return navigationItems;
}
