import { PlusIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  usePageNavigate,
} from '../../../../../framework';
import { useDeleteNotifications } from './useDeleteNotifications';
import { NotificationTemplate } from '../../../interfaces/NotificationTemplate';
import { ButtonVariant } from '@patternfly/react-core';
import { AwxRoute } from '../../../main/AwxRoutes';

export function useNotificationsToolbarActions(
  onComplete: (notification: NotificationTemplate[]) => void
) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const deleteNotifications = useDeleteNotifications(onComplete);

  return useMemo<IPageAction<NotificationTemplate>[]>(
    () => [
      // Add form not yet implemented
      {
        type: PageActionType.Button,
        selection: PageActionSelection.None,
        variant: ButtonVariant.primary,
        isPinned: true,
        icon: PlusIcon,
        label: t('Add notification template'),
        onClick: () => pageNavigate(AwxRoute.AddNotificationTemplate),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: TrashIcon,
        label: t('Delete selected notifications'),
        onClick: deleteNotifications,
        isDanger: true,
      },
    ],
    [pageNavigate, deleteNotifications, t]
  );
}
