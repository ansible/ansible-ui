/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { DropdownPosition } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { PageActions, PageHeader, PageLayout, PageTab, PageTabs } from '../../../../../framework';
import { useItem } from '../../../../common/crud/useGet';
import { RouteObj } from '../../../../Routes';
import { Project } from '../../../interfaces/Project';
import { useProjectActions } from '../hooks/useProjectActions';
import { ProjectDetails } from './ProjectDetails';

export function ProjectPage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const project = useItem<Project>('/api/v2/projects', params.id ?? '0');
  const navigate = useNavigate();
  const itemActions = useProjectActions({ onProjectsDeleted: () => navigate(RouteObj.Projects) });
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
          <ProjectDetails project={project!} />
        </PageTab>
        <PageTab label={t('Access')}>TODO</PageTab>
        <PageTab label={t('Job Templates')}>TODO</PageTab>
        <PageTab label={t('Notifications')}>TODO</PageTab>
        <PageTab label={t('Schedules')}>TODO</PageTab>
      </PageTabs>
    </PageLayout>
  );
}
