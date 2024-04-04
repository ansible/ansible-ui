import { useParams } from 'react-router-dom';
import { TeamAccess } from '../../access/common/TeamAccess';

export function ProjectTeamAccess() {
  const params = useParams<{ id: string }>();
  return <TeamAccess id={params.id || ''} type={'project'} />;
}
