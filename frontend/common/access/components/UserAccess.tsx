import { useTranslation } from 'react-i18next';
import { UserAssignment } from '../interfaces/UserAssignment';
import { Access } from './Access';
import { edaAPI } from '../../../eda/common/eda-utils';
import { awxAPI } from '../../../awx/common/api/awx-utils';

export function UserAccess(props: {
  service: 'awx' | 'eda' | 'hub';
  id: string;
  type: string;
  addRolesRoute?: string;
  addRoleButtonText?: string;
  removeRoleText?: string;
  removeConfirmationText?: (count: number) => string;
}) {
  const { type, service, ...rest } = props;
  const { t } = useTranslation();
  const roleUserAssignmentsURL =
    service === 'awx' ? awxAPI`/role_user_assignments/` : edaAPI`/role_user_assignments/`;
  return (
    <Access<UserAssignment>
      {...rest}
      service={service}
      tableColumnFunctions={{
        name: {
          function: (userAccess: UserAssignment) => userAccess.summary_fields.user.username,
          sort: 'user__username',
          label: t('Username'),
        },
      }}
      additionalTableColumns={[
        {
          header: t('First name'),
          type: 'text',
          value: (item: UserAssignment) => item.summary_fields.user.first_name,
          sort: 'first_name',
        },
        {
          header: t('Last name'),
          type: 'text',
          value: (item: UserAssignment) => item.summary_fields.user.last_name,
          sort: 'last_name',
        },
      ]}
      toolbarNameColumnFiltersValues={{ label: t('Username'), query: 'user__username' }}
      url={roleUserAssignmentsURL}
      content_type_model={type}
      accessListType={'user'}
    />
  );
}
