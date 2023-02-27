import { Team } from '../../../interfaces/Team';
import { ResourceAccessList } from '../../common/ResourceAccessList';

export function TeamAccess(props: { team: Team }) {
  const { team } = props;

  return <ResourceAccessList url={`/api/v2/teams/${team.id}/access_list/`} resource={team} />;
}
