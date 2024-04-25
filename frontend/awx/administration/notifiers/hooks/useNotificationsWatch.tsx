import { useState } from "react";
import { RunningNotificationsType } from './useNotifiersRowActions';

export function useNotificationsWatch()
{
      // key:value = notification_template_id:notification_id
  const [runningNotifications, setRunningNotifications] = useState<RunningNotificationsType>({});


  return {
    runningNotifications,
    setRunningNotifications,
    onNotifierStartTest : (template_id: string, notificationId: string) => {
        const obj = { ...runningNotifications };
        obj[template_id] = notificationId;
        setRunningNotifications(obj);
      },
  }
}