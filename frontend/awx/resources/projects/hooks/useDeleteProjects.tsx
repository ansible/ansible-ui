import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { compareStrings } from '../../../../../framework';
import { useNameColumn } from '../../../../common/columns';
import { getItemKey, requestDelete } from '../../../../common/crud/Data';
import { awxAPI } from '../../../api/awx-utils';
import { Project } from '../../../interfaces/Project';
import { useAwxBulkConfirmation } from '../../../common/useAwxBulkConfirmation';
import { useProjectsColumns } from './useProjectsColumns';

export function useDeleteProjects(onComplete: (projects: Project[]) => void) {
  const { t } = useTranslation();
  const confirmationColumns = useProjectsColumns({ disableLinks: true, disableSort: true });
  const deleteActionNameColumn = useNameColumn({ disableLinks: true, disableSort: true });
  const actionColumns = useMemo(() => [deleteActionNameColumn], [deleteActionNameColumn]);
  const bulkAction = useAwxBulkConfirmation<Project>();
  const deleteProjects = (projects: Project[]) => {
    bulkAction({
      title: t('Permanently delete projects', { count: projects.length }),
      confirmText: t('Yes, I confirm that I want to delete these {{count}} projects.', {
        count: projects.length,
      }),
      actionButtonText: t('Delete projects', { count: projects.length }),
      items: projects.sort((l, r) => compareStrings(l.name, r.name)),
      keyFn: getItemKey,
      isDanger: true,
      confirmationColumns,
      actionColumns,
      onComplete,
      actionFn: (project: Project, signal) =>
        requestDelete(awxAPI`/projects/${project.id.toString()}/`, signal),
    });
  };
  return deleteProjects;
}
