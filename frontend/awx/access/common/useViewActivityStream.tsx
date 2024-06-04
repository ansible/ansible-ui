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
import { useAwxConfig } from '../../common/useAwxConfig';
import { useLocation } from 'react-router-dom';
const topLevelPath = ['administration', 'analytics', 'infrastructure', 'access', 'settings'];
export function useViewActivityStream<T extends object>() {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const config = useAwxConfig();
  const location = useLocation();
  const firstURLItems = location.pathname.split('/')[1];
  const secondURLItems = location.pathname.split('/')[2];
  const isSchedule = location.pathname.split('/').includes('schedules');

  const pathIdentifier = isSchedule
    ? 'schedules'
    : topLevelPath.includes(firstURLItems)
      ? secondURLItems
      : firstURLItems;
  let type: string;

  switch (pathIdentifier) {
    case 'inventories':
      type = 'inventory';
      break;
    case 'schedules':
      type = 'schedule';
      break;
    case 'applications':
      type = 'o_auth2_application';
      break;
    case 'notifiers':
      type = 'notification_template';
      break;
    case 'credential-types':
      type = 'credential_type';
      break;
    case 'instance-groups':
      type = 'instance_group';
      break;
    default:
      type = pathIdentifier.slice(0, -1);
      break;
  }
  return useMemo<IPageAction<T>[] | []>(() => {
    if (config?.license_info.product_name !== 'AWX') return [];
    return [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: HistoryIcon,
        label: t('View activity stream'),
        onClick: () => pageNavigate(AwxRoute.ActivityStream, { query: { type } }),
      },
      { type: PageActionType.Seperator },
    ];
  }, [type, pageNavigate, t, config?.license_info.product_name]);
}
