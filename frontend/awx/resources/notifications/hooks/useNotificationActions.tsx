import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IPageAction, PageActionSelection, PageActionType } from '../../../../../framework';
import { awxAPI } from '../../../common/api/awx-utils';
import { NotificationTemplate } from '../../../interfaces/NotificationTemplate';
import { postRequest } from '../../../../common/crud/Data';

interface ToggleNotification {
  id: number;
  disassociate?: boolean;
}

interface NotificationActionProps {
  notificationApproval: Array<NotificationTemplate> | undefined;
  notificationApprovalRefresh: () => undefined;
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
  notificationApproval,
  notificationApprovalRefresh,
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
      notificationApprovalRefresh();
      notificationStartedRefresh();
      notificationSuccessRefresh();
      notificationErrorRefresh();
    },
    [
      resourceType,
      resourceId,
      notificationApprovalRefresh,
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

  const rowActions = useMemo<IPageAction<NotificationTemplate>[]>(() => {
    const createNotificationAction = (
      notificationType: string,
      label: string,
      status: string,
      notifications?: Array<NotificationTemplate>
    ): IPageAction<NotificationTemplate> => {
      return {
        isPinned: true,
        ariaLabel: (isEnabled) =>
          isEnabled
            ? t(`Click to disable ${notificationType}`)
            : t(`Click to enable ${notificationType}`),
        type: PageActionType.Switch,
        selection: PageActionSelection.Single,
        labelOff: t(label),
        label: t(label),
        onToggle: (notificationTemplate: NotificationTemplate, enable: boolean) =>
          toggleNotification(notificationTemplate.id, enable, status),
        isSwitchOn: (notificationTemplate: NotificationTemplate) =>
          isNotificationDisabled(notificationTemplate, notifications),
        showPinnedLabel: true,
        isReversed: true,
      };
    };
    const notificationArray = [
      createNotificationAction('start', 'Start', 'started', notificationStarted),
      createNotificationAction('success', 'Success', 'success', notificationSuccess),
      createNotificationAction('failure', 'Failure', 'error', notificationError),
    ];

    if (resourceType === 'organizations') {
      notificationArray.unshift(
        createNotificationAction('approval', 'Apply', 'approvals', notificationApproval)
      );
    }
    return notificationArray;
  }, [
    notificationStarted,
    notificationSuccess,
    notificationError,
    resourceType,
    t,
    toggleNotification,
    notificationApproval,
  ]);
  return rowActions;
}
