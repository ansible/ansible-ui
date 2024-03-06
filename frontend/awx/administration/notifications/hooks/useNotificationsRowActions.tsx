import { CopyIcon, PencilAltIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  usePageNavigate,
} from '../../../../../framework';
import { NotificationTemplate } from '../../../interfaces/NotificationTemplate';
import { useDeleteNotifications } from './useDeleteNotifications';
import { useCopyNotification } from './useCopyNotification';
import { AwxRoute } from '../../../main/AwxRoutes';
import { cannotCopyResource, cannotEditResource } from '../../../../common/utils/RBAChelpers';

export function useNotificationsRowActions(
  onComplete: (notification: NotificationTemplate[]) => void,
  onNotificationCopied = () => null
) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const deleteNotifications = useDeleteNotifications(onComplete);
  const copyNotification = useCopyNotification(onNotificationCopied);

  return useMemo<IPageAction<NotificationTemplate>[]>(() => {
    return [
      // Edit form not yet implemented
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: PencilAltIcon,
        label: t(`Edit notification template`),
        onClick: (notification) =>
          pageNavigate(AwxRoute.EditNotificationTemplate, {
            params: { id: notification.id },
          }),
        isDisabled: (notification) => cannotEditResource(notification, t),
        isDanger: false,
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: CopyIcon,
        label: t(`Copy notification template`),
        onClick: (notification: NotificationTemplate) => copyNotification(notification),
        isDisabled: (notification) => cannotCopyResource(notification, t),
        isDanger: false,
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t(`Delete notification template`),
        onClick: (notification: NotificationTemplate) => deleteNotifications([notification]),
        isDanger: true,
      },
    ];
  }, [pageNavigate, copyNotification, deleteNotifications, t]);
}
