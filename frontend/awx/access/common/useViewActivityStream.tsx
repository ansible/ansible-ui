import { HistoryIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
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
  return useMemo<IPageAction<T>[]>(() => {
    return [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: HistoryIcon,
        label: t('View activity stream'),
        onClick: () => pageNavigate(AwxRoute.ActivityStream, { query: { type: queryType } }),
      },
      { type: PageActionType.Seperator },
    ];
  }, [pageNavigate, queryType, t]);
}
