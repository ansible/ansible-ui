import { useGetPageUrl } from '@ansible/ansible-ui-framework';
import { Label } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Credential } from '../interfaces/Credential';
import { SummaryFieldCredential } from '../interfaces/summary-fields/summary-fields';
import { AwxRoute } from '../main/AwxRoutes';
import { toTitleCase } from './util/strings';

function CredentialLabel(props: { credential: Credential | SummaryFieldCredential | undefined }) {
  const { t } = useTranslation();
  const { credential, ...rest } = props;
  const getPageUrl = useGetPageUrl();

  let type;
  if (!credential) {
    return null;
  }
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
    <Label
      color="blue"
      isClickable
      {...rest}
      render={({ content, className }) => (
        <Link
          className={className}
          to={getPageUrl(AwxRoute.CredentialDetails, { params: { id: credential.id } })}
        >
          {content}
        </Link>
      )}
    >
      <strong>{type}: </strong>
      {credential.kind === 'vault' && vault_id
        ? `${credential.name} | ${vault_id.toString()}`
        : credential.name}
    </Label>
  );
}

export { CredentialLabel };
