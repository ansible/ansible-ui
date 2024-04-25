import { useTranslation } from 'react-i18next';
import { edaAPI } from '../../common/eda-utils';
import { UserAssignment } from '../interfaces/UserAssignment';
import { Access } from './Access';
import { ColumnPriority } from '../../../../framework';

export function UserAccess(props: { id: string; type: string; addRolesRoute?: string }) {
  const { id, type, addRolesRoute } = props;
  const { t } = useTranslation();
  return (
    <Access<UserAssignment>
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
      toolbarNameColumnFiltersValues={{ label: t('User name'), query: 'user__username' }}
      url={edaAPI`/role_user_assignments/`}
      id={id}
      content_type_model={type}
      addRolesRoute={addRolesRoute}
      accessListType={'user'}
    />
  );
}
