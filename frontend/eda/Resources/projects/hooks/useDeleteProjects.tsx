import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { compareStrings, useBulkConfirmation } from '../../../../../framework';
import { requestDelete } from '../../../../Data';
import { idKeyFn } from '../../../../hub/useHubView';
import { EdaProject } from '../../../interfaces/EdaProject';
import { useProjectColumns } from './useProjectColumns';

export function useDeleteProjects(onComplete: (projects: EdaProject[]) => void) {
  const { t } = useTranslation();
  const confirmationColumns = useProjectColumns();
  const actionColumns = useMemo(() => [confirmationColumns[0]], [confirmationColumns]);
  const bulkAction = useBulkConfirmation<EdaProject>();
  return useCallback(
    (projects: EdaProject[]) => {
      bulkAction({
        title: t('Permanently delete projects', { count: projects.length }),
        confirmText: t('Yes, I confirm that I want to delete these {{count}} projects.', {
          count: projects.length,
        }),
        actionButtonText: t('Delete projects', { count: projects.length }),
        items: projects.sort((l, r) => compareStrings(l.name, r.name)),
        keyFn: idKeyFn,
        isDanger: true,
        confirmationColumns,
        actionColumns,
        onComplete,
        actionFn: (project: EdaProject) => requestDelete(`/eda/api/v1/projects/${project.id}`),
      });
    },
    [actionColumns, bulkAction, confirmationColumns, onComplete, t]
  );
}
