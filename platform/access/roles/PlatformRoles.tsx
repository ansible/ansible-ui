/* eslint-disable i18next/no-literal-string */
import { useTranslation } from 'react-i18next';
import { PageHeader, PageLayout } from '../../../framework';
import { AwxRoute } from '../../../frontend/awx/main/AwxRoutes';
import { EdaRoute } from '../../../frontend/eda/main/EdaRoutes';
import { HubRoute } from '../../../frontend/hub/main/HubRoutes';
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
        titleHelpTitle={t('Roles')}
        titleHelp={t(
          'A role represents set of actions that a team or user may perform on a resource or set of resources.'
        )}
      />
      <PlatformServiceNavigation awx={AwxRoute.Roles} eda={EdaRoute.Roles} hub={HubRoute.Roles} />
    </PageLayout>
  );
}
