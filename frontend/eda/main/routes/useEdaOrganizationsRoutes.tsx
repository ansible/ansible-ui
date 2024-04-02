import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import { PageNavigationItem } from '../../../../framework';
import {
  CreateOrganization,
  EditOrganization,
} from '../../access/organizations/OrganizationPage/OrganizationForm';
import { OrganizationDetails } from '../../access/organizations/OrganizationPage/OrganizationDetails';
import { OrganizationPage } from '../../access/organizations/OrganizationPage/OrganizationPage';
import { Organizations } from '../../access/organizations/Organizations';
import { EdaRoute } from '../EdaRoutes';

export function useEdaOrganizationRoutes() {
  const { t } = useTranslation();
  const edaOrganizationRoutes = useMemo<PageNavigationItem>(
    () => ({
      id: EdaRoute.Organizations,
      label: t('Organizations'),
      path: 'organizations',
      children: [
        {
          id: EdaRoute.CreateOrganization,
          path: 'create',
          element: <CreateOrganization />,
        },
        {
          id: EdaRoute.EditOrganization,
          path: ':id/edit',
          element: <EditOrganization />,
        },
        {
          id: EdaRoute.OrganizationPage,
          path: ':id',
          element: <OrganizationPage />,
          children: [
            {
              id: EdaRoute.OrganizationDetails,
              path: 'details',
              element: <OrganizationDetails />,
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
  return edaOrganizationRoutes;
}
