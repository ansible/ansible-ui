import { Label } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useGetPageUrl } from '../../../framework';
import { Credential } from '../interfaces/Credential';
import { SummaryFieldCredential } from '../interfaces/summary-fields/summary-fields';
import { AwxRoute } from '../main/AwxRoutes';
import { toTitleCase } from './util/strings';

function CredentialLabel(props: { credential: Credential | SummaryFieldCredential }) {
  const { t } = useTranslation();
  const { credential, ...rest } = props;
  const getPageUrl = useGetPageUrl();

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
  const vault_id =
    credential.kind === 'vault' &&
    (credential as Credential).inputs &&
    (credential as Credential).inputs?.vault_id
      ? (credential as Credential).inputs?.vault_id
      : undefined;

  return (
    <Label color="blue" {...rest}>
      <Link to={getPageUrl(AwxRoute.CredentialDetails, { params: { id: credential.id } })}>
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
