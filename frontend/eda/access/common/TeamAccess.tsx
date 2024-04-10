import { edaAPI } from '../../common/eda-utils';
import { TeamAssignment } from '../interfaces/TeamAssignment';
import { Access } from './Access';
import { useTranslation } from 'react-i18next';

export function TeamAccess(props: { id: string; type: string; addRolesRoute?: string }) {
  const { id, type, addRolesRoute } = props;
  const { t } = useTranslation();
  return (
    <Access
      tableColumnFunctions={{
        name: {
          function: (teamAccess: TeamAssignment) => teamAccess.summary_fields.team.name,
          sort: 'team__name',
          label: t('Team name'),
        },
      }}
      toolbarFiltersValues={{ label: '', query: '' }}
      url={edaAPI`/role_team_assignments/`}
      id={id}
      content_type_model={type}
      addRolesRoute={addRolesRoute}
      translatedType={t('team')}
    />
  );
}
