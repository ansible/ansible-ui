import { EditIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IPageAction, PageActionSelection, PageActionType } from '../../../../../../framework';
import { Schedule } from '../../../../interfaces/Schedule';
import { useDeleteSchedules } from './useDeleteSchedules';
import { cannotDeleteResource, cannotEditResource } from '../../../../../common/utils/RBAChelpers';
import { getScheduleResourceUrl } from './ getScheduleResourceUrl';

export function useSchedulesActions(options: { onDeleted: (schedule: Schedule[]) => void }) {
  const { t } = useTranslation();
  const deleteSchedule = useDeleteSchedules(options?.onDeleted);

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
    [deleteSchedule, t]
  );
  return rowActions;
}
