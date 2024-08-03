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
import { LoadingPage } from '../../../../../framework/components/LoadingPage';
import { PageRoutedTabs } from '../../../../common/PageRoutedTabs';
import { useGet, useGetItem } from '../../../../common/crud/useGet';
import { useViewActivityStream } from '../../../access/common/useViewActivityStream';
import { AwxError } from '../../../common/AwxError';
import { AwxItemsResponse } from '../../../common/AwxItemsResponse';
import { awxAPI } from '../../../common/api/awx-utils';
import { useAwxActiveUser } from '../../../common/useAwxActiveUser';
import { Organization } from '../../../interfaces/Organization';
import { WorkflowJobTemplate } from '../../../interfaces/WorkflowJobTemplate';
import { AwxRoute } from '../../../main/AwxRoutes';
import { useTemplateActions } from '../hooks/useTemplateActions';

export function WorkflowJobTemplatePage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  let activityStreamType: string = 'job_template+workflow_job_template+workflow_job_template_node';
  if (/^\d+$/.test(params.id)) {
    activityStreamType = 'workflow_job_template';
  }
  const activityStream = useViewActivityStream(activityStreamType);
  const { activeAwxUser } = useAwxActiveUser();
  const {
    error: templateError,
    data: template,
    isLoading: isTemplateLoading,
    refresh,
  } = useGetItem<WorkflowJobTemplate>(awxAPI`/workflow_job_templates`, params.id);

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

  const tabs: ({ label: string; page: string } | false)[] = useMemo(
    () => [
      { label: t('Details'), page: AwxRoute.WorkflowJobTemplateDetails },
      { label: t('Team Access'), page: AwxRoute.WorkflowJobTemplateTeamAccess },
      { label: t('User Access'), page: AwxRoute.WorkflowJobTemplateUserAccess },
      { label: t('Schedules'), page: AwxRoute.WorkflowJobTemplateSchedules },
      { label: t('Jobs'), page: AwxRoute.WorkflowJobTemplateJobs },
      { label: t('Survey'), page: AwxRoute.WorkflowJobTemplateSurvey },
      activeAwxUser?.is_system_auditor || (isNotifAdmin && isNotifAdmin.results.length > 0)
        ? { label: t('Notifications'), page: AwxRoute.WorkflowJobTemplateNotifications }
        : false,
    ],

    [t, activeAwxUser, isNotifAdmin]
  );

  if (error) return <AwxError error={error} handleRefresh={refresh || refreshNotifAdmin} />;
  if (!template || isTemplateLoading || isNotifAdminLoading)
    return <LoadingPage breadcrumbs tabs />;

  return (
    <PageLayout>
      <PageHeader
        title={template?.name}
        breadcrumbs={[
          { label: t('Templates'), to: getPageUrl(AwxRoute.Templates) },
          { label: template?.name },
        ]}
        headerActions={
          <PageActions<WorkflowJobTemplate>
            actions={[...activityStream, ...itemActions]}
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
        params={{ id: template.id }}
        componentParams={{ template }}
      />
    </PageLayout>
  );
}
