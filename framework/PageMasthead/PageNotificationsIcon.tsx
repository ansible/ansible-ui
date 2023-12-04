import { NotificationBadge } from '@patternfly/react-core';
import { usePageNotifications } from '../PageNotifications/PageNotificationsProvider';

export function PageNotificationsIcon() {
  const { setNotificationsDrawerOpen, notificationGroups } = usePageNotifications();

  const count = Object.values(notificationGroups).reduce(
    (count, group) => count + group.notifications.length,
    0
  );

  return (
    <NotificationBadge
      data-cy="notification-badge"
      variant={count === 0 ? 'read' : 'unread'}
      count={count}
      onClick={() => setNotificationsDrawerOpen((open) => !open)}
    />
  );
}
