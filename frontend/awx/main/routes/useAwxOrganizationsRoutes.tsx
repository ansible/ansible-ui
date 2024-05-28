import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import { PageNavigationItem } from '../../../../framework';
import { CreateOrganization, EditOrganization } from '../../access/organizations/OrganizationForm';
import { OrganizationUserAccess } from '../../access/organizations/OrganizationPage/OrganizationUserAccess';
import { OrganizationDetails } from '../../access/organizations/OrganizationPage/OrganizationDetails';
import { OrganizationPage } from '../../access/organizations/OrganizationPage/OrganizationPage';
import { OrganizationTeamsAccess } from '../../access/organizations/OrganizationPage/OrganizationTeamsAccess';
import { Organizations } from '../../access/organizations/Organizations';
import { AwxRoute } from '../AwxRoutes';
import { ResourceNotifications } from '../../resources/notifications/ResourceNotifications';
import { OrganizationExecutionEnvironments } from '../../access/organizations/OrganizationPage/OrganizationExecutionEnvironments';
import { OrganizationAddUsers } from '../../access/organizations/components/OrganizationAddUsers';
import { OrganizationAddTeams } from '../../access/organizations/components/OrganizationAddTeams';

export function useAwxOrganizationRoutes() {
  const { t } = useTranslation();
  const workflowApprovalRoutes = useMemo<PageNavigationItem>(
    () => ({
      id: AwxRoute.Organizations,
      label: t('Organizations'),
      path: 'organizations',
      children: [
        {
          id: AwxRoute.CreateOrganization,
          path: 'create',
          element: <CreateOrganization />,
        },
        {
          id: AwxRoute.EditOrganization,
          path: ':id/edit',
          element: <EditOrganization />,
        },
        {
          id: AwxRoute.OrganizationPage,
          path: ':id',
          element: <OrganizationPage />,
          children: [
            {
              id: AwxRoute.OrganizationDetails,
              path: 'details',
              element: <OrganizationDetails />,
            },
            {
              id: AwxRoute.OrganizationUsersAccess,
              path: 'user-access',
              element: <OrganizationUserAccess />,
            },
            {
              id: AwxRoute.OrganizationTeamsAccess,
              path: 'team-access',
              element: <OrganizationTeamsAccess />,
            },
            {
              id: AwxRoute.OrganizationExecutionEnvironments,
              path: 'execution-environments',
              element: <OrganizationExecutionEnvironments />,
            },
            {
              id: AwxRoute.OrganizationNotifications,
              path: 'notifications',
              element: <ResourceNotifications resourceType="organizations" />,
            },
            {
              path: '',
              element: <Navigate to="details" />,
            },
          ],
        },
        {
          id: AwxRoute.OrganizationAddUsers,
          path: ':id/user-access/add',
          element: <OrganizationAddUsers />,
        },
        {
          id: AwxRoute.OrganizationAddTeams,
          path: ':id/team-access/add',
          element: <OrganizationAddTeams />,
        },
        {
          path: '',
          element: <Organizations />,
        },
      ],
    }),
    [t]
  );
  return workflowApprovalRoutes;
}
