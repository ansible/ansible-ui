import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PageNavigationItem } from '../../framework';
import { AwxRoute } from './AwxRoutes';
import { PageNotImplemented } from '../common/PageNotImplemented';

export function useGetAwxActivityStreamRoutes() {
  const { t } = useTranslation();
  const activityStreamRoutes = useMemo<PageNavigationItem>(
    () => ({
      id: AwxRoute.ActivityStream,
      label: t('Activity Stream'),
      path: 'activity-stream',
      element: <PageNotImplemented />,
    }),
    [t]
  );
  return activityStreamRoutes;
}
