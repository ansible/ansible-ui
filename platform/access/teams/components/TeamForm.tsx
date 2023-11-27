import { useTranslation } from 'react-i18next';
import { PageHeader, PageLayout, useGetPageUrl } from '../../../../framework';
import { PlatformRoute } from '../../../PlatformRoutes';

export function CreateTeam() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();

  return (
    <PageLayout>
      <PageHeader
        title={t('Create team')}
        breadcrumbs={[
          { label: t('Teams'), to: getPageUrl(PlatformRoute.Teams) },
          { label: t('Create team') },
        ]}
      />
      {/* TODO */}
    </PageLayout>
  );
}

export function EditTeam() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();

  return (
    <PageLayout>
      <PageHeader
        title={t('Edit team')}
        breadcrumbs={[
          { label: t('Teams'), to: getPageUrl(PlatformRoute.Teams) },
          { label: t('Edit team') },
        ]}
      />
      {/* TODO */}
    </PageLayout>
  );
}
