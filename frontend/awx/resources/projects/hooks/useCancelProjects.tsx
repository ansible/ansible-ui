import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { compareStrings, useBulkConfirmation } from '../../../../../framework';
import { useNameColumn } from '../../../../common/columns';
import { getItemKey } from '../../../../common/crud/Data';
import { usePostRequest } from '../../../../common/crud/usePostRequest';
import { Project } from '../../../interfaces/Project';
import { useProjectsColumns } from './useProjectsColumns';

export function useCancelProjects(onComplete: (projects: Project[]) => void) {
  const { t } = useTranslation();
  const confirmationColumns = useProjectsColumns({ disableLinks: true, disableSort: true });
  const cancelActionNameColumn = useNameColumn({ disableLinks: true, disableSort: true });
  const actionColumns = useMemo(() => [cancelActionNameColumn], [cancelActionNameColumn]);
  const bulkAction = useBulkConfirmation<Project>();
  const postRequest = usePostRequest();

  function isProjectRunning(status: string) {
    return ['pending', 'waiting', 'running'].includes(status);
  }
  const cannotCancelProjectDueToPermissions = (project: Project) => {
    if (!project.summary_fields?.user_capabilities?.start)
      return t(`The project sync cannot be canceled due to insufficient permission`);
    return '';
  };
  const cannotCancelProjectDueToStatus = (project: Project) => {
    if (!isProjectRunning(project.status))
      return t(`The project sync cannot be canceled because it is not running`);
    return '';
  };

  const cancelProjects = (projects: Project[]) => {
    const uncancellableProjectsDueToStatus: Project[] = projects.filter(
      cannotCancelProjectDueToStatus
    );
    const runningProjects: Project[] = projects.filter((project) =>
      isProjectRunning(project.status)
    );
    const uncancellableProjectsDueToPermissions: Project[] = runningProjects.filter(
      cannotCancelProjectDueToPermissions
    );

    bulkAction({
      title: t('Cancel project sync', { count: projects.length }),
      confirmText: t('Yes, I confirm that I want to cancel these project sync jobs.', {
        count:
          projects.length -
          uncancellableProjectsDueToPermissions.length -
          uncancellableProjectsDueToStatus.length,
      }),
      actionButtonText: t('Cancel project sync', { count: projects.length }),
      items: projects.sort((l, r) => compareStrings(l.name, r.name)),
      alertPrompts:
        uncancellableProjectsDueToStatus.length || uncancellableProjectsDueToPermissions.length
          ? [
              ...(uncancellableProjectsDueToStatus.length
                ? [
                    t(
                      '{{count}} of the selected project sync jobs cannot be canceled because they are not running.',
                      {
                        count: uncancellableProjectsDueToStatus.length,
                      }
                    ),
                  ]
                : []),
              ...(uncancellableProjectsDueToPermissions.length
                ? [
                    t(
                      '{{count}} of the selected project sync jobs cannot be cancelled due to insufficient permissions.',
                      {
                        count: uncancellableProjectsDueToPermissions.length,
                      }
                    ),
                  ]
                : []),
            ]
          : undefined,
      isItemNonActionable: (item: Project) =>
        cannotCancelProjectDueToStatus(item)
          ? cannotCancelProjectDueToStatus(item)
          : cannotCancelProjectDueToPermissions(item),
      keyFn: getItemKey,
      confirmationColumns,
      actionColumns,
      onComplete,
      actionFn: (project: Project) =>
        postRequest(
          `/api/v2/project_updates/${project.summary_fields?.current_update?.id ?? 0}/cancel/`,
          {}
        ),
    });
  };
  return cancelProjects;
}
