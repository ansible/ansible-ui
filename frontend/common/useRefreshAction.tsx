import { ButtonVariant } from '@patternfly/react-core';
import { SyncAltIcon } from '@patternfly/react-icons';
import { ComponentClass, useMemo } from 'react';
import { IPageAction, PageActionType, RunningIcon } from '../../framework';

export function useRefreshAction(refreshing: boolean, refresh: () => void | Promise<unknown>) {
  return useMemo<IPageAction<object>[]>(
    () => [
      {
        type: PageActionType.button,
        variant: ButtonVariant.primary,
        icon: refreshing ? (RunningIcon as unknown as ComponentClass) : SyncAltIcon,
        label: refreshing ? 'Refreshing' : 'Refresh',
        onClick: () => void refresh(),
      },
    ],
    [refresh, refreshing]
  );
}
