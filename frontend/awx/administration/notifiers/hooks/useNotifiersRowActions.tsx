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
import { useDeleteNotifiers } from './useDeleteNotifiers';
import { useCopyNotifier } from './useCopyNotifier';
import { AwxRoute } from '../../../main/AwxRoutes';
import {
  cannotCopyResource,
  cannotDeleteResource,
  cannotEditResource,
} from '../../../../common/utils/RBAChelpers';

export function useNotifiersRowActions(
  onComplete: (notification: NotificationTemplate[]) => void,
  onNotifierCopied = () => null
) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const deleteNotifiers = useDeleteNotifiers(onComplete);
  const copyNotifier = useCopyNotifier(onNotifierCopied);

  return useMemo<IPageAction<NotificationTemplate>[]>(() => {
    return [
      // Edit form not yet implemented
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: PencilAltIcon,
        label: t(`Edit notifier`),
        onClick: (notification) =>
          pageNavigate(AwxRoute.EditNotificationTemplate, {
            params: { id: notification.id },
          }),
        isDisabled: (notification) => cannotEditResource(notification, t),
        isDanger: false,
        isPinned: true,
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: CopyIcon,
        label: t(`Copy notifier`),
        onClick: (notification: NotificationTemplate) => copyNotifier(notification),
        isDisabled: (notification) => cannotCopyResource(notification, t),
        isDanger: false,
        isPinned: true,
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t(`Delete notifier`),
        onClick: (notification: NotificationTemplate) => deleteNotifiers([notification]),
        isDisabled: (notification) => cannotDeleteResource(notification, t),
        isDanger: true,
      },
    ];
  }, [pageNavigate, copyNotifier, deleteNotifiers, t]);
}
