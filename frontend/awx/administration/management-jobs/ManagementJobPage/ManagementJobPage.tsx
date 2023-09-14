/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { PageHeader, PageLayout, useGetPageUrl } from '../../../../../framework';
import { LoadingPage } from '../../../../../framework/components/LoadingPage';
import { PageNotImplemented } from '../../../../common/PageNotImplemented';
import { PageBackTab, RoutedTab, RoutedTabs } from '../../../../common/RoutedTabs';
import { RouteObj } from '../../../../common/Routes';
import { useGetItem } from '../../../../common/crud/useGet';
import { AwxRoute } from '../../../AwxRoutes';
import { AwxError } from '../../../common/AwxError';
import { SystemJobTemplate } from '../../../interfaces/SystemJobTemplate';

export function ManagementJobPage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const {
    error,
    data: system_job_template,
    refresh,
  } = useGetItem<SystemJobTemplate>('/api/v2/system_job_templates', params.id);

  const getPageUrl = useGetPageUrl();

  if (error) return <AwxError error={error} handleRefresh={refresh} />;
  if (!system_job_template) return <LoadingPage breadcrumbs tabs />;

  return (
    <PageLayout>
      <PageHeader
        title={system_job_template?.name}
        breadcrumbs={[
          { label: t('Management Jobs'), to: getPageUrl(AwxRoute.ManagementJobs) },
          { label: system_job_template?.name },
        ]}
        headerActions={[]}
      />
      <RoutedTabs isLoading={!system_job_template} baseUrl={RouteObj.ManagementJobPage}>
        <PageBackTab
          label={t('Back to Management Jobs')}
          url={RouteObj.ManagementJobs}
          persistentFilterKey="management_jobs"
        />
        <RoutedTab label={t('Schedules')} url={RouteObj.ManagementJobSchedules}>
          <PageNotImplemented />
        </RoutedTab>
        <RoutedTab label={t('Notifications')} url={RouteObj.ManagementJobNotifications}>
          <PageNotImplemented />
        </RoutedTab>
      </RoutedTabs>
    </PageLayout>
  );
}
