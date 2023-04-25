import { DropdownPosition, PageSection, Skeleton, Stack } from '@patternfly/react-core';
import { GitAltIcon, PencilAltIcon, SyncAltIcon, TrashIcon } from '@patternfly/react-icons';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import {
  errorToAlertProps,
  IPageAction,
  PageActions,
  PageActionSelection,
  PageActionType,
  PageDetail,
  PageDetails,
  PageHeader,
  PageLayout,
  PageTab,
  PageTabs,
  TextCell,
  usePageAlertToaster,
} from '../../../../framework';
import { formatDateString } from '../../../../framework/utils/formatDateString';
import { RouteObj } from '../../../Routes';
import { StatusCell } from '../../../common/StatusCell';
import { useGet } from '../../../common/crud/useGet';
import { API_PREFIX } from '../../constants';
import { EdaProject } from '../../interfaces/EdaProject';
import { useDeleteProjects } from './hooks/useDeleteProjects';
import { postRequest } from '../../../common/crud/Data';

export function ProjectDetails() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const alertToaster = usePageAlertToaster();

  const { data: project, refresh } = useGet<EdaProject>(
    `${API_PREFIX}/projects/${params.id ?? ''}/`
  );
  const syncProject = useCallback(
    (project: EdaProject) =>
      postRequest(`${API_PREFIX}/projects/${project.id}/sync/`, undefined)
        .then(() => {
          alertToaster.addAlert({
            title: `${t('Syncing')} ${project?.name || t('project')}`,
            variant: 'success',
            timeout: 5000,
          });
        })
        .catch((err) => alertToaster.addAlert(errorToAlertProps(err)))
        .finally(() => refresh()),
    [alertToaster, refresh, t]
  );
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
        icon: SyncAltIcon,
        isPinned: true,
        label: t('Sync project'),
        isHidden: (project: EdaProject) => {
          return project?.import_state === 'pending' || project?.import_state === 'running';
        },
        onClick: (project: EdaProject) => syncProject(project),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: PencilAltIcon,
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
    [deleteProjects, navigate, syncProject, t]
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
