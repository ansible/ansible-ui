/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { DropdownPosition } from '@patternfly/react-core/deprecated';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { PageActions, PageHeader, PageLayout, useGetPageUrl } from '../../../../../framework';
import { PageRoutedTabs } from '../../../../../framework/PageTabs/PageRoutedTabs';
import { LoadingPage } from '../../../../../framework/components/LoadingPage';
import { RouteObj } from '../../../../common/Routes';
import { useGet } from '../../../../common/crud/useGet';
import { useActiveUser } from '../../../../common/useActiveUser';
import { AwxRoute } from '../../../AwxRoutes';
import { AwxError } from '../../../common/AwxError';
import { AwxItemsResponse } from '../../../common/AwxItemsResponse';
import { Organization } from '../../../interfaces/Organization';
import { Project } from '../../../interfaces/Project';
import { useProjectActions } from '../hooks/useProjectActions';
import { awxAPI } from '../../../api/awx-utils';

export function ProjectPage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const {
    error: projectError,
    data: project,
    refresh: projectRefresh,
    isLoading: isProjectLoading,
  } = useGet<Project>(awxAPI`/projects/${params.id ?? ''}/`);
  const navigate = useNavigate();
  const itemActions = useProjectActions(() => navigate(RouteObj.Projects));
  const currentUser = useActiveUser();
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
      { label: t('Access'), page: AwxRoute.ProjectAccess },
      { label: t('Schedules'), page: AwxRoute.ProjectSchedules },
      { label: t('Jobs'), page: AwxRoute.ProjectNotifications },
      { label: t('Job templates'), page: AwxRoute.ProjectJobTemplates },
      { label: t('Survey'), page: AwxRoute.ProjectSurvey },
    ];
    if (currentUser?.is_system_auditor || (isNotifAdmin && isNotifAdmin.results.length > 0)) {
      tabs.push({ label: t('Notifications'), page: AwxRoute.WorkflowJobTemplateNotifications });
    }
    return tabs;
  }, [t, currentUser, isNotifAdmin]);
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
            actions={itemActions}
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
