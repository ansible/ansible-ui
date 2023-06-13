import { EditIcon, TrashIcon } from '@patternfly/react-icons';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IPageAction, PageActionSelection, PageActionType } from '../../../../../framework';
import { requestPatch } from '../../../../common/crud/Data';
import { useOptions } from '../../../../common/crud/useOptions';
import { cannotDeleteResource, cannotEditResource } from '../../../../common/utils/RBAChelpers';
import { ActionsResponse, OptionsResponse } from '../../../interfaces/OptionsResponse';
import { Schedule } from '../../../interfaces/Schedule';
import { getScheduleResourceUrl } from './getScheduleResourceUrl';
import { useDeleteSchedules } from './useDeleteSchedules';

export function useSchedulesActions(options: { onScheduleToggleorDeleteCompleted: () => void }) {
  const { t } = useTranslation();
  const deleteSchedule = useDeleteSchedules(options?.onScheduleToggleorDeleteCompleted);
  const { data } = useOptions<OptionsResponse<ActionsResponse>>('/api/v2/schedules/');
  const canCreateSchedule = Boolean(data && data.actions && data.actions['POST']);
  const handleToggleSchedule: (schedule: Schedule, enabled: boolean) => Promise<void> = useCallback(
    async (schedule, enabled) => {
      await requestPatch<Schedule>(`/api/v2/schedules/${schedule.id}/`, { enabled });
      options?.onScheduleToggleorDeleteCompleted();
    },
    [options]
  );
  const rowActions = useMemo<IPageAction<Schedule>[]>(
    () => [
      {
        isPinned: true,
        ariaLabel: (isEnabled) =>
          isEnabled ? t('Click to disable schedule') : t('Click to enable schedule'),
        type: PageActionType.Switch,
        selection: PageActionSelection.Single,
        labelOff: t('Disabled'),
        label: t('Enabled'),
        isDisabled: (schedule) => cannotEditResource(schedule, t, canCreateSchedule),
        onToggle: (schedule, enabled) => handleToggleSchedule(schedule, enabled),
        isSwitchOn: (schedule) => schedule.enabled,
      },
      {
        type: PageActionType.Link,
        selection: PageActionSelection.Single,
        icon: EditIcon,
        isPinned: true,
        label: t(`Edit schedule`),
        isDisabled: (schedule) => cannotEditResource(schedule, t, canCreateSchedule),
        href: (schedule) => getScheduleResourceUrl(schedule),
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Delete schedule'),
        isDisabled: (schedule) => cannotDeleteResource(schedule, t),
        onClick: (schedule) => deleteSchedule([schedule]),
        isDanger: true,
      },
    ],
    [deleteSchedule, handleToggleSchedule, canCreateSchedule, t]
  );
  return rowActions;
}
