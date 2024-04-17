import { ButtonVariant } from '@patternfly/react-core';
import { PlusCircleIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IPageAction, PageActionSelection, PageActionType } from '../../../../../framework';
import { useOptions } from '../../../../common/crud/useOptions';
import { awxAPI } from '../../../common/api/awx-utils';
import { ActionsResponse, OptionsResponse } from '../../../interfaces/OptionsResponse';
import { Schedule } from '../../../interfaces/Schedule';
import { useGetSchedulCreateUrl } from './scheduleHelpers';
import { useDeleteSchedules } from './useDeleteSchedules';
import { cannotDeleteResources } from '../../../../common/utils/RBAChelpers';

export function useScheduleToolbarActions(
  onComplete: (schedules: Schedule[]) => void,
  sublistEndPoint = awxAPI`/schedules/`
) {
  const createUrl = useGetSchedulCreateUrl(sublistEndPoint);

  const { t } = useTranslation();
  const { data } = useOptions<OptionsResponse<ActionsResponse>>(sublistEndPoint);
  const canCreateSchedule = Boolean(data && data.actions && data.actions['POST']);

  const deleteSchedules = useDeleteSchedules(onComplete);

  const ScheduleToolbarActions = useMemo<IPageAction<Schedule>[]>(
    () => [
      {
        type: PageActionType.Link,
        selection: PageActionSelection.None,
        variant: ButtonVariant.primary,
        isPinned: true,
        icon: PlusCircleIcon,
        label: t('Create schedule'),
        isDisabled: canCreateSchedule
          ? undefined
          : t(
              'You do not have permission to create a schedule. Please contact your organization administrator if there is an issue with your access.'
            ),
        href: createUrl,
      },

      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: TrashIcon,
        label: t('Delete selected schedules'),
        onClick: deleteSchedules,
        isDisabled: (schedules) => cannotDeleteResources(schedules, t),

        isDanger: true,
      },
    ],
    [canCreateSchedule, createUrl, deleteSchedules, t]
  );

  return ScheduleToolbarActions;
}
