import { useState } from "react";
import { RunningNotificationsType } from './useNotifiersRowActions';
import { NotificationTemplate } from "../../../interfaces/NotificationTemplate";
import { usePageAlertToaster } from "../../../../../framework";
import { StatusLabel } from "../../../../common/Status";
import { useTranslation } from "react-i18next";

export function useNotificationsWatch(type : 'detail' | 'list')
{
      // key:value = notification_template_id:notification_id
  const [runningNotifications, setRunningNotifications] = useState<RunningNotificationsType>({});
  const alertToaster = usePageAlertToaster();
  const { t } = useTranslation();

  return {
    runningNotifications,
    setRunningNotifications,
    onNotifierStartTest : (template_id: string, notificationId: string) => {
        const obj = { ...runningNotifications };
        obj[template_id] = notificationId;
        setRunningNotifications(obj);
      },
    checkNotifiers : (notificationTemplate : NotificationTemplate) => 
    {
        // search for notification id
        const notificationId = runningNotifications[notificationTemplate.id.toString()];
        const notifications = notificationTemplate.summary_fields?.recent_notifications;
        const notification = notifications.find(
          (notification) => notification.id.toString() === notificationId
        );
       
        if (notification && notification.status !== 'pending') {
        if (type === 'detail')
        {
          alertToaster.addAlert({
            variant: 'info',
            title: t('Notifier (id {{id}}) test result', { id: notificationId }),
            children: <StatusLabel status={notification.status} />,
          });
        }
          const obj = { ...runningNotifications };
          delete obj[notificationTemplate.id];
          setRunningNotifications(obj);
        }
    }
  }
}