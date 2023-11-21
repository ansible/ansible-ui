import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import {
  PageNavigationItem,
  removeLeadingSlash,
} from '../../framework/PageNavigation/PageNavigationItem';
import { Login } from '../common/Login';
import { HubRoute } from './HubRoutes';
import { Approvals } from './approvals/Approvals';
import { CollectionDetails } from './collections/CollectionDetails';
import { CollectionSignatureUpload } from './collections/CollectionSignatureUpload';
import { Collections } from './collections/Collections';
import { UploadCollection } from './collections/UploadCollection';
import { HubDashboard } from './dashboard/Dashboard';
import { ExecutionEnvironments } from './execution-environments/ExecutionEnvironments';
import {
  CreateExecutionEnvironment,
  EditExecutionEnvironment,
} from './execution-environments/ExecutionEnvironmentForm';
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
  const pageNavigationItems = useMemo<PageNavigationItem[]>(() => {
    const navigationItems: PageNavigationItem[] = [
      {
        label: '',
        path: removeLeadingSlash(process.env.HUB_ROUTE_PREFIX),
        children: [
          {
            id: HubRoute.Dashboard,
            label: t('Dashboard'),
            path: 'dashboard',
            element: <HubDashboard />,
          },
          {
            label: t('Automation Content'),
            path: 'automation-content',
            children: [
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
            ],
          },
          {
            label: t('Administration'),
            path: 'administration',
            children: [
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
                label: t('Approvals'),
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
            label: t('Access'),
            path: 'access',
            children: [
              {
                id: HubRoute.APIToken,
                label: t('API Token'),
                path: 'api-token',
                element: <Token />,
              },
            ],
          },
        ],
      },
      {
        id: HubRoute.Login,
        path: 'login',
        element: <Login />,
      },
      {
        id: HubRoute.Hub,
        path: '',
        element: (
          <Navigate
            to={
              process.env.HUB_ROUTE_PREFIX
                ? process.env.HUB_ROUTE_PREFIX + '/dashboard'
                : 'dashboard'
            }
          />
        ),
      },
    ];
    return navigationItems;
  }, [t]);

  return pageNavigationItems;
}
