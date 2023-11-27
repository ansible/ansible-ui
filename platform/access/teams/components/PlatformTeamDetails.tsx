import { useParams } from 'react-router-dom';
import { useGetPageUrl } from '../../../../framework';
import { useGetItem } from '../../../../frontend/common/crud/useGet';
import { Team } from '../../../interfaces/Team';
import { PlatformRoute } from '../../../PlatformRoutes';
import { TeamDetails, TeamDetailsType } from '../../../../frontend/common/access/TeamDetails';
import { gatewayAPI } from '../../../api/gateway-api-utils';

export function PlatformTeamDetails() {
  const params = useParams<{ id: string }>();
  const { data: team } = useGetItem<Team>(gatewayAPI`/v1/teams`, params.id);
  const getPageUrl = useGetPageUrl();

  return team ? (
    <TeamDetails
      team={team as TeamDetailsType}
      organizationDetailsUrl={getPageUrl(PlatformRoute.OrganizationDetails, {
        params: { id: (team.summary_fields?.organization?.id ?? '').toString() },
      })}
      createdByUserDetailsUrl={getPageUrl(PlatformRoute.UserDetails, {
        params: { id: (team.summary_fields?.created_by?.id ?? 0).toString() },
      })}
      modifiedByUserDetailsUrl={getPageUrl(PlatformRoute.UserDetails, {
        params: {
          id: (team.summary_fields?.modified_by?.id ?? 0).toString(),
        },
      })}
    />
  ) : null;
}
