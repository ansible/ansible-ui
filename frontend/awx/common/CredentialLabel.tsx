import { useTranslation } from 'react-i18next';
import { Label } from '@patternfly/react-core';
import { Link } from 'react-router-dom';
import { RouteE } from '../../Routes';
import { Credential } from '../interfaces/Credential';
import { toTitleCase } from './util/strings';

function CredentialLabel(props: { credential: Credential }) {
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
    <Label color="blue" {...rest}>
      <Link to={RouteE.CredentialDetails.replace(':id', credential.id.toString())}>
        {/* eslint-disable-next-line i18next/no-literal-string */}
        <strong>{type}: </strong>
        {credential.kind === 'vault' && credential.inputs?.vault_id
          ? `${credential.name} | ${credential.inputs.vault_id.toString()}`
          : credential.name}
      </Link>
    </Label>
  );
}

export { CredentialLabel };
