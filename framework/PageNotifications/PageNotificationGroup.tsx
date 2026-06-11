import {
  EmptyState,
  EmptyStateBody,
  EmptyStateVariant,
  NotificationDrawerGroup,
  NotificationDrawerList,
} from '@patternfly/react-core';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IPageNotification, PageNotification } from './PageNotification';
import { usePageNotificationsRead } from './usePageNotificationsRead';

export interface IPageNotificationGroup {
  title: string;
  notifications: IPageNotification[];
}

export function PageNotificationGroup(props: { group: IPageNotificationGroup }) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(() => {
    return localStorage.getItem(`notifications-group-${props.group.title}`) === 'true';
  });
  useEffect(() => {
    localStorage.setItem(`notifications-group-${props.group.title}`, String(isExpanded));
  }, [isExpanded, props.group.title]);
  const { isNotificationRead } = usePageNotificationsRead();
  const allRead = props.group.notifications.every((notification) =>
    isNotificationRead(notification.id)
  );
  return (
    <NotificationDrawerGroup
      title={props.group.title}
      isExpanded={isExpanded}
      count={props.group.notifications.length}
      onExpand={(_, expand) => setIsExpanded(expand)}
      isRead={allRead}
    >
      <NotificationDrawerList isHidden={!isExpanded}>
        {props.group.notifications.map((notification, index) => (
          <PageNotification key={index} notification={notification} />
        ))}
        {props.group.notifications.length === 0 && (
          <EmptyState
            headingLevel="h2"
            titleText={t('No notifications')}
            variant={EmptyStateVariant.full}
          >
            <EmptyStateBody>{t('There are currently no notifications.')}</EmptyStateBody>
          </EmptyState>
        )}
      </NotificationDrawerList>
    </NotificationDrawerGroup>
  );
}
