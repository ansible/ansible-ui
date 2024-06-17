import { awxAPI } from '../../../awx/common/api/awx-utils';
import { edaAPI } from '../../../eda/common/eda-utils';
import { TeamAssignment } from '../interfaces/TeamAssignment';
import { Access } from './Access';
import { useTranslation } from 'react-i18next';

export function TeamAccess(props: {
  service: 'awx' | 'eda' | 'hub';
  id: string;
  type: string;
  addRolesRoute?: string;
}) {
  const { id, type, addRolesRoute, service } = props;
  const { t } = useTranslation();
  const roleTeamAssignmentsURL =
    service === 'awx' ? awxAPI`/role_team_assignments/` : edaAPI`/role_team_assignments/`;
  return (
    <Access<TeamAssignment>
      service={service}
      tableColumnFunctions={{
        name: {
          function: (teamAccess: TeamAssignment) => teamAccess.summary_fields.team.name,
          sort: 'team__name',
          label: t('Team name'),
        },
      }}
      toolbarNameColumnFiltersValues={{ label: t('Team name'), query: 'team__name' }}
      url={roleTeamAssignmentsURL}
      id={id}
      content_type_model={type}
      addRolesRoute={addRolesRoute}
      accessListType={'team'}
    />
  );
}
