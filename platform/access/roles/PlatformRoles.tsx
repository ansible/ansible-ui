/* eslint-disable i18next/no-literal-string */
import { PageHeader, PageLayout } from '@ansible/ansible-ui-framework';
import { AwxRoute } from '@ansible/awx-ui/main/AwxRoutes';
import { EdaRoute } from '@ansible/eda-ui/main/EdaRoutes';
import { HubRoute } from '@ansible/hub-ui/main/HubRoutes';
import { useTranslation } from 'react-i18next';
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
