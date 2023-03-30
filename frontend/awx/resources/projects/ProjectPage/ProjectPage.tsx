/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { DropdownPosition } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { PageActions, PageHeader, PageLayout, PageTab, PageTabs } from '../../../../../framework';
import { LoadingPage } from '../../../../../framework/components/LoadingPage';
import { useGetItem } from '../../../../common/crud/useGetItem';
import { RouteObj } from '../../../../Routes';
import { AwxError } from '../../../common/AwxError';
import { Project } from '../../../interfaces/Project';
import { useProjectActions } from '../hooks/useProjectActions';
import { ProjectDetails } from './ProjectDetails';

export function ProjectPage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const { error, data: project, refresh } = useGetItem<Project>('/api/v2/projects', params.id);
  const navigate = useNavigate();
  const itemActions = useProjectActions({ onProjectsDeleted: () => navigate(RouteObj.Projects) });

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
      <PageTabs loading={!project}>
        <PageTab label={t('Details')}>
          <ProjectDetails project={project} />
        </PageTab>
        <PageTab label={t('Access')}>TODO</PageTab>
        <PageTab label={t('Job Templates')}>TODO</PageTab>
        <PageTab label={t('Notifications')}>TODO</PageTab>
        <PageTab label={t('Schedules')}>TODO</PageTab>
      </PageTabs>
    </PageLayout>
  );
}
