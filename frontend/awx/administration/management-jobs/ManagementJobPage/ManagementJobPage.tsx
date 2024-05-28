/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { PageHeader, PageLayout, useGetPageUrl } from '../../../../../framework';
import { LoadingPage } from '../../../../../framework/components/LoadingPage';
import { PageRoutedTabs } from '../../../../common/PageRoutedTabs';
import { useGet, useGetItem } from '../../../../common/crud/useGet';
import { AwxError } from '../../../common/AwxError';
import { AwxItemsResponse } from '../../../common/AwxItemsResponse';
import { awxAPI } from '../../../common/api/awx-utils';
import { useAwxActiveUser } from '../../../common/useAwxActiveUser';
import { Organization } from '../../../interfaces/Organization';
import { SystemJobTemplate } from '../../../interfaces/SystemJobTemplate';
import { AwxRoute } from '../../../main/AwxRoutes';

export function ManagementJobPage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const {
    error,
    data: systemJobTemplate,
    refresh,
  } = useGetItem<SystemJobTemplate>(awxAPI`/system_job_templates`, params.id);

  const getPageUrl = useGetPageUrl();
  const { activeAwxUser } = useAwxActiveUser();

  const {
    data: isNotifAdmin,
    error: isNotifAdminError,
    refresh: refreshNotifAdmin,
  } = useGet<AwxItemsResponse<Organization>>(
    awxAPI`/organizations/?role_level=notification_admin_role`
  );

  if (error) return <AwxError error={error} handleRefresh={refresh} />;
  if (isNotifAdminError)
    return <AwxError error={isNotifAdminError} handleRefresh={refreshNotifAdmin} />;

  if (!(systemJobTemplate && isNotifAdmin)) return <LoadingPage breadcrumbs tabs />;

  const tabs = [{ label: t('Schedules'), page: AwxRoute.ManagementJobSchedules }];

  if (activeAwxUser?.is_system_auditor || (isNotifAdmin && isNotifAdmin.results.length > 0)) {
    tabs.push({ label: t('Notifications'), page: AwxRoute.ManagementJobNotifications });
  }

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
          page: AwxRoute.ManagementJobs,
          persistentFilterKey: 'management-jobs',
        }}
        tabs={tabs}
        params={{ id: systemJobTemplate.id }}
      />
    </PageLayout>
  );
}
