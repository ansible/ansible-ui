import { HistoryIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  usePageNavigate,
} from '../../../../framework';
import { AwxRoute } from '../../main/AwxRoutes';
export function useViewActivityStream<T extends object>(queryType: string) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();

  const query = { query: { type: queryType } };

  // Filtering by resource id, like host__id=2, instance__id=5, etc.
  const params = useParams<{ id: string }>();
  if (/^\d+$/.test(params.id)) {
    query['query'][`${queryType}__id`] = params.id;
  }

  return useMemo<IPageAction<T>[]>(() => {
    return [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: HistoryIcon,
        label: t('View activity stream'),
        onClick: () => pageNavigate(AwxRoute.ActivityStream, query),
      },
      { type: PageActionType.Seperator },
    ];
  }, [pageNavigate, query, t]);
}
