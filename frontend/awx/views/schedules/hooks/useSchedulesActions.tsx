import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  useGetPageUrl,
} from '@ansible/ansible-ui-framework';
import { requestPatch } from '@ansible/common-ui/crud/Data';
import { useOptions } from '@ansible/common-ui/crud/useOptions';
import { cannotDeleteResource, cannotEditResource } from '@ansible/common-ui/utils/RBAChelpers';
import { ButtonVariant } from '@patternfly/react-core';
import { PencilAltIcon, TrashIcon } from '@patternfly/react-icons';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { awxAPI } from '../../../common/api/awx-utils';
import { ActionsResponse, OptionsResponse } from '../../../interfaces/OptionsResponse';
import { Schedule } from '../../../interfaces/Schedule';
import { schedulePageUrl } from '../types';
import { useDeleteSchedules } from './useDeleteSchedules';
import { useGetScheduleUrl } from './useGetScheduleUrl';

export function useSchedulesActions(options: {
  onScheduleDeleteCompleted: (schedules: Schedule[]) => void;
  onScheduleToggleCompleted: (schedule: Schedule) => void;
  sublistEndpoint?: string;
}) {
  const { t } = useTranslation();
  const deleteSchedule = useDeleteSchedules(options?.onScheduleDeleteCompleted);
  const { data } = useOptions<OptionsResponse<ActionsResponse>>(awxAPI`/schedules/`);
  const canCreateSchedule = Boolean(data && data.actions && data.actions['POST']);
  const handleToggleSchedule: (schedule: Schedule, enabled: boolean) => Promise<void> = useCallback(
    async (schedule, enabled) => {
      const patchedSchedule = await requestPatch<Schedule>(
        awxAPI`/schedules/${schedule.id.toString()}/`,
        { enabled }
      );
      options.onScheduleToggleCompleted(patchedSchedule);
    },
    [options]
  );

  const getPageUrl = useGetPageUrl();

  const getScheduleUrl = useGetScheduleUrl();

  const editHref = useCallback(
    (schedule: Schedule) => {
      const pageUrl = getScheduleUrl('edit', schedule) as schedulePageUrl;
      return getPageUrl(pageUrl.pageId, { params: pageUrl.params });
    },
    [getPageUrl, getScheduleUrl]
  );

  const rowActions = useMemo<IPageAction<Schedule>[]>(
    () => [
      {
        isPinned: true,
        ariaLabel: (isEnabled) =>
          isEnabled ? t('Click to disable schedule') : t('Click to enable schedule'),
        type: PageActionType.Switch,
        selection: PageActionSelection.Single,
        labelOff: t('Schedule disabled'),
        label: t('Schedule enabled'),
        isDisabled: (schedule) => cannotEditResource(schedule, t, canCreateSchedule),
        onToggle: (schedule, enabled) => handleToggleSchedule(schedule, enabled),
        isSwitchOn: (schedule) => schedule.enabled,
      },
      {
        type: PageActionType.Link,
        selection: PageActionSelection.Single,
        icon: PencilAltIcon,
        variant: ButtonVariant.primary,
        label: t(`Edit schedule`),
        isDisabled: (schedule) => cannotEditResource(schedule, t, canCreateSchedule),
        href: (schedule) => editHref(schedule),
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
    [t, canCreateSchedule, handleToggleSchedule, editHref, deleteSchedule]
  );
  return rowActions;
}
