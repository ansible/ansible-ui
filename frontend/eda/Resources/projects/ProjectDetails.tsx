import { DropdownPosition, PageSection, Skeleton, Stack } from '@patternfly/react-core';
import { EditIcon, GitAltIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  PageActions,
  PageDetail,
  PageDetails,
  PageHeader,
  PageLayout,
  PageTab,
  PageTabs,
  TextCell,
} from '../../../../framework';
import { formatDateString } from '../../../../framework/utils/formatDateString';
import { RouteObj } from '../../../Routes';
import { StatusCell } from '../../../common/StatusCell';
import { useGet } from '../../../common/crud/useGet';
import { API_PREFIX } from '../../constants';
import { EdaProject } from '../../interfaces/EdaProject';
import { useDeleteProjects } from './hooks/useDeleteProjects';

export function ProjectDetails() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: project } = useGet<EdaProject>(`${API_PREFIX}/projects/${params.id ?? ''}/`);

  const deleteProjects = useDeleteProjects((deleted) => {
    if (deleted.length > 0) {
      navigate(RouteObj.EdaProjects);
    }
  });

  const itemActions = useMemo<IPageAction<EdaProject>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: EditIcon,
        label: t('Edit project'),
        onClick: (project: EdaProject) =>
          navigate(RouteObj.EditEdaProject.replace(':id', project.id.toString())),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Delete project'),
        onClick: (project: EdaProject) => deleteProjects([project]),
        isDanger: true,
      },
    ],
    [deleteProjects, navigate, t]
  );

  const renderProjectDetailsTab = (project: EdaProject | undefined): JSX.Element => {
    return (
      <PageDetails>
        <PageDetail label={t('Name')}>{project?.name || ''}</PageDetail>
        <PageDetail label={t('Description')}>{project?.description || ''}</PageDetail>
        <PageDetail label={t('SCM type')}>
          <TextCell icon={<GitAltIcon color="#F1502F" />} iconSize="md" text={'Git'} />
        </PageDetail>
        <PageDetail label={t('SCM URL')}>{project?.url || ''}</PageDetail>
        <PageDetail label={t('Git hash')}>{project?.git_hash || ''}</PageDetail>
        <PageDetail label={t('Status')}>
          <StatusCell status={project?.import_state || ''} />
        </PageDetail>
        <PageDetail label={t('Created')}>
          {project?.created_at ? formatDateString(project.created_at) : ''}
        </PageDetail>
        <PageDetail label={t('Modified')}>
          {project?.modified_at ? formatDateString(project.modified_at) : ''}
        </PageDetail>
      </PageDetails>
    );
  };

  return (
    <PageLayout>
      <PageHeader
        title={project?.name}
        breadcrumbs={[{ label: t('Projects'), to: RouteObj.EdaProjects }, { label: project?.name }]}
        headerActions={
          <PageActions<EdaProject>
            actions={itemActions}
            position={DropdownPosition.right}
            selectedItem={project}
          />
        }
      />
      {project ? (
        <PageTabs>
          <PageTab label={t('Details')}>{renderProjectDetailsTab(project)}</PageTab>
        </PageTabs>
      ) : (
        <PageTabs>
          <PageTab>
            <PageSection variant="light">
              <Stack hasGutter>
                <Skeleton />
                <Skeleton />
                <Skeleton />
                <Skeleton />
              </Stack>
            </PageSection>
          </PageTab>
        </PageTabs>
      )}
    </PageLayout>
  );
}
