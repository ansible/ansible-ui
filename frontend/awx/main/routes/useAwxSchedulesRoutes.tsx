import { PageNavigationItem } from '@ansible/ansible-ui-framework';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Schedules } from '../../views/schedules/Schedules';
import { ScheduleAddWizard } from '../../views/schedules/wizard/ScheduleAddWizard';
import { AwxRoute } from '../AwxRoutes';

export function useAwxSchedulesRoutes() {
  const { t } = useTranslation();
  const schedulesRoutes = useMemo<PageNavigationItem>(
    () => ({
      id: AwxRoute.Schedules,
      label: t('Schedules'),
      path: 'schedules',
      children: [
        {
          id: AwxRoute.CreateSchedule,
          path: 'create',
          element: <ScheduleAddWizard isTopLevelSchedule />,
        },
        {
          path: '',
          element: <Schedules />,
        },
      ],
    }),
    [t]
  );
  return schedulesRoutes;
}
