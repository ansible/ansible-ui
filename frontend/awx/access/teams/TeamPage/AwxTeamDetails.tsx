import { useGetPageUrl } from '../../../../../framework';
import { useGetItem } from '../../../../common/crud/useGet';
import { AwxRoute } from '../../../AwxRoutes';
import { Team } from '../../../interfaces/Team';
import { TeamDetails, TeamDetailsType } from '../../../../common/access/TeamDetails';
import { useParams } from 'react-router-dom';
import { awxAPI } from '../../../api/awx-utils';

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
