import { useMemo } from 'react';
import { IPageAction, PageActionType } from '../../../../framework';
import { EdaJob } from '../../interfaces/EdaJob';
import { useLaunchAction } from './useLaunchAction';

export function useActivationActionsActions() {
  const launchAction = useLaunchAction();

  return useMemo<IPageAction<EdaJob>[]>(
    () => [
      {
        type: PageActionType.single,
        label: 'Launch',
        onClick: (job: EdaJob) => launchAction(job),
      },
    ],
    [launchAction]
  );
}
