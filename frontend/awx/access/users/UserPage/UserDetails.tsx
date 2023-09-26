/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { PageDetail, PageDetails, DateTimeCell } from '../../../../../framework';
import { User } from '../../../interfaces/User';
import { useGetItem } from '../../../../common/crud/useGet';
import { AuthenticationType } from '../components/AuthenticationType';
import { UserType } from '../components/UserType';

export function UserDetails() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const { data: user } = useGetItem<User>('/api/v2/users', params.id);

  if (!user) {
    return null;
  }

  return (
    <>
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
          <DateTimeCell format="since" value={user.created} />
        </PageDetail>
        <PageDetail label={t('Modified')}>
          <DateTimeCell format="since" value={user.modified} />
        </PageDetail>
        <PageDetail label={t('Last login')}>
          <DateTimeCell format="since" value={user.last_login} />
        </PageDetail>
      </PageDetails>
    </>
  );
}
