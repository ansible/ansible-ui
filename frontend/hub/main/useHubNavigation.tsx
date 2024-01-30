import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import { PageNotImplemented } from '../../../framework';
import { PageNavigationItem } from '../../../framework/PageNavigation/PageNavigationItem';
import { RoleDetails } from '../access/roles/RolePage/RoleDetails';
import { CreateRole, EditRole } from '../access/roles/RolePage/RoleForm';
import { RolePage } from '../access/roles/RolePage/RolePage';
import { Roles } from '../access/roles/Roles';
import { Token } from '../access/token/Token';
import { Approvals } from '../administration/collection-approvals/Approvals';
import { RemoteRegistries } from '../administration/remote-registries/RemoteRegistries';
import { RemoteRegistryDetails } from '../administration/remote-registries/RemoteRegistryDetails';
import {
  CreateRemoteRegistry,
  EditRemoteRegistry,
} from '../administration/remote-registries/RemoteRegistryForm';
import { RemoteDetails } from '../administration/remotes/RemoteDetails';
import { CreateRemote, EditRemote } from '../administration/remotes/RemoteForm';
import { Remotes } from '../administration/remotes/Remotes';
import { Repositories } from '../administration/repositories/Repositories';
import { RepositoryAccess } from '../administration/repositories/RepositoryPage/RepositoryAccess';
import { RepositoryCollectionVersion } from '../administration/repositories/RepositoryPage/RepositoryCollectionVersion';
import { RepositoryDetails } from '../administration/repositories/RepositoryPage/RepositoryDetails';
import { RepositoryForm } from '../administration/repositories/RepositoryForm';
import { RepositoryPage } from '../administration/repositories/RepositoryPage/RepositoryPage';
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
import { ExecutionEnvironments } from '../execution-environments/ExecutionEnvironments';
import { CreateHubNamespace, EditHubNamespace } from '../namespaces/HubNamespaceForm';
import { HubNamespaceCLI } from '../namespaces/HubNamespacePage/HubNamespaceCLI';
import { HubNamespaceCollections } from '../namespaces/HubNamespacePage/HubNamespaceCollections';
import { HubNamespaceDetails } from '../namespaces/HubNamespacePage/HubNamespaceDetails';
import { HubNamespacePage } from '../namespaces/HubNamespacePage/HubNamespacePage';
import { Namespaces } from '../namespaces/HubNamespaces';
import { HubOverview } from '../overview/HubOverview';
import { HubRoute } from './HubRoutes';

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
              path: '',
              element: <Navigate to="details" />,
            },
          ],
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
              element: <Navigate to="details" />,
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
                  path: 'access',
                  id: HubRoute.RepositoryAccess,
                  element: <RepositoryAccess />,
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
                  path: '',
                  element: <Navigate to="details" />,
                },
              ],
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
                  element: <Navigate to="details" />,
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
              path: 'details/:id/*',
              id: HubRoute.RemoteRegistryPage,
              element: <RemoteRegistryDetails />,
            },
          ],
        },
        {
          id: HubRoute.Tasks,
          label: t('Tasks'),
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
              id: HubRoute.RemotePage,
              path: 'details/:id/*',
              element: <RemoteDetails />,
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
      id: HubRoute.Access,
      label: t('Access'),
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
          element: <PageNotImplemented />,
        },
        {
          id: HubRoute.Users,
          label: t('Users'),
          path: 'users',
          element: <PageNotImplemented />,
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
              element: <RolePage />,
              children: [
                {
                  id: HubRoute.RoleDetails,
                  path: 'details',
                  element: <RoleDetails />,
                },
                {
                  path: '',
                  element: <Navigate to="details" />,
                },
              ],
            },
            {
              path: '',
              element: <Roles />,
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
      path: '',
      element: <Navigate to={'./overview'} />,
    },
  ];
  return navigationItems;
}
