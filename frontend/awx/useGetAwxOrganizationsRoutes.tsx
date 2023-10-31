import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import { PageNavigationItem } from '../../framework';
import { PageNotImplemented } from '../../framework/PageEmptyStates/PageNotImplemented';
import { AwxRoute } from './AwxRoutes';
import { CreateOrganization, EditOrganization } from './access/organizations/OrganizationForm';
import { OrganizationAccess } from './access/organizations/OrganizationPage/OrganizationAccess';
import { OrganizationDetails } from './access/organizations/OrganizationPage/OrganizationDetails';
import { OrganizationPage } from './access/organizations/OrganizationPage/OrganizationPage';
import { OrganizationTeams } from './access/organizations/OrganizationPage/OrganizationTeams';
import { Organizations } from './access/organizations/Organizations';

export function useGetAwxOrganizationRoutes() {
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
              id: AwxRoute.OrganizationAccess,
              path: 'access',
              element: <OrganizationAccess />,
            },
            {
              id: AwxRoute.OrganizationTeams,
              path: 'teams',
              element: <OrganizationTeams />,
            },
            {
              id: AwxRoute.OrganizationExecutionEnvironments,
              path: 'execution-environments',
              element: <PageNotImplemented />,
            },
            {
              id: AwxRoute.OrganizationNotifications,
              path: 'notifications',
              element: <PageNotImplemented />,
            },
            {
              path: '',
              element: <Navigate to="details" />,
            },
          ],
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
