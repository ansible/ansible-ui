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

export function useViewActivityStream<T extends object>(type: string) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  return useMemo<IPageAction<T>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: HistoryIcon,
        label: t('View activity stream'),
        onClick: () => pageNavigate(AwxRoute.ActivityStream, { params: { type } }),
      },
    ],
    [type, pageNavigate, t]
  );
}
