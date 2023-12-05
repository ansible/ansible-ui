import { StopIcon } from '@patternfly/react-icons';
import { useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { IPageAction, PageActionSelection, PageActionType } from '../../../../framework';
import { Task } from '../Task';
import { useHubContext } from '../../useHubContext';
import { compareStrings, useBulkConfirmation } from '../../../../framework';
import { requestPatch } from '../../../common/crud/Data';
import { pulpAPI } from '../../api/formatPath';
import { parsePulpIDFromURL } from '../../api/utils';
import { useTasksColumns } from './useTasksColumns';

export function useTasksToolbarActions(onComplete?: (tasks: Task[]) => void) {
  const { t } = useTranslation();
  const context = useHubContext();
  const stopTasks = useStopTasks(onComplete);

  return useMemo<IPageAction<Task>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: StopIcon,
        label: t('Stop tasks'),
        onClick: (tasks) => stopTasks(tasks),
        isDanger: true,
        isDisabled: context.hasPermission('core.change_task')
          ? ''
          : t`You do not have rights to this operation`,
      },
    ],
    [t, context, stopTasks]
  );
}

export function useStopTasks(onComplete?: (tasks: Task[]) => void) {
  const { t } = useTranslation();
  const confirmationColumns = useTasksColumns();
  const actionColumns = useMemo(() => [confirmationColumns[0]], [confirmationColumns]);
  const bulkAction = useBulkConfirmation<Task>();
  return useCallback(
    (ees: Task[]) => {
      const filteredEes = ees
        .map((task) => task.state)
        .filter((state) => state === 'running' || state === 'waiting');
      bulkAction({
        title: t('Stop running/waiting task', { count: filteredEes.length }),
        confirmText: t(
          'Yes, I confirm that I want to stop these {{count}} running/waiting tasks.',
          {
            count: filteredEes.length,
          }
        ),
        actionButtonText: t('Stop tasks', { count: filteredEes.length }),
        items: ees.sort((l, r) => compareStrings(l.pulp_href || '', r.pulp_href || '')),
        keyFn: (item) => item.name,
        isDanger: true,
        confirmationColumns,
        actionColumns,
        onComplete,
        actionFn: (task: Task) => stopRunningTask(task),
        isItemNonActionable: (task: Task) =>
          task.state === 'running' || task.state === 'waiting'
            ? ''
            : t('Can only cancel running or waiting tasks'),
      });
    },
    [actionColumns, bulkAction, confirmationColumns, onComplete, t]
  );
}

function stopRunningTask(task: Task) {
  return requestPatch(pulpAPI`/tasks/${parsePulpIDFromURL(task.pulp_href) || ''}/`, {
    state: 'canceled',
  });
}
