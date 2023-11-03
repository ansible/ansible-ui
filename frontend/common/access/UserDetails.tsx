import { useTranslation } from 'react-i18next';
import { DateTimeCell, LabelsCell, PageDetail, PageDetails } from '../../../framework';
import { UserType } from '../../awx/access/users/components/UserType';
import { AuthenticationType } from '../../awx/access/users/components/AuthenticationType';
import { RoleRef } from '../../eda/interfaces/generated/eda-api';
import { Label, LabelGroup } from '@patternfly/react-core';

export type UserDetailsType = {
  first_name: string;
  last_name: string;
  email: string;
  username: string;
} & Partial<{
  is_superuser: boolean | null;
  is_system_auditor: boolean | null;
  ldap_dn: string;
  auth: string[];
  created_at: string;
  created: string;
  created_on: string;
  date_joined: string;
  modified_at: string;
  modified_on: string;
  modified: string;
  last_login: string;
  roles: RoleRef[];
}>;

export function UserDetails<T extends UserDetailsType>(props: {
  user: T;
  organizations?: {
    // Organization name
    name: string;
    // Link (route) to organization details
    link: string;
  }[];
  options?: {
    // Shows the authentication type based on the last login
    showAuthType?: boolean;
    // Displays user type: System Administrator/ System Auditor/ Normal User
    showUserType?: boolean;
  };
}) {
  const { t } = useTranslation();
  const { user, organizations, options } = props;

  return (
    <>
      <PageDetails>
        <PageDetail label={t('First name')}>{user.first_name}</PageDetail>
        <PageDetail label={t('Last name')}>{user.last_name}</PageDetail>
        <PageDetail label={t('Email')}>{user.email}</PageDetail>
        <PageDetail label={t('Username')}>{user.username}</PageDetail>
        {organizations && organizations.length > 0 && (
          <PageDetail label={t('Organization', { count: organizations.length })}>
            <LabelsCell labelsWithLinks={organizations} />
          </PageDetail>
        )}
        {user.last_login && (
          <PageDetail label={t('Last login')}>
            <DateTimeCell format="date-time" value={user.last_login} />
          </PageDetail>
        )}
        {options?.showAuthType && (
          <PageDetail label={t('Authentication type')}>
            <AuthenticationType user={user} />
          </PageDetail>
        )}{' '}
        {options?.showUserType && (
          <PageDetail label={t('User type')}>
            <UserType user={user} />
          </PageDetail>
        )}
        <PageDetail label={t('Created')}>
          <DateTimeCell
            format="date-time"
            value={user.created ?? user.created_at ?? user.date_joined ?? user.created_on}
          />
        </PageDetail>
        {(user.modified || user.modified_at || user.modified_on) && (
          <PageDetail label={t('Modified')}>
            <DateTimeCell
              format="date-time"
              value={user.modified ?? user.modified_at ?? user.modified_on}
            />
          </PageDetail>
        )}
        {user.roles && user.roles.length > 0 && (
          <PageDetail label={t('Role(s)')}>
            <LabelGroup>
              {user.roles.map((role) => (
                <Label key={role?.id}>{role?.name}</Label>
              ))}
            </LabelGroup>
          </PageDetail>
        )}
      </PageDetails>
    </>
  );
}
