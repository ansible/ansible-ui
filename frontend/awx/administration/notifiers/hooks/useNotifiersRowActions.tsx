import { CopyIcon, PencilAltIcon, BellIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  usePageAlertToaster,
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
import { postRequest } from '../../../../common/crud/Data';
import { awxAPI } from '../../../common/api/awx-utils';
import { ButtonVariant } from '@patternfly/react-core';

export type RunningNotificationsType = { [key: string]: string };

export function useNotifiersRowActions(params: {
  onComplete?: (notification: NotificationTemplate[]) => void;
  onNotifierCopied?: () => void;
  onNotifierStartTest?: (template_id: string, notificationId: string) => void;
  type?: 'detail' | 'list';
  runningNotifications?: RunningNotificationsType;
}) {
  const { onComplete, onNotifierCopied, onNotifierStartTest, type, runningNotifications } = params;
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const deleteNotifiers = useDeleteNotifiers(onComplete || (() => {}));
  const copyNotifier = useCopyNotifier(onNotifierCopied || (() => {}));
  const alertToaster = usePageAlertToaster();

  return useMemo<IPageAction<NotificationTemplate>[]>(() => {
    return [
      // Edit form not yet implemented
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: PencilAltIcon,
        variant: ButtonVariant.primary,
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
        icon: BellIcon,
        label: t(`Test notifier`),
        isDisabled: (notification) => {
          const found = runningNotifications?.[notification.id];
          return found !== undefined ? t(`Disabled while test is running.`) : undefined;
        },
        onClick: (notification: NotificationTemplate) => {
          void (async () => {
            try {
              const result = await postRequest<{ id: number }>(
                awxAPI`/notification_templates/${notification.id.toString()}/test/`,
                {}
              );
              onNotifierStartTest?.(notification.id.toString(), result.id.toString());
            } catch (error) {
              alertToaster.addAlert({
                variant: 'danger',
                title: t('Failed to test notifier'),
                children: error instanceof Error && error.message,
              });
            }
          })();
        },
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
        isPinned: false,
        isHidden: () => type === 'detail',
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
  }, [
    pageNavigate,
    copyNotifier,
    deleteNotifiers,
    type,
    t,
    onNotifierStartTest,
    alertToaster,
    runningNotifications,
  ]);
}
