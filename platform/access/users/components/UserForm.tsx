import { useTranslation } from 'react-i18next';
import { PageHeader, PageLayout, useGetPageUrl } from '../../../../framework';
import { PlatformRoute } from '../../../PlatformRoutes';

export function CreateUser() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();

  return (
    <PageLayout>
      <PageHeader
        title={t('Create user')}
        breadcrumbs={[
          { label: t('Users'), to: getPageUrl(PlatformRoute.Users) },
          { label: t('Create user') },
        ]}
      />
      {/* TODO */}
    </PageLayout>
  );
}

export function EditUser() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();

  return (
    <PageLayout>
      <PageHeader
        title={t('Edit user')}
        breadcrumbs={[
          { label: t('Users'), to: getPageUrl(PlatformRoute.Users) },
          { label: t('Edit user') },
        ]}
      />
      {/* TODO */}
    </PageLayout>
  );
}
