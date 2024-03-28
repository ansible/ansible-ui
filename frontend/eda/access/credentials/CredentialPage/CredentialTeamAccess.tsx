import { useParams } from 'react-router-dom';
import { TeamAccess } from '../../../common/TeamAccess';

export function CredentialTeamAccess() {
  const params = useParams<{ id: string }>();
  return TeamAccess(params.id || '', 'credential');
}
