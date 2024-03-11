import { StopCircleIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IPageAction, PageActionSelection, PageActionType } from '../../../../../framework';
import { Task } from '../Task';
import { useStopTasks } from './useTasksToolbarActions';
import { useHubContext } from '../../../common/useHubContext';

export function useTasksRowActions(onComplete?: (tasks: Task[]) => void) {
  const { t } = useTranslation();
  const context = useHubContext();
  const stopTask = useStopTasks(onComplete);

  return useMemo<IPageAction<Task>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: StopCircleIcon,
        isPinned: true,
        label: t('Stop task'),
        onClick: (task) => stopTask([task]),
        isDanger: true,
        isDisabled: (item: Task) => {
          const hasPermission = context.hasPermission('core.change_task');
          const isStoppable = item.state === 'running' || item.state === 'waiting';

          if (isStoppable && hasPermission) {
            return '';
          }
          if (!isStoppable) {
            return t`You can cancel only running or waiting tasks.`;
          }

          if (!hasPermission) {
            return t`You do not have rights to this operation`;
          }
        },
      },
    ],
    [t, context, stopTask]
  );
}
