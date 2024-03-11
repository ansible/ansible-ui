import { StopCircleIcon } from '@patternfly/react-icons';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  compareStrings,
} from '../../../../../framework';
import { requestPatch } from '../../../../common/crud/Data';
import { pulpAPI } from '../../../common/api/formatPath';
import { useHubBulkConfirmation } from '../../../common/useHubBulkConfirmation';
import { useHubContext } from '../../../common/useHubContext';
import { Task } from '../Task';
import { parsePulpIDFromURL } from '../../../common/api/hub-api-utils';
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
        icon: StopCircleIcon,
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
  const bulkAction = useHubBulkConfirmation<Task>();
  return useCallback(
    (tasks: Task[]) => {
      const filteredTasks = tasks
        .map((task) => task.state)
        .filter((state) => state === 'running' || state === 'waiting');
      bulkAction({
        title: t('Stop running/waiting task', { count: filteredTasks.length }),
        confirmText: t(
          'Yes, I confirm that I want to stop these {{count}} running/waiting tasks.',
          {
            count: filteredTasks.length,
          }
        ),
        actionButtonText: t('Stop tasks', { count: filteredTasks.length }),
        items: tasks.sort((l, r) => compareStrings(l.pulp_href || '', r.pulp_href || '')),
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
  return requestPatch(pulpAPI`/tasks/${parsePulpIDFromURL(task.pulp_href)}/`, {
    state: 'canceled',
  });
}
