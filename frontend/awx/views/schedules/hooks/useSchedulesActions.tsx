import { EditIcon, TrashIcon } from '@patternfly/react-icons';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IPageAction, PageActionSelection, PageActionType } from '../../../../../framework';
import { Schedule } from '../../../interfaces/Schedule';
import { useDeleteSchedules } from './useDeleteSchedules';
import { cannotDeleteResource, cannotEditResource } from '../../../../common/utils/RBAChelpers';
import { getScheduleResourceUrl } from './getScheduleResourceUrl';
import { requestPatch } from '../../../../common/crud/Data';

export function useSchedulesActions(options: { onScheduleToggleorDeleteCompleted: () => void }) {
  const { t } = useTranslation();
  const deleteSchedule = useDeleteSchedules(options?.onScheduleToggleorDeleteCompleted);
  const handleToggleSchedule: (schedule: Schedule, enabled: boolean) => Promise<void> = useCallback(
    async (schedule, enabled) => {
      await requestPatch(`/api/v2/schedules/${schedule.id}/`, { enabled });
      options?.onScheduleToggleorDeleteCompleted();
    },
    [options]
  );
  const rowActions = useMemo<IPageAction<Schedule>[]>(
    () => [
      {
        type: PageActionType.Link,
        selection: PageActionSelection.Single,
        icon: EditIcon,
        label: t(`Edit schedule`),
        isDisabled: (schedule) => cannotEditResource(schedule, t),
        href: (schedule) => getScheduleResourceUrl(schedule),
      },
      {
        isPinned: true,
        type: PageActionType.Switch,
        selection: PageActionSelection.Single,
        labelOff: t('Disabled'),
        label: t('Enabled'),
        onToggle: (schedule, enabled) => handleToggleSchedule(schedule, enabled),
        isSwitchOn: (schedule) => schedule.enabled,
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
    [deleteSchedule, handleToggleSchedule, t]
  );
  return rowActions;
}
