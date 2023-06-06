/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { PageHeader, PageLayout } from '../../../../../framework';
import { RoutedTabs, RoutedTab, PageBackTab } from '../../../../common/RoutedTabs';
import { RouteObj } from '../../../../Routes';
import { PageNotImplemented } from '../../../../common/PageNotImplemented';
import { useGetItem } from '../../../../common/crud/useGetItem';
import { SystemJobTemplate } from '../../../interfaces/SystemJobTemplate';
import { AwxError } from '../../../common/AwxError';
import { LoadingPage } from '../../../../../framework/components/LoadingPage';

export function ManagementJobPage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string; }>();
  const { error, data: system_job_template, refresh } = useGetItem<SystemJobTemplate>('/api/v2/system_job_templates', params.id);

  if (error) return <AwxError error={error} handleRefresh={refresh} />;
  if (!system_job_template) return <LoadingPage breadcrumbs tabs />;

  return (
    <PageLayout>
      <PageHeader
        title={system_job_template?.name}
        breadcrumbs={[
          { label: t('Management Jobs'), to: RouteObj.ManagementJobs },
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