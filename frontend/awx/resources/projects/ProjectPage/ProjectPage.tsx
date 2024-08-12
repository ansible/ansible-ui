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
import { useGet } from '../../../../common/crud/useGet';
import { useViewActivityStream } from '../../../access/common/useViewActivityStream';
import { AwxError } from '../../../common/AwxError';
import { AwxItemsResponse } from '../../../common/AwxItemsResponse';
import { awxAPI } from '../../../common/api/awx-utils';
import { useAwxActiveUser } from '../../../common/useAwxActiveUser';
import { Organization } from '../../../interfaces/Organization';
import { Project } from '../../../interfaces/Project';
import { AwxRoute } from '../../../main/AwxRoutes';
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
  const { activeAwxUser } = useAwxActiveUser();
  const {
    data: isNotifAdmin,
    error: isNotifAdminError,
    refresh: refreshNotifAdmin,
    isLoading: isNotifAdminLoading,
  } = useGet<AwxItemsResponse<Organization>>(awxAPI`/organizations/`, {
    role_level: 'notification_admin_role',
  });
  const error = isNotifAdminError || projectError;
  const getPageUrl = useGetPageUrl();
  const tabs: { label: string; page: string }[] = useMemo(() => {
    const tabs = [
      { label: t('Details'), page: AwxRoute.ProjectDetails },
      { label: t('Schedules'), page: AwxRoute.ProjectSchedules },
      { label: t('Job Templates'), page: AwxRoute.ProjectJobTemplates },
      { label: t('User Access'), page: AwxRoute.ProjectUsers },
      { label: t('Team Access'), page: AwxRoute.ProjectTeams },
    ];
    if (activeAwxUser?.is_system_auditor || (isNotifAdmin && isNotifAdmin.results.length > 0)) {
      tabs.push({ label: t('Notifications'), page: AwxRoute.ProjectNotifications });
    }
    return tabs;
  }, [t, activeAwxUser, isNotifAdmin]);
  if (error) return <AwxError error={error} handleRefresh={projectRefresh || refreshNotifAdmin} />;
  if (!project || isProjectLoading || isNotifAdminLoading) return <LoadingPage breadcrumbs tabs />;

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
            position={DropdownPosition.right}
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
