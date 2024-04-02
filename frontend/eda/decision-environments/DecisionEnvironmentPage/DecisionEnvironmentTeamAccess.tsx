import { useParams } from 'react-router-dom';
import { TeamAccess } from '../../access/common/TeamAccess';

export function DecisionEnvironmentTeamAccess() {
  const params = useParams<{ id: string }>();
  return TeamAccess(params.id || '', 'decisionenvironment');
}
