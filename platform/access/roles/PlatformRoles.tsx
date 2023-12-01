/* eslint-disable i18next/no-literal-string */
import { Divider } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router-dom';
import { PageHeader, PageLayout } from '../../../framework';
import { EdaRoute } from '../../../frontend/eda/EdaRoutes';
import { HubRoute } from '../../../frontend/hub/HubRoutes';
import { PlatformRoute } from '../../PlatformRoutes';
import { PlatformServiceNavigation } from '../../common/PlatformServiceNavigation';

export function PlatformRoles() {
  const { t } = useTranslation();
  return (
    <PageLayout>
      <PageHeader
        title={t('Roles')}
        description={t(
          'A role represents set of actions that a team or user may perform on a resource or set of resources.'
        )}
      />
      <PlatformServiceNavigation
        awx={PlatformRoute.ExecutionRoles}
        eda={EdaRoute.Roles}
        hub={HubRoute.Roles}
      />
      <Divider />
      <Outlet />
    </PageLayout>
  );
}
