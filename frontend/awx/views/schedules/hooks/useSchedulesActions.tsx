import { PencilAltIcon, TrashIcon } from '@patternfly/react-icons';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IPageAction, PageActionSelection, PageActionType } from '../../../../../framework';
import { requestPatch } from '../../../../common/crud/Data';
import { useOptions } from '../../../../common/crud/useOptions';
import { cannotDeleteResource, cannotEditResource } from '../../../../common/utils/RBAChelpers';
import { awxAPI } from '../../../common/api/awx-utils';
import { ActionsResponse, OptionsResponse } from '../../../interfaces/OptionsResponse';
import { Schedule } from '../../../interfaces/Schedule';
import { useGetScheduleUrl } from './scheduleHelpers';
import { useDeleteSchedules } from './useDeleteSchedules';
import { JobTypeLabel, ScheduleRoutes } from '../types';
import { UnifiedJobType } from '../../../resources/templates/WorkflowVisualizer/types';

export function useSchedulesActions(options: {
  onScheduleToggleorDeleteCompleted: () => void;
  sublistEndpoint?: string;
}) {
  const { t } = useTranslation();
  const deleteSchedule = useDeleteSchedules(options?.onScheduleToggleorDeleteCompleted);
  const { data } = useOptions<OptionsResponse<ActionsResponse>>(awxAPI`/schedules/`);
  const canCreateSchedule = Boolean(data && data.actions && data.actions['POST']);
  const handleToggleSchedule: (schedule: Schedule, enabled: boolean) => Promise<void> = useCallback(
    async (schedule, enabled) => {
      await requestPatch<Schedule>(awxAPI`/schedules/${schedule.id.toString()}/`, { enabled });
      options?.onScheduleToggleorDeleteCompleted();
    },
    [options]
  );

  const jobTypeLabels: JobTypeLabel = useGetScheduleUrl({
    scheduleEditRoute: true,
  } as ScheduleRoutes);
  const editUrl = useCallback(
    (schedule: Schedule) => {
      const unified_job_type = schedule.summary_fields.unified_job_template
        .unified_job_type as UnifiedJobType;
      const editRoute = jobTypeLabels[unified_job_type]?.scheduleEditRoute as string;
      const isInventoryUpdate = unified_job_type === 'inventory_update';
      if (editRoute === undefined) return '';
      return isInventoryUpdate && schedule.summary_fields.inventory
        ? editRoute
            .replace(':id', schedule.summary_fields.inventory?.id.toString())
            .replace(':source_id', schedule.summary_fields.unified_job_template.id.toString())
            .replace(':schedule_id', schedule.id.toString())
        : editRoute
            .replace(':id', schedule.summary_fields.unified_job_template.id.toString())
            .replace(':schedule_id', schedule.id.toString());
    },
    [jobTypeLabels]
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
        icon: PencilAltIcon,
        label: t(`Edit schedule`),
        isDisabled: (schedule) => cannotEditResource(schedule, t, canCreateSchedule),
        href: (schedule) => editUrl(schedule),
        isPinned: true,
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
    [deleteSchedule, handleToggleSchedule, canCreateSchedule, editUrl, t]
  );
  return rowActions;
}
