import { NotificationBadge } from '@patternfly/react-core';
import { IPageNotification } from '../PageNotifications/PageNotification';
import { usePageNotifications } from '../PageNotifications/usePageNotifications';
import { usePageNotificationsRead } from '../PageNotifications/usePageNotificationsRead';

export function PageNotificationsIcon() {
  const { setNotificationsDrawerOpen, notificationGroups } = usePageNotifications();
  const { isNotificationRead } = usePageNotificationsRead();

  const unreadCount = Object.values(notificationGroups).reduce((count, group) => {
    const unreadNotifications = group.notifications.filter((notification: IPageNotification) => {
      if (typeof notification.id !== 'string') return false;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      return !isNotificationRead(notification.id);
    });
    return count + unreadNotifications.length;
  }, 0);

  return (
    <NotificationBadge
      data-cy="notification-badge"
      data-testid="notification-badge"
      variant={unreadCount === 0 ? 'read' : 'unread'}
      count={unreadCount}
      onClick={() => setNotificationsDrawerOpen((open) => !open)}
    />
  );
}
