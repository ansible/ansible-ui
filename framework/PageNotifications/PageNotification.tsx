import {
  Dropdown,
  DropdownItem,
  DropdownList,
  MenuToggle,
  MenuToggleElement,
  NotificationDrawerListItem,
  NotificationDrawerListItemBody,
  NotificationDrawerListItemHeader,
} from '@patternfly/react-core';
import { EllipsisVIcon } from '@patternfly/react-icons';
import { ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { usePageNotifications } from './usePageNotifications';
import { usePageNotificationsRead } from './usePageNotificationsRead';

export interface IPageNotification {
  /** Unique identifier for the notification - used for tracking and managing notification read state */
  id: string;
  title: string;
  description?: ReactNode | undefined;
  timestamp?: string;
  variant?: 'success' | 'danger' | 'warning' | 'info';
  to?: string;
  newTab?: boolean;
}

export function PageNotification(props: { notification: IPageNotification }) {
  const { t } = useTranslation();
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
  const { isNotificationRead, setNotificationRead } = usePageNotificationsRead();
  const [isMenuOpen, setMenuOpen] = useState(false);
  return (
    <NotificationDrawerListItem
      variant={props.notification.variant}
      onClick={(event: React.MouseEvent) => {
        // Check if the clicked element is a link or inside a link
        const target = event.target as HTMLElement;
        const closestLink = target.closest('a');

        // If a link was clicked, open it in a new window and don't perform default notification behavior
        if (closestLink) {
          event.preventDefault();
          if (closestLink.href) {
            window.open(closestLink.href, '_blank', 'noopener,noreferrer');
          }
          return;
        }

        setNotificationRead(props.notification.id, true);
        if (props.notification.to) {
          if (props.notification.newTab) {
            window.open(props.notification.to, '_blank');
          } else {
            void navigate(props.notification.to);
          }
        }
        setNotificationsDrawerOpen(() => false);
      }}
      isRead={isNotificationRead(props.notification.id)}
      isHoverable={props.notification.to !== undefined}
    >
      <NotificationDrawerListItemHeader
        title={props.notification.title}
        variant={notificationVariant}
      >
        <Dropdown
          isOpen={isMenuOpen}
          onOpenChange={() => setMenuOpen((v) => !v)}
          popperProps={{ position: 'right' }}
          toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
            <MenuToggle
              ref={toggleRef}
              isExpanded={isMenuOpen}
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen((v) => !v);
              }}
              variant="plain"
              icon={<EllipsisVIcon />}
            />
          )}
        >
          <DropdownList>
            <DropdownItem
              onClick={(e: Event) => {
                e?.stopPropagation();
                setNotificationRead(props.notification.id, true);
                setMenuOpen(false);
              }}
            >
              {t('Mark read')}
            </DropdownItem>
            <DropdownItem
              onClick={(e: Event) => {
                e?.stopPropagation();
                setNotificationRead(props.notification.id, false);
                setMenuOpen(false);
              }}
            >
              {t('Mark unread')}
            </DropdownItem>
          </DropdownList>
        </Dropdown>
      </NotificationDrawerListItemHeader>
      <NotificationDrawerListItemBody timestamp={timestampString}>
        {props.notification.description}
      </NotificationDrawerListItemBody>
    </NotificationDrawerListItem>
  );
}
