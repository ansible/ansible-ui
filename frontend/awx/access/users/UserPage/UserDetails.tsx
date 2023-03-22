/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Alert } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { PageDetail, PageDetails, SinceCell } from '../../../../../framework';
import { User } from '../../../interfaces/User';
import { AuthenticationType } from '../components/AuthenticationType';
import { UserType } from '../components/UserType';

export function UserDetails(props: { user: User }) {
  const { t } = useTranslation();
  const { user } = props;

  return (
    <>
      {user.is_superuser && (
        <Alert
          variant="info"
          title={t('System administrators have unrestricted access to all resources.')}
          isInline
          style={{ border: 0 }}
        />
      )}
      <PageDetails>
        <PageDetail label={t('Username')}>{user.username}</PageDetail>
        <PageDetail label={t('First name')}>{user.first_name}</PageDetail>
        <PageDetail label={t('Last name')}>{user.last_name}</PageDetail>
        <PageDetail label={t('Email')}>{user.email}</PageDetail>
        <PageDetail label={t('User type')}>
          <UserType user={user} />
        </PageDetail>
        <PageDetail label={t('Authentication type')}>
          <AuthenticationType user={user} />
        </PageDetail>
        <PageDetail label={t('Created')}>
          <SinceCell value={user.created} />
        </PageDetail>
        <PageDetail label={t('Modified')}>
          <SinceCell value={user.modified} />
        </PageDetail>
        <PageDetail label={t('Last login')}>
          <SinceCell value={user.last_login} />
        </PageDetail>
      </PageDetails>
    </>
  );
}
