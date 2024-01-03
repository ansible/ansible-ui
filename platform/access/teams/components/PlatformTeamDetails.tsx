import { useParams } from 'react-router-dom';
import { useGetPageUrl } from '../../../../framework';
import { TeamDetails, TeamDetailsType } from '../../../../frontend/common/access/TeamDetails';
import { useGetItem } from '../../../../frontend/common/crud/useGet';
import { PlatformRoute } from '../../../PlatformRoutes';
import { gatewayAPI } from '../../../api/gateway-api-utils';
import { PlatformTeam } from '../../../interfaces/PlatformTeam';

export function PlatformTeamDetails() {
  const params = useParams<{ id: string }>();
  const { data: team } = useGetItem<PlatformTeam>(gatewayAPI`/v1/teams`, params.id);
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
