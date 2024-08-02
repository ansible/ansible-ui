import {
  Drawer,
  DrawerCloseButton,
  DrawerContent,
  DrawerContentBody,
  DrawerPanelContent,
  EmptyState,
  EmptyStateBody,
  EmptyStateHeader,
  EmptyStateVariant,
  NotificationDrawer,
  NotificationDrawerBody,
  NotificationDrawerGroup,
  NotificationDrawerGroupList,
  NotificationDrawerHeader,
  NotificationDrawerList,
  NotificationDrawerListItem,
  NotificationDrawerListItemBody,
  NotificationDrawerListItemHeader,
} from '@patternfly/react-core';
import {
  Dispatch,
  ReactNode,
  SetStateAction,
  createContext,
  useContext,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

interface IPageNotifications {
  notificationsDrawerOpen: boolean;
  setNotificationsDrawerOpen: Dispatch<SetStateAction<boolean>>;
  notificationGroups: Record<string, IPageNotificationGroup>;
  setNotificationGroups: Dispatch<SetStateAction<Record<string, IPageNotificationGroup>>>;
}

export interface IPageNotificationGroup {
  title: string;
  notifications: IPageNotification[];
}

export interface IPageNotification {
  title: string;
  description?: string | undefined;
  timestamp?: string;
  variant?: 'success' | 'danger' | 'warning' | 'info';
  to: string;
}

export const PageNotificationsContext = createContext<IPageNotifications>({
  notificationsDrawerOpen: false,
  setNotificationsDrawerOpen: () => {
    throw new Error('PageNotificationsContext not implemented');
  },
  notificationGroups: {},
  setNotificationGroups: () => {
    throw new Error('PageNotificationsContext not implemented');
  },
});

export function usePageNotifications() {
  return useContext(PageNotificationsContext);
}

export function PageNotificationsProvider(props: { children: ReactNode }) {
  const [notificationsDrawerOpen, setNotificationsDrawerOpen] = useState(false);
  const [notificationGroups, setNotificationGroups] = useState<
    Record<string, IPageNotificationGroup>
  >({});
  return (
    <PageNotificationsContext.Provider
      value={{
        notificationGroups,
        setNotificationGroups,
        notificationsDrawerOpen,
        setNotificationsDrawerOpen,
      }}
    >
      {props.children}
    </PageNotificationsContext.Provider>
  );
}

export function PageNotificationsDrawer(props: { children: ReactNode }) {
  const { t } = useTranslation();

  const { notificationsDrawerOpen, setNotificationsDrawerOpen } = usePageNotifications();
  const drawerRef = useRef<HTMLSpanElement>(null);

  function onCloseClick() {
    setNotificationsDrawerOpen(false);
    drawerRef.current?.focus();
  }

  const { notificationGroups } = usePageNotifications();

  return (
    <Drawer isExpanded={notificationsDrawerOpen} onExpand={() => setNotificationsDrawerOpen(true)}>
      <DrawerContent
        panelContent={
          <DrawerPanelContent>
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
          </DrawerPanelContent>
        }
      >
        <DrawerContentBodyStyled>{props.children}</DrawerContentBodyStyled>
      </DrawerContent>
    </Drawer>
  );
}

const DrawerContentBodyStyled = styled(DrawerContentBody)`
  max-height: 100%;
`;

function PageNotificationGroup(props: { group: IPageNotificationGroup }) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(true);
  return (
    <NotificationDrawerGroup
      title={props.group.title}
      isExpanded={isExpanded}
      count={props.group.notifications.length}
      onExpand={(_, expand) => setIsExpanded(expand)}
    >
      <NotificationDrawerList isHidden={!isExpanded}>
        {props.group.notifications.map((notification, index) => (
          <PageNotification key={index} notification={notification} />
        ))}
        {props.group.notifications.length === 0 && (
          <EmptyState variant={EmptyStateVariant.full}>
            <EmptyStateHeader headingLevel="h2" titleText={t('No notifications')} />
            <EmptyStateBody>{t('There are currently no notifications.')}</EmptyStateBody>
          </EmptyState>
        )}
      </NotificationDrawerList>
    </NotificationDrawerGroup>
  );
}

function PageNotification(props: { notification: IPageNotification }) {
  const notificationVariant =
    props.notification.variant === 'info' ? undefined : props.notification.variant;
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
        setNotificationsDrawerOpen(false);
      }}
    >
      <Link
        to={props.notification.to}
        target={props.notification.openInNewWindow ? '_blank' : undefined}
      >
        <NotificationDrawerListItemHeader
          title={props.notification.title}
          variant={notificationVariant}
        />
        <NotificationDrawerListItemBody timestamp={timestampString}>
          {props.notification.description}
        </NotificationDrawerListItemBody>
      </Link>
    </NotificationDrawerListItem>
  );
}
