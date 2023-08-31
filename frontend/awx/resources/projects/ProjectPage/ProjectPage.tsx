/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { DropdownPosition } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { PageActions, PageHeader, PageLayout } from '../../../../../framework';
import { LoadingPage } from '../../../../../framework/components/LoadingPage';
import { PageNotImplemented } from '../../../../common/PageNotImplemented';
import { PageBackTab, RoutedTab, RoutedTabs } from '../../../../common/RoutedTabs';
import { RouteObj } from '../../../../common/Routes';
import { useGet } from '../../../../common/crud/useGet';
import { AwxError } from '../../../common/AwxError';
import { Project } from '../../../interfaces/Project';
import { Schedules } from '../../../views/schedules/Schedules';
import { useProjectActions } from '../hooks/useProjectActions';
import { ProjectDetails } from './ProjectDetails';

export function ProjectPage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const { error, data: project, refresh } = useGet<Project>(`/api/v2/projects/${params.id ?? ''}/`);
  const navigate = useNavigate();
  const itemActions = useProjectActions(() => navigate(RouteObj.Projects));

  if (error) return <AwxError error={error} handleRefresh={refresh} />;
  if (!project) return <LoadingPage breadcrumbs tabs />;

  return (
    <PageLayout>
      <PageHeader
        title={project?.name}
        breadcrumbs={[{ label: t('Projects'), to: RouteObj.Projects }, { label: project?.name }]}
        headerActions={
          <PageActions<Project>
            actions={itemActions}
            position={DropdownPosition.right}
            selectedItem={project}
          />
        }
      />
      <RoutedTabs isLoading={!project} baseUrl={RouteObj.ProjectPage}>
        <PageBackTab
          label={t('Back to Projects')}
          url={RouteObj.Projects}
          persistentFilterKey="projects"
        />
        <RoutedTab label={t('Details')} url={RouteObj.ProjectDetails}>
          <ProjectDetails project={project} />
        </RoutedTab>
        <RoutedTab label={t('Access')} url={RouteObj.ProjectAccess}>
          <PageNotImplemented />
        </RoutedTab>
        <RoutedTab label={t('Job templates')} url={RouteObj.ProjectTemplates}>
          <PageNotImplemented />
        </RoutedTab>
        <RoutedTab label={t('Notifications')} url={RouteObj.ProjectNotifications}>
          <PageNotImplemented />
        </RoutedTab>
        <RoutedTab label={t('Schedules')} url={RouteObj.ProjectSchedules}>
          <Schedules sublistEndpoint={`/api/v2/projects/${project.id}/schedules/`} />
        </RoutedTab>
      </RoutedTabs>
    </PageLayout>
  );
}
