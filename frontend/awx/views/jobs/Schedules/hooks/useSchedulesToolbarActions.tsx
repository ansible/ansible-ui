import { ButtonVariant } from '@patternfly/react-core';
import { PlusIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { RouteObj } from '../../../../../Routes';
import { useOptions } from '../../../../../common/crud/useOptions';
import { ActionsResponse, OptionsResponse } from '../../../../interfaces/OptionsResponse';
import { useDeleteSchedules } from './useDeleteSchedules';

import { IPageAction, PageActionSelection, PageActionType } from '../../../../../../framework';
import { Schedule } from '../../../../interfaces/Schedule';

export function useScheduleToolbarActions(onComplete: (schedules: Schedule[]) => void) {
  const { t } = useTranslation();
  const { data } = useOptions<OptionsResponse<ActionsResponse>>('/api/v2/schedules/');
  const canCreateSchedule = Boolean(data && data.actions && data.actions['POST']);

  const deleteSchedules = useDeleteSchedules(onComplete);

  const ScheduleToolbarActions = useMemo<IPageAction<Schedule>[]>(
    () => [
      {
        type: PageActionType.Link,
        selection: PageActionSelection.None,
        variant: ButtonVariant.primary,
        isPinned: true,
        icon: PlusIcon,
        label: t('Create schedule'),
        isDisabled: canCreateSchedule
          ? undefined
          : t(
              'You do not have permission to create a schedule. Please contact your organization administrator if there is an issue with your access.'
            ),
        href: RouteObj.CreateSchedule,
      },

      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: TrashIcon,
        label: t('Delete selected schedules'),
        onClick: deleteSchedules,
        isDanger: true,
      },
    ],
    [canCreateSchedule, deleteSchedules, t]
  );

  return ScheduleToolbarActions;
}
