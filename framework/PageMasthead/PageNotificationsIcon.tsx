import { NotificationBadge } from '@patternfly/react-core';

export function PageNotificationsIcon(props: { count: number; onClick: () => void }) {
  return (
    <NotificationBadge
      data-cy="notification-badge"
      variant={props.count === 0 ? 'read' : 'unread'}
      count={props.count}
      onClick={() => props.onClick()}
    />
  );
}
