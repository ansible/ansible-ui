import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IPageAction, PageActionSelection, PageActionType } from '../../../../../../framework';
import { postRequest } from '../../../../../common/crud/Data';
import { awxAPI } from '../../../../common/api/awx-utils';
import { NotificationTemplate } from '../../../../interfaces/NotificationTemplate';

interface ToggleNotification {
  id: number;
  disassociate?: boolean;
}

interface NotificationActionProps {
  notificationStarted: Array<NotificationTemplate> | undefined;
  notificationStartedRefresh: () => undefined;
  notificationSuccess: Array<NotificationTemplate> | undefined;
  notificationSuccessRefresh: () => undefined;
  notificationError: Array<NotificationTemplate> | undefined;
  notificationErrorRefresh: () => undefined;
  resourceType: string;
  resourceId: string | undefined;
}

export function useNotificationActions({
  notificationStarted,
  notificationStartedRefresh,
  notificationSuccess,
  notificationSuccessRefresh,
  notificationError,
  notificationErrorRefresh,
  resourceType,
  resourceId,
}: NotificationActionProps) {
  const { t } = useTranslation();

  const toggleNotification = useCallback(
    async (id: number, disassociate: boolean, status: string) => {
      const postData: ToggleNotification = {
        id,
        disassociate: !disassociate,
      };
      if (disassociate) {
        delete postData['disassociate'];
      }
      await postRequest(
        awxAPI`/${resourceType}/${resourceId ?? ''}/notification_templates_${status}/`,
        postData
      );
      notificationStartedRefresh();
      notificationSuccessRefresh();
      notificationErrorRefresh();
    },
    [
      resourceId,
      resourceType,
      notificationStartedRefresh,
      notificationSuccessRefresh,
      notificationErrorRefresh,
    ]
  );

  const isNotificationDisabled = (
    notificationTemplate: NotificationTemplate,
    notifications: Array<NotificationTemplate> = []
  ) => {
    for (const notification of notifications) {
      if (notificationTemplate.id === notification.id) {
        return true;
      }
    }
    return false;
  };
  const rowActions = useMemo<IPageAction<NotificationTemplate>[]>(
    () => [
      {
        isPinned: true,
        ariaLabel: (isEnabled) =>
          isEnabled ? t('Click to disable schedule') : t('Click to enable schedule'),
        type: PageActionType.Switch,
        selection: PageActionSelection.Single,
        labelOff: t('Start'),
        label: t('Start'),
        onToggle: (notificationTemplate: NotificationTemplate, enable: boolean) =>
          toggleNotification(notificationTemplate.id, enable, 'started'),
        isSwitchOn: (notificationTemplate: NotificationTemplate) =>
          isNotificationDisabled(notificationTemplate, notificationStarted),
        showPinnedLabel: true,
        isReversed: true,
      },
      {
        isPinned: true,
        ariaLabel: (isEnabled) =>
          isEnabled ? t('Click to disable schedule') : t('Click to enable schedule'),
        type: PageActionType.Switch,
        selection: PageActionSelection.Single,
        labelOff: t('Success'),
        label: t('Success'),
        isSwitchOn: (notificationTemplate: NotificationTemplate) =>
          isNotificationDisabled(notificationTemplate, notificationSuccess),
        onToggle: (notificationTemplate: NotificationTemplate, enable: boolean) =>
          toggleNotification(notificationTemplate.id, enable, 'success'),
        showPinnedLabel: true,
      },
      {
        isPinned: true,
        ariaLabel: (isEnabled) =>
          isEnabled ? t('Click to disable schedule') : t('Click to enable schedule'),
        type: PageActionType.Switch,
        selection: PageActionSelection.Single,
        labelOff: t('Failure'),
        label: t('Failure'),
        isSwitchOn: (notificationTemplate: NotificationTemplate) =>
          isNotificationDisabled(notificationTemplate, notificationError),
        onToggle: (notificationTemplate: NotificationTemplate, enable: boolean) =>
          toggleNotification(notificationTemplate.id, enable, 'error'),
        showPinnedLabel: true,
      },
    ],
    [notificationStarted, notificationSuccess, notificationError, t, toggleNotification]
  );
  return rowActions;
}
