import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PageNavigationItem } from '../../../../framework';
import { AwxRoute } from '../AwxRoutes';
import { ActivityStreams } from '../../administration/activity-stream/ActivityStream';

export function useAwxActivityStreamRoutes() {
  const { t } = useTranslation();
  const activityStreamRoutes = useMemo<PageNavigationItem>(
    () => ({
      id: AwxRoute.ActivityStream,
      label: t('Activity Stream'),
      path: 'activity-stream',
      element: <ActivityStreams />,
    }),
    [t]
  );
  return activityStreamRoutes;
}
