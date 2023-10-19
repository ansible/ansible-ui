import { useParams } from 'react-router-dom';
import { CredentialsList } from '../../../resources/common/CredentialsList';
import { awxAPI } from '../../../api/awx-utils';

export function CredentialTypeCredentials() {
  const { id = '' } = useParams<{ id: string }>();

  return <CredentialsList url={awxAPI`/credential_types/${id}/credentials/`} />;
}
