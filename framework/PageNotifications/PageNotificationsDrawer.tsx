import {
  Dropdown,
  DropdownItem,
  DropdownList,
  MenuToggle,
  MenuToggleElement,
  NotificationDrawer,
  NotificationDrawerBody,
  NotificationDrawerGroupList,
  NotificationDrawerHeader,
} from '@patternfly/react-core';
import { EllipsisVIcon } from '@patternfly/react-icons';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PageNotificationGroup } from './PageNotificationGroup';
import { usePageNotifications } from './usePageNotifications';
import { usePageNotificationsRead } from './usePageNotificationsRead';

export function PageNotificationsDrawer() {
  const { t } = useTranslation();

  const { setNotificationsDrawerOpen } = usePageNotifications();
  const drawerRef = useRef<HTMLSpanElement>(null);

  function onCloseClick() {
    setNotificationsDrawerOpen(() => false);
    drawerRef.current?.focus();
  }

  const { notificationGroups } = usePageNotifications();
  const { markAllNotificationsUnread, markAllNotificationsRead } = usePageNotificationsRead();

  const [isDrawerMenuOpen, setDrawerMenuOpen] = useState(false);

  return (
    <NotificationDrawer data-cy="notifications-drawer" data-testid="notifications-drawer">
      <NotificationDrawerHeader title={t('Notifications')} onClose={onCloseClick}>
        <Dropdown
          isOpen={isDrawerMenuOpen}
          onOpenChange={() => setDrawerMenuOpen((v) => !v)}
          popperProps={{ position: 'right' }}
          toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
            <MenuToggle
              ref={toggleRef}
              isExpanded={isDrawerMenuOpen}
              onClick={() => setDrawerMenuOpen((v) => !v)}
              variant="plain"
              aria-label={t('Toggle notifications menu')}
              icon={<EllipsisVIcon />}
            />
          )}
        >
          <DropdownList>
            <DropdownItem
              onClick={() => {
                markAllNotificationsRead();
                setDrawerMenuOpen(false);
              }}
            >
              {t('Mark all read')}
            </DropdownItem>
            <DropdownItem
              onClick={() => {
                setDrawerMenuOpen(false);
                markAllNotificationsUnread();
              }}
            >
              {t('Mark none read')}
            </DropdownItem>
          </DropdownList>
        </Dropdown>
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
