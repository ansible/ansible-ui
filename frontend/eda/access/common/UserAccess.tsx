import { useTranslation } from 'react-i18next';
import { edaAPI } from '../../common/eda-utils';
import { UserAssignment } from '../interfaces/UserAssignment';
import { Access } from './Access';

export function UserAccess(props: { id: string; type: string; addRolesRoute?: string }) {
  const { id, type, addRolesRoute } = props;
  const { t } = useTranslation();
  return (
    <Access
      tableColumnFunctions={{
        name: {
          function: (userAccess: UserAssignment) => userAccess.summary_fields.user.username,
          sort: 'user__username',
          label: t('Username'),
        },
      }}
      toolbarFiltersValues={{ label: t('User name'), query: 'user__username' }}
      url={edaAPI`/role_user_assignments/`}
      id={id}
      content_type_model={type}
      addRolesRoute={addRolesRoute}
      translatedType={t('user')}
    />
  );
}
