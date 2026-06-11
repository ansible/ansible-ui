import { useGetPageUrl } from '@ansible/ansible-ui-framework';
import { PlatformRoute } from '@ansible/platform-ui/main/PlatformRoutes';
import { useTranslation } from 'react-i18next';
import { TeamAssignment } from '../interfaces/TeamAssignment';
import { gatewayAPI } from '@ansible/platform-ui/utils/gateway-api-utils';
import { PlatformAccess } from './PlatformAccess';

export function PlatformTeamAccess(props: {
  id: string;
  type: string;
  addRolesRoute?: string;
  addRoleButtonText?: string;
  removeRoleText?: string;
  removeConfirmationText?: (count: number) => string;
}) {
  const { type, ...rest } = props;
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const roleTeamAssignmentsURL = gatewayAPI`/role_team_assignments/`;
  return (
    <PlatformAccess<TeamAssignment>
      {...rest}
      tableColumnFunctions={{
        name: {
          function: (teamAccess: TeamAssignment) => teamAccess?.summary_fields?.team?.name,
          sort: 'team__name',
          label: t('Team name'),
          to: (teamAccess: TeamAssignment) =>
            getPageUrl(PlatformRoute.TeamDetails, {
              params: { id: teamAccess?.summary_fields?.team?.id },
            }),
        },
      }}
      toolbarNameColumnFiltersValues={{ label: t('Team name'), query: 'team__name__icontains' }}
      url={roleTeamAssignmentsURL}
      content_type_model={type}
      accessListType={'team'}
      addRoleButtonText={t('Assign teams')}
    />
  );
}
