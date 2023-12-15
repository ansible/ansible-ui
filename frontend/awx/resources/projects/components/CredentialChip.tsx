import { useTranslation } from 'react-i18next';
import { Chip } from '@patternfly/react-core';
import { toTitleCase } from '../../../common/util/strings';
import { SummaryFieldCredential } from '../../../interfaces/summary-fields/summary-fields';

interface CredentialName {
  kind: string;
  name: string;
  cloud: boolean;
  inputs?: {
    vault_id: string;
  };
}

export function CredentialChip({
  credentials: credential,
}: {
  credentials: SummaryFieldCredential[];
}) {
  const { t } = useTranslation();
  let type: string;
  return credential?.map((credential) => {
    if (credential.cloud) {
      type = t('Cloud');
    } else if (credential.kind === 'gpg_public_key') {
      type = t('GPG Public Key');
    } else if (credential.kind === 'aws' || credential.kind === 'ssh') {
      type = credential.kind.toUpperCase();
    } else {
      type = toTitleCase(credential.kind);
    }
    const buildCredentialName = (credential: CredentialName): string => {
      if (credential.kind === 'vault' && credential.inputs?.vault_id) {
        return `${credential.name} | ${credential.inputs.vault_id}`;
      }
      return `${credential.name}`;
    };

    return (
      <Chip key={credential.id}>
        <strong>{type}: </strong>
        {buildCredentialName(credential)}
      </Chip>
    );
  });
}

export default CredentialChip;
