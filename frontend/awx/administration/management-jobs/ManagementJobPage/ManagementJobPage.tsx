/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { PageHeader, PageLayout, useGetPageUrl } from '../../../../../framework';
import { LoadingPage } from '../../../../../framework/components/LoadingPage';
import { PageRoutedTabs } from '../../../../../framework/PageTabs/PageRoutedTabs';
import { useGetItem } from '../../../../common/crud/useGet';
import { AwxRoute } from '../../../AwxRoutes';
import { AwxError } from '../../../common/AwxError';
import { SystemJobTemplate } from '../../../interfaces/SystemJobTemplate';

export function ManagementJobPage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const {
    error,
    data: systemJobTemplate,
    refresh,
  } = useGetItem<SystemJobTemplate>('/api/v2/system_job_templates', params.id);

  const getPageUrl = useGetPageUrl();

  if (error) return <AwxError error={error} handleRefresh={refresh} />;
  if (!systemJobTemplate) return <LoadingPage breadcrumbs tabs />;

  return (
    <PageLayout>
      <PageHeader
        title={systemJobTemplate?.name}
        breadcrumbs={[
          { label: t('Management Jobs'), to: getPageUrl(AwxRoute.ManagementJobs) },
          { label: systemJobTemplate?.name },
        ]}
        headerActions={[]}
      />
      <PageRoutedTabs
        backTab={{
          label: t('Back to Management Jobs'),
          page: AwxRoute.ManagementJobPage,
          persistentFilterKey: 'management-jobs',
        }}
        tabs={[
          { label: t('Schedules'), page: AwxRoute.ManagementJobSchedules },
          { label: t('Notifications'), page: AwxRoute.ManagementJobNotifications },
        ]}
        params={{ id: systemJobTemplate.id }}
      />
    </PageLayout>
  );
}
