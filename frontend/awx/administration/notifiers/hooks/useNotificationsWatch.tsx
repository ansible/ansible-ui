import { useState } from 'react';
import { RunningNotificationsType } from './useNotifiersRowActions';
import { NotificationTemplate } from '../../../interfaces/NotificationTemplate';
import { usePageAlertToaster } from '../../../../../framework';
import { useTranslation } from 'react-i18next';

export function useNotificationsWatch() {
  // key:value = notification_template_id:notification_id
  const [runningNotifications, setRunningNotifications] = useState<RunningNotificationsType>({});
  const alertToaster = usePageAlertToaster();
  const { t } = useTranslation();

  return {
    runningNotifications,
    setRunningNotifications,
    onNotifierStartTest: (template_id: string, notificationId: string) => {
      const obj = { ...runningNotifications };
      obj[template_id] = notificationId;
      setRunningNotifications(obj);
    },
    checkNotifiers: (notificationsTemplate: NotificationTemplate[]) => {
      if (!notificationsTemplate) {
        return;
      }

      const obj = { ...runningNotifications };
      notificationsTemplate.forEach((notificationTemplate) => {
        // search for notification id
        const notificationId = runningNotifications[notificationTemplate.id.toString()];
        const notifications = notificationTemplate.summary_fields?.recent_notifications;
        const notification = notifications.find(
          (notification) => notification.id.toString() === notificationId
        );

        if (notification && notification.status !== 'pending') {
          alertToaster.addAlert({
            variant: notification.status === 'failed' ? 'danger' : 'success',
            title: t('{{name}} (id {{id}})', {
              name: notificationTemplate.name,
              id: notificationId,
            }),
            children: <div>{notification.error}</div>,
          });

          delete obj[notificationTemplate.id];
        }
      });
      setRunningNotifications(obj);
    },
  };
}
