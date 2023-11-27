import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { PageHeader, PageLayout, useGetPageUrl } from '../../../../../framework';
import { LoadingPage } from '../../../../../framework/components/LoadingPage';
import { PageRoutedTabs } from '../../../../../framework/PageTabs/PageRoutedTabs';
import { useGetItem } from '../../../../common/crud/useGet';
import { AwxRoute } from '../../../AwxRoutes';
import { AwxError } from '../../../common/AwxError';
import { Application } from '../../../interfaces/Application';
import { awxAPI } from '../../../api/awx-utils';

export function ApplicationPage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const {
    error,
    data: application,
    refresh,
  } = useGetItem<Application>(awxAPI`/applications`, params.id);

  const getPageUrl = useGetPageUrl();

  if (error) return <AwxError error={error} handleRefresh={refresh} />;
  if (!application) return <LoadingPage breadcrumbs tabs />;

  return (
    <PageLayout>
      <PageHeader
        title={application?.name}
        breadcrumbs={[
          { label: t('Applications'), to: getPageUrl(AwxRoute.Applications) },
          { label: application?.name },
        ]}
        headerActions={[]}
      />
      <PageRoutedTabs
        backTab={{
          label: t('Back to Applications'),
          page: AwxRoute.Applications,
          persistentFilterKey: 'applications',
        }}
        tabs={[
          { label: t('Details'), page: AwxRoute.ApplicationDetails },
          { label: t('Tokens'), page: AwxRoute.ApplicationTokens },
        ]}
        params={{ id: application.id }}
      />
    </PageLayout>
  );
}
