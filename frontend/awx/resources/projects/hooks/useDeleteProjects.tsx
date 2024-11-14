import { compareStrings } from '@ansible/ansible-ui-framework';
import { useNameColumn } from '@ansible/common-ui/columns';
import { getItemKey, requestDelete } from '@ansible/common-ui/crud/Data';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { awxAPI } from '../../../common/api/awx-utils';
import { useAwxBulkConfirmation } from '../../../common/useAwxBulkConfirmation';
import { Project } from '../../../interfaces/Project';
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
