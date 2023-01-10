import { useTranslation } from 'react-i18next';
import { Chip } from '@patternfly/react-core';
import { Credential } from '../interfaces/Credential';
import { toTitleCase } from '../common/util/strings';

function CredentialChip(props: { credential: Credential; isReadOnly?: boolean }) {
  const { t } = useTranslation();
  const { credential, ...rest } = props;

  let type;
  if (credential.cloud) {
    type = t`Cloud`;
  } else if (credential.kind === 'gpg_public_key') {
    type = t`GPG Public Key`;
  } else if (credential.kind === 'aws' || credential.kind === 'ssh') {
    type = credential.kind.toUpperCase();
  } else {
    type = toTitleCase(credential.kind || '');
  }

  return (
    <Chip {...rest}>
      {/* eslint-disable-next-line i18next/no-literal-string */}
      <strong>{type}: </strong>
      {credential.kind === 'vault' && credential.inputs?.vault_id
        ? `${credential.name} | ${credential.inputs.vault_id.toString()}`
        : credential.name}
    </Chip>
  );
}

export { CredentialChip };
