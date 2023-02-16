import { DropdownPosition, PageSection, Skeleton, Stack } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import {
  IPageAction,
  PageActions,
  PageActionType,
  PageDetails,
  PageHeader,
  PageLayout,
  PageTab,
  PageTabs,
} from '../../../../framework';
import { PageDetail } from '../../../../framework';
import { formatDateString } from '../../../../framework/utils/formatDateString';
import { useGet } from '../../../common/useItem';
import { RouteE } from '../../../Routes';
import { EdaProject } from '../../interfaces/EdaProject';
import { API_PREFIX } from '../../constants';
import { useMemo } from 'react';
import { EditIcon, TrashIcon } from '@patternfly/react-icons';
import { useDeleteProjects } from './hooks/useDeleteProjects';

export function ProjectDetails() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: project } = useGet<EdaProject>(`${API_PREFIX}/projects/${params.id ?? ''}/`);

  const deleteProjects = useDeleteProjects((deleted) => {
    if (deleted.length > 0) {
      navigate(RouteE.EdaProjects);
    }
  });

  const itemActions = useMemo<IPageAction<EdaProject>[]>(
    () => [
      {
        type: PageActionType.single,
        icon: EditIcon,
        label: t('Edit project'),
        onClick: (project: EdaProject) =>
          navigate(RouteE.EditEdaProject.replace(':id', project.id.toString())),
      },
      {
        type: PageActionType.single,
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
        <PageDetail label={t('SCM type')}>{project?.type || 'Git'}</PageDetail>
        <PageDetail label={t('SCM URL')}>{project?.type || ''}</PageDetail>
        <PageDetail label={t('SCM token')}>{project?.token || ''}</PageDetail>
        <PageDetail label={t('Git hash')}>{project?.git_hash || ''}</PageDetail>
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
        breadcrumbs={[{ label: t('Projects'), to: RouteE.EdaProjects }, { label: project?.name }]}
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
