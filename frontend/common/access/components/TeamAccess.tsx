import { awxAPI } from '../../../awx/common/api/awx-utils';
import { edaAPI } from '../../../eda/common/eda-utils';
import { hubAPI } from '../../../hub/common/api/formatPath';
import { TeamAssignment } from '../interfaces/TeamAssignment';
import { Access } from './Access';
import { useTranslation } from 'react-i18next';

export function TeamAccess(props: {
  service: 'awx' | 'eda' | 'hub';
  id: string;
  type: string;
  addRolesRoute?: string;
  addRoleButtonText?: string;
  removeRoleText?: string;
  removeConfirmationText?: (count: number) => string;
}) {
  const {
    type,
    service,

    ...rest
  } = props;
  const { t } = useTranslation();
  const roleTeamAssignmentsURL =
    service === 'awx'
      ? awxAPI`/role_team_assignments/`
      : service === 'eda'
        ? edaAPI`/role_team_assignments/`
        : hubAPI`/_ui/v2/role_team_assignments/`;
  return (
    <Access<TeamAssignment>
      {...rest}
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
      content_type_model={type}
      accessListType={'team'}
    />
  );
}
