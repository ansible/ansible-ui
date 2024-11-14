import { PageNavigationItem } from '@ansible/ansible-ui-framework';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityStreams } from '../../administration/activity-stream/ActivityStream';
import { AwxRoute } from '../AwxRoutes';

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
