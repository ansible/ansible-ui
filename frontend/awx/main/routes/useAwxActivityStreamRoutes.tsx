import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PageNavigationItem } from '../../../../framework';
import { PageNotImplemented } from '../../../../framework/PageEmptyStates/PageNotImplemented';
import { AwxRoute } from '../AwxRoutes';

export function useAwxActivityStreamRoutes() {
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
