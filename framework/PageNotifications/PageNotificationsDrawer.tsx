import {
  DrawerCloseButton,
  NotificationDrawer,
  NotificationDrawerBody,
  NotificationDrawerGroupList,
  NotificationDrawerHeader,
} from '@patternfly/react-core';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { PageNotificationGroup } from './PageNotificationGroup';
import { usePageNotifications } from './usePageNotifications';

export function PageNotificationsDrawer() {
  const { t } = useTranslation();

  const { setNotificationsDrawerOpen } = usePageNotifications();
  const drawerRef = useRef<HTMLSpanElement>(null);

  function onCloseClick() {
    setNotificationsDrawerOpen(() => false);
    drawerRef.current?.focus();
  }

  const { notificationGroups } = usePageNotifications();

  return (
    <NotificationDrawer data-cy="notifications-drawer">
      <NotificationDrawerHeader title={t('Notifications')}>
        <DrawerCloseButton onClick={onCloseClick} />
      </NotificationDrawerHeader>
      <NotificationDrawerBody>
        <NotificationDrawerGroupList>
          {Object.values(notificationGroups).map((group, index) => (
            <PageNotificationGroup key={index} group={group} />
          ))}
        </NotificationDrawerGroupList>
      </NotificationDrawerBody>
    </NotificationDrawer>
  );
}
