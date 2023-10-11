/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
	DropdownPosition
} from '@patternfly/react-core/deprecated';
import { useTranslation } from 'react-i18next';
import {
  PageActions,
  PageHeader,
  PageLayout,
  useGetPageUrl,
  usePageNavigate,
} from '../../../../../framework';
import { LoadingPage } from '../../../../../framework/components/LoadingPage';
import { useGet, useGetItem } from '../../../../common/crud/useGet';
import { AwxRoute } from '../../../AwxRoutes';
import { AwxError } from '../../../common/AwxError';
import { JobTemplate } from '../../../interfaces/JobTemplate';
import { useTemplateActions } from '../hooks/useTemplateActions';
import { useActiveUser } from '../../../../common/useActiveUser';
import { AwxItemsResponse } from '../../../common/AwxItemsResponse';
import { Organization } from '../../../interfaces/Organization';
import { PageRoutedTabs } from '../../../../../framework/PageTabs/PageRoutedTabs';
import { useParams } from 'react-router-dom';
import { useMemo } from 'react';

export function TemplatePage() {
  const { t } = useTranslation();
  const currentUser = useActiveUser();
  const params = useParams<{ id: string }>();
  const {
    error: templateError,
    data: template,
    isLoading: isTemplateLoading,
    refresh,
  } = useGetItem<JobTemplate>('/api/v2/job_templates', params.id);
  const {
    data: isNotifAdmin,
    error: isNotifAdminError,
    refresh: refreshNotifAdmin,
    isLoading: isNotifAdminLoading,
  } = useGet<AwxItemsResponse<Organization>>(
    '/api/v2/organizations/?role_level=notification_admin_role'
  );
  const getPageUrl = useGetPageUrl();
  const pageNavigate = usePageNavigate();
  const itemActions = useTemplateActions({
    onTemplatesDeleted: () => pageNavigate(AwxRoute.Templates),
  });

  const error = isNotifAdminError || templateError;
  const tabs: { label: string; page: string }[] = useMemo(() => {
    const tabs = [
      { label: t('Details'), page: AwxRoute.JobTemplateDetails },
      { label: t('Access'), page: AwxRoute.JobTemplateAccess },
      { label: t('Schedules'), page: AwxRoute.JobTemplateSchedules },
      { label: t('Jobs'), page: AwxRoute.JobTemplateJobs },
      { label: t('Survey'), page: AwxRoute.JobTemplateSurvey },
    ];
    if (currentUser?.is_system_auditor || (isNotifAdmin && isNotifAdmin.results.length > 0)) {
      tabs.push({ label: t('Notifications'), page: AwxRoute.JobTemplateNotifications });
    }
    return tabs;
  }, [t, currentUser, isNotifAdmin]);
  if (error) return <AwxError error={error} handleRefresh={refresh || refreshNotifAdmin} />;
  if (isTemplateLoading || isNotifAdminLoading) return <LoadingPage breadcrumbs tabs />;

  return (
    <PageLayout>
      <PageHeader
        title={template?.name}
        breadcrumbs={[
          { label: t('Templates'), to: getPageUrl(AwxRoute.Templates) },
          { label: template?.name },
        ]}
        headerActions={
          <PageActions<JobTemplate>
            actions={itemActions}
            position={DropdownPosition.right}
            selectedItem={template}
          />
        }
      />
      <PageRoutedTabs
        backTab={{
          label: t('Back to Templates'),
          page: AwxRoute.Templates,
          persistentFilterKey: 'templates',
        }}
        tabs={tabs}
        params={{ id: template?.id }}
      />
    </PageLayout>
  );
}
