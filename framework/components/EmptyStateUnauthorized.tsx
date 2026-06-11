import { LockIcon } from '@patternfly/react-icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { EmptyStateCustom } from './EmptyStateCustom';

export function EmptyStateUnauthorized(props: {
  adminMessage?: string;
  loginLink?: React.ReactNode;
  title?: string;
}) {
  const { t } = useTranslation();
  const defaultAdminMessage = t('Contact your organization administrator for more information.');
  const defaultTitle = t('You do not have access');

  const { adminMessage, loginLink, title } = props;

  return (
    <EmptyStateCustom
      icon={LockIcon}
      title={title || defaultTitle}
      description={
        <>
          {adminMessage || defaultAdminMessage}
          <br />
          <br />
          {loginLink}
        </>
      }
    />
  );
}
