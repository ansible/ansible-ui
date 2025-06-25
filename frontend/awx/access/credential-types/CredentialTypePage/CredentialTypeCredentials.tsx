import { useParams } from 'react-router';
import { awxAPI } from '../../../common/api/awx-utils';
import { CredentialsList } from '../../credentials/CredentialsList';

export function CredentialTypeCredentials() {
  const { id = '' } = useParams<{ id: string }>();

  return <CredentialsList url={awxAPI`/credential_types/${id}/credentials/`} />;
}
