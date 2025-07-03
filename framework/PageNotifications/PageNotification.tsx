import {
  NotificationDrawerListItem,
  NotificationDrawerListItemBody,
  NotificationDrawerListItemHeader,
} from '@patternfly/react-core';
import { usePageNotifications } from './usePageNotifications';
import { useNavigate } from 'react-router';

export interface IPageNotification {
  title: string;
  description?: string | undefined;
  timestamp?: string;
  variant?: 'success' | 'danger' | 'warning' | 'info';
  to: string;
}

export function PageNotification(props: { notification: IPageNotification }) {
  const notificationVariant =
    props.notification.variant === 'info' ? undefined : props.notification.variant;
  const navigate = useNavigate();
  const { setNotificationsDrawerOpen } = usePageNotifications();
  const timestamp = props.notification.timestamp
    ? new Date(props.notification.timestamp)
    : undefined;
  const timestampString = timestamp
    ? `${timestamp.toLocaleDateString()} ${timestamp.toLocaleTimeString()}`
    : undefined;
  return (
    <NotificationDrawerListItem
      variant={props.notification.variant}
      onClick={() => {
        void navigate(props.notification.to);
        setNotificationsDrawerOpen(() => false);
      }}
    >
      <NotificationDrawerListItemHeader
        title={props.notification.title}
        variant={notificationVariant}
      />
      <NotificationDrawerListItemBody timestamp={timestampString}>
        {props.notification.description}
      </NotificationDrawerListItemBody>
    </NotificationDrawerListItem>
  );
}
