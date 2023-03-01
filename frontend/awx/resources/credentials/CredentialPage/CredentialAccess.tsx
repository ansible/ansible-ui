import { ResourceAccessList } from '../../../access/common/ResourceAccessList';
import { Credential } from '../../../interfaces/Credential';

export function CredentialAccess(props: { credential: Credential }) {
  const { credential } = props;
  return (
    <ResourceAccessList
      url={`/api/v2/credentials/${credential.id}/access_list/`}
      resource={credential}
    />
  );
}
