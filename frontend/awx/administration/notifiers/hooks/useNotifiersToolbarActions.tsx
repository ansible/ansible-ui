import { PlusCircleIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  usePageNavigate,
} from '../../../../../framework';
import { useDeleteNotifiers } from './useDeleteNotifiers';
import { NotificationTemplate } from '../../../interfaces/NotificationTemplate';
import { ButtonVariant } from '@patternfly/react-core';
import { AwxRoute } from '../../../main/AwxRoutes';
import { cannotDeleteResources } from '../../../../common/utils/RBAChelpers';
import { useOptions } from '../../../../common/crud/useOptions';
import { ActionsResponse, OptionsResponse } from '../../../interfaces/OptionsResponse';
import { awxAPI } from '../../../common/api/awx-utils';

export function useNotifiersToolbarActions(
  onComplete: (notification: NotificationTemplate[]) => void
) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const deleteNotifiers = useDeleteNotifiers(onComplete);

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
        icon: PlusCircleIcon,
        label: t('Create notifier'),
        onClick: () => pageNavigate(AwxRoute.AddNotificationTemplate),
        isDisabled: () =>
          canAddNotificationTemplate
            ? undefined
            : t(
                `You do not have permission to add notifiers. Please contact your organization administrator if there is an issue with your access.`
              ),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: TrashIcon,
        label: t('Delete notifiers'),
        onClick: deleteNotifiers,
        isDisabled: (notification) => cannotDeleteResources(notification, t),
        isDanger: true,
      },
    ],
    [canAddNotificationTemplate, pageNavigate, deleteNotifiers, t]
  );
}
