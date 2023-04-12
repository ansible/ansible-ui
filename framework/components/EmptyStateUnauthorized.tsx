import React from 'react';
import { LockIcon } from '@patternfly/react-icons';
import { EmptyStateCustom } from './EmptyStateCustom';

export function EmptyStateUnauthorized(props: {
  adminMessage?: string;
  loginLink?: React.ReactNode;
  title?: string;
}) {
  const defaultAdminMessage = 'Contact your organization administrator for more information.';
  const defaultTitle = 'You do not have access';

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
