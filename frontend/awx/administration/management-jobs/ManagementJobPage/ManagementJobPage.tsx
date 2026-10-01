/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { PageHeader, PageLayout, useGetPageUrl } from '@ansible/ansible-ui-framework';
import { LoadingPage } from '@ansible/ansible-ui-framework/components/LoadingPage';
import { PageRoutedTabs } from '@ansible/common-ui/PageRoutedTabs';
import { useGetItem } from '@ansible/common-ui/crud/useGet';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { AwxError } from '../../../common/AwxError';
import { awxAPI } from '../../../common/api/awx-utils';
import {
  canViewNotificationsTab,
  useNotificationAdminOrganizations,
} from '../../../common/useNotificationAdminOrganizations';
import { useAwxActiveUser } from '../../../common/useAwxActiveUser';
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

  const { notificationAdminOrganizations, isLoadingNotificationAdminOrganizations } =
    useNotificationAdminOrganizations();

  if (error) return <AwxError error={error} handleRefresh={refresh} />;

  if (!systemJobTemplate || isLoadingNotificationAdminOrganizations)
    return <LoadingPage breadcrumbs tabs />;

  const tabs = [{ label: t('Schedules'), page: AwxRoute.ManagementJobSchedules }];

  if (canViewNotificationsTab(activeAwxUser, notificationAdminOrganizations)) {
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
