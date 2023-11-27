import { useMemo } from 'react';
import { PageNavigationItem } from '../../framework';
import { PlatformRoute } from '../PlatformRoutes';
import { useTranslation } from 'react-i18next';
import {
  CreateOrganization,
  EditOrganization,
} from '../access/organizations/components/OrganizationForm';
import { OrganizationPage } from '../access/organizations/components/OrganizationPage';
import { OrganizationDetails } from '../access/organizations/components/OrganizationDetails';
import { OrganizationList } from '../access/organizations/components/OrganizationList';

export function useGetPlatformOrganizationsRoutes() {
  const { t } = useTranslation();
  const organizationsRoutes = useMemo<PageNavigationItem>(
    () => ({
      id: PlatformRoute.Organizations,
      label: t('Organizations'),
      path: 'organizations',
      children: [
        {
          id: PlatformRoute.CreateOrganization,
          path: 'create',
          element: <CreateOrganization />,
        },
        {
          id: PlatformRoute.EditOrganization,
          path: ':id/edit',
          element: <EditOrganization />,
        },
        {
          id: PlatformRoute.OrganizationPage,
          path: ':id',
          element: <OrganizationPage />,
          children: [
            {
              id: PlatformRoute.OrganizationDetails,
              path: 'details',
              element: <OrganizationDetails />,
            },
          ],
        },
        {
          path: '',
          element: <OrganizationList />,
        },
      ],
    }),
    [t]
  );
  return organizationsRoutes;
}
