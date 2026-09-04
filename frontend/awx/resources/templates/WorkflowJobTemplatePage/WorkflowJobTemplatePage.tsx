/* eslint-disable @typescript-eslint/no-non-null-assertion */

import {
  PageActions,
  PageHeader,
  PageLayout,
  useGetPageUrl,
  usePageNavigate,
} from '@ansible/ansible-ui-framework';
import { LoadingPage } from '@ansible/ansible-ui-framework/components/LoadingPage';
import { PageRoutedTabs } from '@ansible/common-ui/PageRoutedTabs';
import { useGetItem } from '@ansible/common-ui/crud/useGet';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useViewActivityStream } from '../../../access/common/useViewActivityStream';
import { AwxError } from '../../../common/AwxError';
import { awxAPI } from '../../../common/api/awx-utils';
import { WorkflowJobTemplate } from '../../../interfaces/WorkflowJobTemplate';
import { AwxRoute } from '../../../main/AwxRoutes';
import { useCanViewNotificationsTab } from '../../notifications/hooks/useCanViewNotificationsTab';
import { useTemplateActions } from '../hooks/useTemplateActions';

export function WorkflowJobTemplatePage() {
  const { t } = useTranslation();
  const activityStream = useViewActivityStream(
    'job_template+workflow_job_template+workflow_job_template_node'
  );
  const params = useParams<{ id: string }>();
  const {
    error: templateError,
    data: template,
    isLoading: isTemplateLoading,
    refresh,
  } = useGetItem<WorkflowJobTemplate>(awxAPI`/workflow_job_templates`, params.id);

  const {
    canViewNotificationsTab,
    error: notificationsTabError,
    refresh: refreshNotificationsTab,
    isLoading: isNotificationsTabLoading,
  } = useCanViewNotificationsTab();
  const getPageUrl = useGetPageUrl();
  const pageNavigate = usePageNavigate();
  const itemActions = useTemplateActions({
    onTemplatesDeleted: () => pageNavigate(AwxRoute.Templates),
  });

  const tabs: ({ label: string; page: string } | false)[] = useMemo(
    () => [
      { label: t('Details'), page: AwxRoute.WorkflowJobTemplateDetails },
      { label: t('Team Access'), page: AwxRoute.WorkflowJobTemplateTeamAccess },
      { label: t('User Access'), page: AwxRoute.WorkflowJobTemplateUserAccess },
      { label: t('Schedules'), page: AwxRoute.WorkflowJobTemplateSchedules },
      { label: t('Jobs'), page: AwxRoute.WorkflowJobTemplateJobs },
      { label: t('Survey'), page: AwxRoute.WorkflowJobTemplateSurvey },
      canViewNotificationsTab
        ? { label: t('Notifications'), page: AwxRoute.WorkflowJobTemplateNotifications }
        : false,
    ],

    [t, canViewNotificationsTab]
  );

  if (templateError) return <AwxError error={templateError} handleRefresh={refresh} />;
  if (notificationsTabError)
    return <AwxError error={notificationsTabError} handleRefresh={refreshNotificationsTab} />;
  if (!template || isTemplateLoading || isNotificationsTabLoading)
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
            position={'right'}
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
