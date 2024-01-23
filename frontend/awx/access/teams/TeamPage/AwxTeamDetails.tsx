import { useParams } from 'react-router-dom';
import { useGetPageUrl } from '../../../../../framework';
import { TeamDetails, TeamDetailsType } from '../../../../common/access/TeamDetails';
import { useGetItem } from '../../../../common/crud/useGet';
import { awxAPI } from '../../../common/api/awx-utils';
import { Team } from '../../../interfaces/Team';
import { AwxRoute } from '../../../main/AwxRoutes';

export function AwxTeamDetails() {
  const params = useParams<{ id: string }>();
  const { data: team } = useGetItem<Team>(awxAPI`/teams`, params.id);
  const getPageUrl = useGetPageUrl();

  return team ? (
    <TeamDetails
      team={team as TeamDetailsType}
      organizationDetailsUrl={getPageUrl(AwxRoute.OrganizationDetails, {
        params: { id: (team.summary_fields?.organization?.id ?? '').toString() },
      })}
      createdByUserDetailsUrl={getPageUrl(AwxRoute.UserDetails, {
        params: { id: (team.summary_fields?.created_by?.id ?? 0).toString() },
      })}
      modifiedByUserDetailsUrl={getPageUrl(AwxRoute.UserDetails, {
        params: {
          id: (team.summary_fields?.modified_by?.id ?? 0).toString(),
        },
      })}
    />
  ) : null;
}
