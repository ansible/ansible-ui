import { useTranslation } from 'react-i18next';
import { TeamAssignment } from '../interfaces/TeamAssignment';
import { UserAssignment } from '../interfaces/UserAssignment';
import { Access } from './Access';
import { edaAPI } from '../../common/eda-utils';

export function ResourceAccess(props: {
  id: string;
  type: 'user-roles' | 'team-roles';
  addRolesRoute?: string;
}) {
  const { id, type, addRolesRoute } = props;
  const { t } = useTranslation();
  return (
    <Access
      tableColumnFunctions={{
        name: {
          // TODO: Using object_id for now. Object name is being added to the API.
          function: (assignment: TeamAssignment | UserAssignment) => assignment.object_id,
          // sort: 'team__name', // TODO: Enable filter when object name becomes available in the API.
          label: t('Resource name'),
        },
      }}
      additionalTableColumns={[
        {
          header: t('Type'),
          type: 'description',
          value: (item) => item.content_type,
        },
      ]}
      // TODO: This filter won't work yet since object name is being added to the API
      toolbarFiltersValues={{ label: t('Resource name'), query: 'object__name' }}
      url={
        type === 'user-roles' ? edaAPI`/role_user_assignments/` : edaAPI`/role_team_assignments/`
      }
      id={id}
      addRolesRoute={addRolesRoute}
      type={type}
    />
  );
}
