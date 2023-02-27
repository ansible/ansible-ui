import { ButtonVariant, AlertProps } from '@patternfly/react-core';
import { CopyIcon, EditIcon, SyncIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { IPageAction, PageActionType, usePageAlertToaster } from '../../../../../framework';
import { requestPost } from '../../../../Data';
import { RouteE } from '../../../../Routes';
import { Project } from '../../../interfaces/Project';
import { useDeleteProjects } from './useDeleteProjects';

export function useProjectActions(options: { onProjectsDeleted: (projects: Project[]) => void }) {
  const { onProjectsDeleted } = options;
  const { t } = useTranslation();
  const navigate = useNavigate();
  const deleteProjects = useDeleteProjects(onProjectsDeleted);
  const alertToaster = usePageAlertToaster();

  return useMemo<IPageAction<Project>[]>(() => {
    const cannotDeleteProject = (project: Project) =>
      project?.summary_fields?.user_capabilities?.delete
        ? ''
        : t(`The project cannot be deleted due to insufficient permission`);
    const cannotEditProject = (project: Project) =>
      project?.summary_fields?.user_capabilities?.edit
        ? ''
        : t(`The project cannot be edited due to insufficient permission`);
    const cannotSyncProject = (project: Project) =>
      project?.summary_fields?.user_capabilities?.start
        ? ''
        : t(`The project cannot be synced due to insufficient permission`);
    const cannotCopyProject = (project: Project) =>
      project?.summary_fields?.user_capabilities?.copy
        ? ''
        : t(`The project cannot be copied due to insufficient permission`);

    return [
      {
        type: PageActionType.single,
        variant: ButtonVariant.primary,
        icon: EditIcon,
        label: t('Edit project'),
        isDisabled: (project: Project) => cannotEditProject(project),
        onClick: (project) => navigate(RouteE.EditTeam.replace(':id', project.id.toString())),
      },
      {
        type: PageActionType.single,
        icon: SyncIcon,
        label: t('Sync project'),
        isDisabled: (project: Project) => cannotSyncProject(project),
        onClick: (project: Project) => {
          // TODO: make into a hook using websockets
          // update revision hash
          const alert: AlertProps = {
            variant: 'success',
            title: t(`Syncing ${project.name}.`),
            timeout: 2000,
          };
          requestPost(`/api/v2/projects/${project?.id ?? 0}/update/`, { id: project.id })
            .then(() => {
              alertToaster.addAlert(alert);
            })
            .catch((error) => {
              alertToaster.addAlert({
                variant: 'danger',
                title: t('Failed to sync project'),
                children: error instanceof Error && error.message,
              });
            });
        },
      },
      {
        type: PageActionType.single,
        icon: CopyIcon,
        label: t('Copy project'),
        isDisabled: (project: Project) => cannotCopyProject(project),
        onClick: (project: Project) => {
          const alert: AlertProps = {
            variant: 'success',
            title: t(`${project.name} copied.`),
            timeout: 2000,
          };
          requestPost(`/api/v2/projects/${project?.id ?? 0}/copy/`, {
            name: `${project.name} @ ${new Date()
              .toTimeString()
              .replace(/.*(\d{2}:\d{2}:\d{2}).*/, '$1')}`,
          })
            .then(() => {
              alertToaster.addAlert(alert);
            })
            .catch((error) => {
              alertToaster.replaceAlert(alert, {
                variant: 'danger',
                title: t('Failed to copy project'),
                children: error instanceof Error && error.message,
              });
            });
        },
      },
      { type: PageActionType.seperator },
      {
        type: PageActionType.single,
        icon: TrashIcon,
        label: t('Delete project'),
        isDisabled: (project: Project) => cannotDeleteProject(project),
        onClick: (project) => deleteProjects([project]),
        isDanger: true,
      },
    ];
  }, [alertToaster, deleteProjects, navigate, t]);
}
