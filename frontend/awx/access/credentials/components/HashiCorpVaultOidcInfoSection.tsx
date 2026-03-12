import { PageFormSection } from '@ansible/ansible-ui-framework/PageForm/Utils/PageFormSection';
import { Alert, List, ListComponent, ListItem, OrderType } from '@patternfly/react-core';
import { CopyCell } from '@ansible/ansible-ui-framework';
import { Trans, useTranslation } from 'react-i18next';
import { ExternalLink } from '@ansible/hub-ui/common/ExternalLink';

export function HashiCorpVaultOidcInfoSection() {
  const { t } = useTranslation();

  const oidcUrl = `${globalThis.location.origin}/o`;
  const vaultConfigCommand = `vault write auth/jwt/config oidc_discovery_url="${oidcUrl}"`;

  return (
    <PageFormSection singleColumn>
      <Alert
        variant="info"
        isInline
        isExpandable
        title={t('Configure HashiCorp Vault')}
        data-cy="hashicorp-vault-oidc-banner"
        data-testid="hashicorp-vault-oidc-banner"
      >
        <Trans>
          To configure your Red Hat Ansible Automation Platform to integrate with HashiCorp Vault
          Server, you will need to provide the necessary details per the OpenID Connect standard.
          This configuration only needs to be done once for each vault server.
        </Trans>
        <br />
        <br />
        <Trans>
          Using JWT-enabled authentication can replace permanent passwords with secure, short-lived
          tokens that automatically verify your identity and protect against credential leaks. To
          learn more, click{' '}
          <ExternalLink href="https://developer.hashicorp.com/vault/docs/auth/jwt">
            here for documentation
          </ExternalLink>
        </Trans>
        <br />
        <br />
        {t('To complete this setup:')}
        <List component={ListComponent.ol} type={OrderType.number}>
          <ListItem>
            <Trans>
              Navigate to the Vault documentation:{' '}
              <ExternalLink href="https://developer.hashicorp.com/vault/docs/auth/jwt#configuration">
                https://developer.hashicorp.com/vault/docs/auth/jwt#configuration
              </ExternalLink>
            </Trans>
          </ListItem>
          <ListItem>
            <Trans>Run the configuration below:</Trans>
            <CopyCell text={vaultConfigCommand} />
          </ListItem>
          <ListItem>
            <Trans>HashiCorp Vault Server will need:</Trans>
            <List>
              <ListItem>
                {t('OIDC Discovery URL')}
                <CopyCell text={oidcUrl} />
              </ListItem>
              <ListItem>{t('AAP Platform CA Certificate (if applicable)')}</ListItem>
            </List>
          </ListItem>
        </List>
      </Alert>
    </PageFormSection>
  );
}
