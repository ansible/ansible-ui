import { useTranslation } from 'react-i18next';
import { Label } from '@patternfly/react-core';
import { Link } from 'react-router-dom';
import { RouteObj } from '../../Routes';
import { Credential } from '../interfaces/Credential';
import { toTitleCase } from './util/strings';
import { SummaryFieldCredential } from '../interfaces/summary-fields/summary-fields';
import { useMemo } from 'react';

function CredentialLabel(props: { credential: Credential | SummaryFieldCredential }) {
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
  const vault_id = useMemo(() => {
    if (
      credential.kind === 'vault' &&
      (credential as Credential).inputs &&
      (credential as Credential).inputs?.vault_id
    ) {
      return (credential as Credential).inputs?.vault_id;
    }
  }, [credential]);

  return (
    <Label color="blue" {...rest}>
      <Link to={RouteObj.CredentialDetails.replace(':id', credential.id.toString())}>
        {/* eslint-disable-next-line i18next/no-literal-string */}
        <strong>{type}: </strong>
        {credential.kind === 'vault' && vault_id
          ? `${credential.name} | ${vault_id.toString()}`
          : credential.name}
      </Link>
    </Label>
  );
}

export { CredentialLabel };
