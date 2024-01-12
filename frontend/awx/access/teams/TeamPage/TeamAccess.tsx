import { useParams } from 'react-router-dom';
import { useGetItem } from '../../../../common/crud/useGet';
import { awxAPI } from '../../../common/api/awx-utils';
import { Team } from '../../../interfaces/Team';
import { ResourceAccessList } from '../../common/ResourceAccessList';

export function TeamAccess() {
  const params = useParams<{ id: string }>();
  const { data: team } = useGetItem<Team>(awxAPI`/teams`, params.id);

  return team ? <TeamAccessInner team={team} /> : null;
}

export function TeamAccessInner(props: { team: Team }) {
  const { team } = props;

  return (
    <ResourceAccessList url={awxAPI`/teams/${team.id.toString()}/access_list/`} resource={team} />
  );
}
