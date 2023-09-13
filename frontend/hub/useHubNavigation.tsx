import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import { PageNavigationItem } from '../../framework/PageNavigation/PageNavigationItem';
import { Login } from '../common/Login';
import { Approvals } from './approvals/Approvals';
import { CollectionDetails } from './collections/CollectionDetails';
import { Collections } from './collections/Collections';
import { UploadCollection } from './collections/UploadCollection';
import { HubDashboard } from './dashboard/Dashboard';
import { ExecutionEnvironments } from './execution-environments/ExecutionEnvironments';
import { NamespaceDetails } from './namespaces/HubNamespaceDetails';
import { CreateHubNamespace, EditHubNamespace } from './namespaces/HubNamespaceForm';
import { Namespaces } from './namespaces/HubNamespaces';
import { RemoteRegistries } from './remote-registries/RemoteRegistries';
import { RemoteDetails } from './remotes/RemoteDetails';
import { CreateRemote, EditRemote } from './remotes/RemoteForm';
import { Remotes } from './remotes/Remotes';
import { Repositories } from './repositories/Repositories';
import { SignatureKeys } from './signature-keys/SignatureKeys';
import { TaskDetails } from './tasks/TaskDetails';
import { Tasks } from './tasks/Tasks';
import { Token } from './token/Token';

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

export function useHubNavigation() {
  const { t } = useTranslation();
  const pageNavigationItems = useMemo<PageNavigationItem[]>(() => {
    const navigationItems: PageNavigationItem[] = [
      {
        label: '',
        path: process.env.HUB_ROUTE_PREFIX,
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
                    path: ':id/edit',
                    element: <EditHubNamespace />,
                  },
                  {
                    id: HubRoute.NamespaceDetails,
                    path: ':id/*',
                    element: <NamespaceDetails />,
                  },
                  {
                    id: HubRoute.Namespaces,
                    path: '',
                    element: <Namespaces />,
                  },
                ],
              },
              {
                label: t('Collections'),
                path: 'collections',
                children: [
                  {
                    id: HubRoute.UploadCollection,
                    path: 'upload',
                    element: <UploadCollection />,
                  },
                  {
                    id: HubRoute.CollectionDetails,
                    path: ':id/*',
                    element: <CollectionDetails />,
                  },
                  {
                    id: HubRoute.Collections,
                    path: '',
                    element: <Collections />,
                  },
                ],
              },
              {
                label: t('Execution Environments'),
                path: 'execution Environments',
                children: [
                  {
                    id: HubRoute.ExecutionEnvironments,
                    path: '',
                    element: <ExecutionEnvironments />,
                  },
                ],
              },
              {
                label: t('Signature Keys'),
                path: 'signature keys',
                children: [
                  {
                    id: HubRoute.SignatureKeys,
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
                label: t('Repositories'),
                path: 'repositories',
                children: [
                  {
                    id: HubRoute.Repositories,
                    path: '',
                    element: <Repositories />,
                  },
                ],
              },
              {
                label: t('Remote Registries'),
                path: 'remote registries',
                children: [
                  {
                    id: HubRoute.RemoteRegistries,
                    path: '',
                    element: <RemoteRegistries />,
                  },
                ],
              },
              {
                label: t('Tasks'),
                path: 'tasks',
                children: [
                  {
                    id: HubRoute.TaskDetails,
                    path: ':id/*',
                    element: <TaskDetails />,
                  },
                  {
                    id: HubRoute.Tasks,
                    path: '',
                    element: <Tasks />,
                  },
                ],
              },
              {
                label: t('Approvals'),
                path: 'approvals',
                children: [
                  {
                    id: HubRoute.Approvals,
                    path: '',
                    element: <Approvals />,
                  },
                ],
              },
              {
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
                    id: HubRoute.RemoteDetails,
                    path: ':id/*',
                    element: <RemoteDetails />,
                  },
                  {
                    id: HubRoute.Remotes,
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
        path: '/',
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
