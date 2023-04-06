import { AlertProps, ButtonVariant } from '@patternfly/react-core';
import { CopyIcon, EditIcon, SyncIcon, TrashIcon, MinusCircleIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { IPageAction, PageActionType, usePageAlertToaster } from '../../../../../framework';
import { usePostRequest } from '../../../../common/crud/usePostRequest';
import { RouteObj } from '../../../../Routes';
import { Project } from '../../../interfaces/Project';
import { useDeleteProjects } from './useDeleteProjects';
import { useCancelProjects } from './useCancelProjects';

export function useProjectActions(onComplete: (projects: Project[]) => void) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const deleteProjects = useDeleteProjects(onComplete);
  const cancelProjects = useCancelProjects(onComplete);
  const alertToaster = usePageAlertToaster();
  const postRequest = usePostRequest();

  return useMemo<IPageAction<Project>[]>(() => {
    const cannotCancelProjectDueToStatus = (project: Project) =>
      ['pending', 'waiting', 'running'].includes(project.status)
        ? ''
        : t(`The project sync cannot be canceled because it is not running`);
    const cannotCancelProjectDueToPermissions = (project: Project) =>
      project?.summary_fields?.user_capabilities?.start
        ? ''
        : t(`The project sync cannot be canceled because it is not running`);
    const cannotDeleteProject = (project: Project) =>
      project?.summary_fields?.user_capabilities?.delete
        ? ''
        : t(`The project cannot be deleted due to insufficient permission`);
    const cannotEditProject = (project: Project) =>
      project?.summary_fields?.user_capabilities?.edit
        ? ''
        : t(`The project cannot be edited due to insufficient permission`);
    const cannotSyncProject = (project: Project) => {
      if (project.scm_type === '') {
        return t(`Cannot sync project`);
      }
      if (project.scm_type !== '' && !project?.summary_fields?.user_capabilities?.start) {
        return t(`The project cannot be synced due to insufficient permission`);
      }
      if (['pending', 'waiting', 'running'].includes(project.status)) {
        return t(`The project cannot be synced because a sync job is currently running`);
      }
      return '';
    };
    const cannotCopyProject = (project: Project) =>
      project?.summary_fields?.user_capabilities?.copy
        ? ''
        : t(`The project cannot be copied due to insufficient permission`);

    return [
      {
        type: PageActionType.single,
        icon: EditIcon,
        label: t('Edit project'),
        isDisabled: (project: Project) => cannotEditProject(project),
        onClick: (project) => navigate(RouteObj.EditProject.replace(':id', project.id.toString())),
      },
      {
        type: PageActionType.single,
        variant: ButtonVariant.primary,
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
          postRequest(`/api/v2/projects/${project?.id ?? 0}/update/`, { id: project.id })
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
        variant: ButtonVariant.secondary,
        icon: MinusCircleIcon,
        label: t(`Cancel project sync`),
        isDisabled: (project: Project) =>
          cannotCancelProjectDueToPermissions(project) || cannotCancelProjectDueToStatus(project),
        isHidden: (project: Project) => Boolean(cannotCancelProjectDueToStatus(project)),
        onClick: (project: Project) => cancelProjects([project]),
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
          postRequest(`/api/v2/projects/${project?.id ?? 0}/copy/`, {
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
  }, [alertToaster, cancelProjects, deleteProjects, navigate, postRequest, t]);
}
