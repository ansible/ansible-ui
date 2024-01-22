import { AlertProps, ButtonVariant } from '@patternfly/react-core';
import {
  CopyIcon,
  MinusCircleIcon,
  PencilAltIcon,
  SyncIcon,
  TrashIcon,
} from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  usePageAlertToaster,
  usePageNavigate,
} from '../../../../../framework';
import { usePostRequest } from '../../../../common/crud/usePostRequest';
import { awxAPI } from '../../../common/api/awx-utils';
import { Project } from '../../../interfaces/Project';
import { AwxRoute } from '../../../main/AwxRoutes';
import { useCancelProjects } from './useCancelProjects';
import { useDeleteProjects } from './useDeleteProjects';

export function useProjectActions(
  onComplete: (projects: Project[]) => void,
  showToastMessage?: boolean
) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const deleteProjects = useDeleteProjects(onComplete);
  const cancelProjects = useCancelProjects();
  const alertToaster = usePageAlertToaster();
  const postRequest = usePostRequest();

  return useMemo<IPageAction<Project>[]>(() => {
    const cannotCancelProjectDueToStatus = (project: Project) =>
      ['pending', 'waiting', 'running'].includes(project.status ?? '')
        ? ''
        : t(`The project sync cannot be canceled because it is not running`);
    const cannotCancelProjectDueToPermissions = (project: Project) =>
      project?.summary_fields?.user_capabilities?.start
        ? ''
        : t(`The project sync cannot be canceled due to insufficient permission`);
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
      if (project.scm_type && !project?.summary_fields?.user_capabilities?.start) {
        return t(`The project cannot be synced due to insufficient permission`);
      }
      if (['pending', 'waiting', 'running'].includes(project.status ?? '')) {
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
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        isPinned: true,
        variant: ButtonVariant.secondary,
        icon: MinusCircleIcon,
        label: t(`Cancel project sync`),
        isDisabled: (project: Project) =>
          cannotCancelProjectDueToPermissions(project) || cannotCancelProjectDueToStatus(project),
        isHidden: (project: Project) => Boolean(cannotCancelProjectDueToStatus(project)),
        onClick: (project: Project) => cancelProjects([project]),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        isPinned: true,
        variant: ButtonVariant.primary,
        icon: SyncIcon,
        label: t('Sync project'),
        isDisabled: cannotSyncProject,
        isHidden: (project: Project) => Boolean(!cannotCancelProjectDueToStatus(project)),
        onClick: (project: Project) => {
          const alert: AlertProps = {
            variant: 'success',
            title: t(`Syncing ${project.name}.`),
            timeout: 2000,
          };
          postRequest(awxAPI`/projects/${project?.id.toString() ?? ''}/update/`, {
            id: project.id,
          })
            .then(() => {
              showToastMessage ? alertToaster.addAlert(alert) : null;
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
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        isPinned: true,
        icon: PencilAltIcon,
        label: t('Edit project'),
        isDisabled: (project: Project) => cannotEditProject(project),
        onClick: (project) => pageNavigate(AwxRoute.EditProject, { params: { id: project.id } }),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: CopyIcon,
        label: t('Copy project'),
        isDisabled: (project: Project) => cannotCopyProject(project),
        onClick: (project: Project) => {
          const alert: AlertProps = {
            variant: 'success',
            title: t(`${project.name} copied.`),
            timeout: 2000,
          };
          postRequest(awxAPI`/projects/${project?.id.toString() ?? ''}/copy/`, {
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
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Delete project'),
        isDisabled: (project: Project) => cannotDeleteProject(project),
        onClick: (project) => deleteProjects([project]),
        isDanger: true,
      },
    ];
  }, [
    alertToaster,
    cancelProjects,
    deleteProjects,
    showToastMessage,
    pageNavigate,
    postRequest,
    t,
  ]);
}
