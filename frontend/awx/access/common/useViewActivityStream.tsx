import { HistoryIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { IPageAction, PageActionType } from '../../../../framework';
import { RouteObj } from '../../../Routes';

export function useViewActivityStream<T extends object>(type: string) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return useMemo<IPageAction<T>[]>(
    () => [
      {
        type: PageActionType.single,
        icon: HistoryIcon,
        label: t('View activity stream'),
        onClick: () => navigate(RouteObj.ActivityStream.replace(':type', type)),
      },
    ],
    [type, navigate, t]
  );
}
