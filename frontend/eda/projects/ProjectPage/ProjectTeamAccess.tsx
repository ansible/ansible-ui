import { useParams } from 'react-router-dom';
import { TeamAccess } from '../../common/TeamAccess';

export function ProjectTeamAccess() {
  const params = useParams<{ id: string }>();
  return TeamAccess(params.id || '', 'project');
}
