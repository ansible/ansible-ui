import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import { PageNotImplemented } from '../../framework';
import { PageNavigationItem } from '../../framework/PageNavigation/PageNavigationItem';
import { HubRoute } from './HubRoutes';
import { Roles } from './access/roles/Roles';
import { Approvals } from './approvals/Approvals';
import { CollectionDetails } from './collections/CollectionDetails';
import { CollectionSignatureUpload } from './collections/CollectionSignatureUpload';
import { Collections } from './collections/Collections';
import { UploadCollection } from './collections/UploadCollection';
import { HubDashboard } from './dashboard/Dashboard';
import {
  CreateExecutionEnvironment,
  EditExecutionEnvironment,
} from './execution-environments/ExecutionEnvironmentForm';
import { ExecutionEnvironments } from './execution-environments/ExecutionEnvironments';
import { CreateHubNamespace, EditHubNamespace } from './namespaces/HubNamespaceForm';
import { HubNamespaceDetails } from './namespaces/HubNamespacePage/HubNamespaceDetails';
import { HubNamespacePage } from './namespaces/HubNamespacePage/HubNamespacePage';
import { Namespaces } from './namespaces/HubNamespaces';
import { RemoteRegistries } from './remote-registries/RemoteRegistries';
import { RemoteRegistryDetails } from './remote-registries/RemoteRegistryDetails';
import { CreateRemoteRegistry, EditRemoteRegistry } from './remote-registries/RemoteRegistryForm';
import { RemoteDetails } from './remotes/RemoteDetails';
import { CreateRemote, EditRemote } from './remotes/RemoteForm';
import { Remotes } from './remotes/Remotes';
import { Repositories } from './repositories/Repositories';
import { SignatureKeys } from './signature-keys/SignatureKeys';
import { TaskDetails } from './tasks/TaskDetails';
import { Tasks } from './tasks/Tasks';
import { Token } from './token/Token';

export function useHubNavigation() {
  const { t } = useTranslation();
  const navigationItems: PageNavigationItem[] = [
    {
      id: HubRoute.Overview,
      label: t('Overview'),
      path: 'overview',
      element: <HubDashboard />,
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
          path: ':id',
          element: <EditHubNamespace />,
        },
        {
          id: HubRoute.NamespacePage,
          path: ':id',
          element: <HubNamespacePage />,
          children: [
            {
              id: HubRoute.NamespaceDetails,
              path: 'details',
              element: <HubNamespaceDetails />,
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
          path: ':id/*',
          element: <CollectionDetails />,
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
              path: ':id/*',
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
              element: <PageNotImplemented />,
            },
            {
              id: HubRoute.EditRole,
              path: ':id/edit',
              element: <PageNotImplemented />,
            },
            {
              id: HubRoute.RolePage,
              path: ':id/',
              children: [
                {
                  id: HubRoute.RoleDetails,
                  path: 'details',
                  element: <PageNotImplemented />,
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
