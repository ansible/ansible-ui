import React from 'react';
import { Banner } from '@patternfly/react-core';
import useSWR from 'swr';
import { requestGet } from '../../../common/crud/Data';
import { useTranslation } from 'react-i18next';

export interface NotificationsResponse {
  notifications: {
    name: string;
    text: string;
    severity: string;
  }[];
  count: number;
}

const NotificationsBanner = () => {
  const { t } = useTranslation();

  const { data, error } = useSWR<NotificationsResponse, Error>(
    `/api/v2/analytics/notifications/`,
    requestGet
  );

  function getVariant(severity: string) {
    switch (severity) {
      case 'danger':
        return 'red';
      case 'warning':
        return 'gold';
      case 'success':
        return 'green';
      case 'info':
        return 'blue';
      default:
        return 'default';
    }
  }
  if (error) {
    return (
      <Banner variant={'gold'}>
        {t('Something went wrong when getting notifications from console.redhat.com')}
      </Banner>
    );
  }
  return (
    <>
      {data &&
        data?.notifications.map((notification, index) => {
          if (index < 5) {
            return (
              <Banner key={index} variant={getVariant(notification.severity)}>
                {notification.text}
              </Banner>
            );
          }
        })}
    </>
  );
};

export default NotificationsBanner;
