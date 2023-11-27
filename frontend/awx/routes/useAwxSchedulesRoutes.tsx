import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PageNavigationItem } from '../../../framework';
import { AwxRoute } from '../AwxRoutes';
import { CreateSchedule } from '../views/schedules/ScheduleForm';
import { Schedules } from '../views/schedules/Schedules';

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
          element: <CreateSchedule />,
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
