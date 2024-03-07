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
import { cannotDeleteResources } from '../../../../common/utils/RBAChelpers';
import { useOptions } from '../../../../common/crud/useOptions';
import { ActionsResponse, OptionsResponse } from '../../../interfaces/OptionsResponse';
import { awxAPI } from '../../../common/api/awx-utils';

export function useNotificationsToolbarActions(
  onComplete: (notification: NotificationTemplate[]) => void
) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const deleteNotifications = useDeleteNotifications(onComplete);

  const notificationsOptions = useOptions<OptionsResponse<ActionsResponse>>(
    awxAPI`/notification_templates/`
  ).data;
  const canAddNotificationTemplate = Boolean(
    notificationsOptions && notificationsOptions.actions && notificationsOptions.actions['POST']
  );

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
        isDisabled: () =>
          canAddNotificationTemplate
            ? undefined
            : t(
                `You do not have permission to add notification templates. Please contact your organization administrator if there is an issue with your access.`
              ),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: TrashIcon,
        label: t('Delete selected notifications'),
        onClick: deleteNotifications,
        isDisabled: (notification) => cannotDeleteResources(notification, t),
        isDanger: true,
      },
    ],
    [canAddNotificationTemplate, pageNavigate, deleteNotifications, t]
  );
}
