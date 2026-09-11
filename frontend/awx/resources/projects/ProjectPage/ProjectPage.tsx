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
import { useGet } from '@ansible/common-ui/crud/useGet';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useViewActivityStream } from '../../../access/common/useViewActivityStream';
import { AwxError } from '../../../common/AwxError';
import { awxAPI } from '../../../common/api/awx-utils';
import { Project } from '../../../interfaces/Project';
import { AwxRoute } from '../../../main/AwxRoutes';
import { useCanViewNotificationsTab } from '../../notifications/hooks/useCanViewNotificationsTab';
import { useProjectActions } from '../hooks/useProjectActions';

export function ProjectPage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const activityStream = useViewActivityStream('project');
  const {
    error: projectError,
    data: project,
    refresh: projectRefresh,
    isLoading: isProjectLoading,
  } = useGet<Project>(awxAPI`/projects/${params.id ?? ''}/`);
  const pageNavigate = usePageNavigate();
  const itemActions = useProjectActions(() => pageNavigate(AwxRoute.Projects));
  const {
    canViewNotificationsTab,
    error: notificationsTabError,
    refresh: refreshNotificationsTab,
    isLoading: isNotificationsTabLoading,
  } = useCanViewNotificationsTab();
  const getPageUrl = useGetPageUrl();
  const tabs: { label: string; page: string }[] = useMemo(() => {
    const tabs = [
      { label: t('Details'), page: AwxRoute.ProjectDetails },
      { label: t('Schedules'), page: AwxRoute.ProjectSchedules },
      { label: t('Job Templates'), page: AwxRoute.ProjectJobTemplates },
      { label: t('User Access'), page: AwxRoute.ProjectUsers },
      { label: t('Team Access'), page: AwxRoute.ProjectTeams },
    ];
    if (canViewNotificationsTab) {
      tabs.push({ label: t('Notifications'), page: AwxRoute.ProjectNotifications });
    }
    return tabs;
  }, [t, canViewNotificationsTab]);
  if (projectError) return <AwxError error={projectError} handleRefresh={projectRefresh} />;
  if (notificationsTabError)
    return <AwxError error={notificationsTabError} handleRefresh={refreshNotificationsTab} />;
  if (!project || isProjectLoading || isNotificationsTabLoading)
    return <LoadingPage breadcrumbs tabs />;

  return (
    <PageLayout>
      <PageHeader
        title={project?.name}
        breadcrumbs={[
          { label: t('Projects'), to: getPageUrl(AwxRoute.Projects) },
          { label: project?.name },
        ]}
        headerActions={
          <PageActions<Project>
            actions={[...activityStream, ...itemActions]}
            position={'right'}
            selectedItem={project}
          />
        }
      />

      <PageRoutedTabs
        backTab={{
          label: t('Back to Projects'),
          page: AwxRoute.Projects,
          persistentFilterKey: 'projects',
        }}
        tabs={tabs}
        params={{ id: project.id }}
      />
    </PageLayout>
  );
}
