/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { DropdownPosition } from '@patternfly/react-core/deprecated';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
  PageActions,
  PageHeader,
  PageLayout,
  useGetPageUrl,
  usePageNavigate,
} from '../../../../../framework';
import { PageRoutedTabs } from '../../../../../framework/PageTabs/PageRoutedTabs';
import { LoadingPage } from '../../../../../framework/components/LoadingPage';
import { useGet, useGetItem } from '../../../../common/crud/useGet';
import { AwxRoute } from '../../../AwxRoutes';
import { awxAPI } from '../../../api/awx-utils';
import { AwxError } from '../../../common/AwxError';
import { AwxItemsResponse } from '../../../common/AwxItemsResponse';
import { useAwxActiveUser } from '../../../common/useAwxActiveUser';
import { JobTemplate } from '../../../interfaces/JobTemplate';
import { Organization } from '../../../interfaces/Organization';
import { useTemplateActions } from '../hooks/useTemplateActions';

export function TemplatePage() {
  const { t } = useTranslation();
  const currentUser = useAwxActiveUser();
  const params = useParams<{ id: string }>();
  const {
    error: templateError,
    data: template,
    isLoading: isTemplateLoading,
    refresh,
  } = useGetItem<JobTemplate>(awxAPI`/job_templates`, params.id);
  const {
    data: isNotifAdmin,
    error: isNotifAdminError,
    refresh: refreshNotifAdmin,
    isLoading: isNotifAdminLoading,
  } = useGet<AwxItemsResponse<Organization>>(
    awxAPI`/organizations/?role_level=notification_admin_role`
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
