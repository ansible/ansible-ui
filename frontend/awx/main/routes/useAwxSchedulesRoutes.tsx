import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PageNavigationItem } from '../../../../framework';
import { ScheduleAddWizard } from '../../views/schedules/wizard/ScheduleAddWizard';
import { Schedules } from '../../views/schedules/Schedules';
import { AwxRoute } from '../AwxRoutes';
import { ScheduleEditWizard } from '../../views/schedules/wizard/ScheduleEditWizard';

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
          element: <ScheduleAddWizard />,
        },
        {
          id: AwxRoute.EditSchedule,
          path: ':schedule_id/edit',
          element: <ScheduleEditWizard />,
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
