import { StopIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IPageAction, PageActionSelection, PageActionType } from '../../../../framework';
import { Task } from '../Task';
import { useStopTasks } from './useTasksActions';
import { useHubContext } from '../../useHubContext';

export function useTaskActions(onComplete?: (tasks: Task[]) => void) {
  const { t } = useTranslation();
  const context = useHubContext();
  const stopTask = useStopTasks(onComplete);

  return useMemo<IPageAction<Task>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: StopIcon,
        label: t('Stop task'),
        onClick: (task) => stopTask([task]),
        isDanger: true,
        isDisabled: (item: Task) => {
          if (context.hasPermission('core.change_task') && item.state == 'running') {
            return '';
          } else {
            if (item.state != 'running') {
              return t`You can cancel only running tasks.`;
            } else {
              return t`You do not have rights to this operation`;
            }
          }
        },
      },
    ],
    [t, context, stopTask]
  );
}
