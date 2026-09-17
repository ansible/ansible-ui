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
import { JobTemplate } from '../../../interfaces/JobTemplate';
import { AwxRoute } from '../../../main/AwxRoutes';
import { useCanViewNotificationsTab } from '../../notifications/hooks/useCanViewNotificationsTab';
import { useTemplateActions } from '../hooks/useTemplateActions';

export function TemplatePage() {
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
  } = useGetItem<JobTemplate>(awxAPI`/job_templates`, params.id);
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
    isJobTemplate: template?.type === 'job_template' ? true : false,
  });

  const tabs: { label: string; page: string }[] = useMemo(() => {
    const tabs = [
      { label: t('Details'), page: AwxRoute.JobTemplateDetails },
      { label: t('Team Access'), page: AwxRoute.JobTemplateTeamAccess },
      { label: t('User Access'), page: AwxRoute.JobTemplateUserAccess },
      { label: t('Schedules'), page: AwxRoute.JobTemplateSchedules },
      { label: t('Jobs'), page: AwxRoute.JobTemplateJobs },
      { label: t('Survey'), page: AwxRoute.JobTemplateSurvey },
    ];
    if (canViewNotificationsTab) {
      tabs.push({ label: t('Notifications'), page: AwxRoute.JobTemplateNotifications });
    }
    return tabs;
  }, [t, canViewNotificationsTab]);
  if (templateError) return <AwxError error={templateError} handleRefresh={refresh} />;
  if (notificationsTabError)
    return <AwxError error={notificationsTabError} handleRefresh={refreshNotificationsTab} />;
  if (isTemplateLoading || isNotificationsTabLoading) return <LoadingPage breadcrumbs tabs />;

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
        params={{ id: template?.id }}
        componentParams={{ template }}
      />
    </PageLayout>
  );
}
