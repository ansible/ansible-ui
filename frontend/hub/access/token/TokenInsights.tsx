import { CopyCell, PageHeader, PageLayout } from '@ansible/ansible-ui-framework';
import {
  Button,
  ClipboardCopy,
  PageSection,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';
import { useCallback, useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { getRepoURL } from '../../common/api/hub-api-utils';
import { AAPDocsURL } from '../../common/constants';
import { ExternalLink } from '../../common/ExternalLink';

interface TokenData {
  access_token: string;
  expires_in: number;
  id_token: string;
  refresh_expires_in: number;
  refresh_token: string;
  scope: string;
  session_state: string;
  token_type: string;
}

const SSO_URL = 'https://sso.redhat.com/auth/realms/redhat-external/protocol/openid-connect/token';
const TOKEN_MANAGEMENT_URL =
  'https://sso.redhat.com/auth/realms/redhat-external/account/#/applications';
const SECURITY_KEY_URL = 'https://access.redhat.com/security/team/key';

export function TokenInsights() {
  const { t } = useTranslation();
  const [tokenData, setTokenData] = useState<TokenData | null>(null);

  const getTokenData = useCallback(() => {
    const windowWithInsights = globalThis as typeof globalThis & Window;
    if (!windowWithInsights.insights?.chrome) {
      // Outside insights platform
      return;
    }

    // This function will fail if chrome.auth.doOffline() hasn't been called
    // so it never works the first time. loadToken() causes a reload and then it works.
    windowWithInsights.insights.chrome.auth
      .getOfflineToken()
      .then(({ data }) => setTokenData(data))
      .catch(() => {
        // Silently fail - user needs to click "Load token" first
      });
  }, []);

  useEffect(() => {
    getTokenData();
  }, [getTokenData]);

  const loadToken = () => {
    const windowWithInsights = globalThis as typeof globalThis & Window;
    if (!windowWithInsights.insights?.chrome) {
      return;
    }
    // doOffline causes the page to refresh and will make the data
    // available to getOfflineToken() when the component mounts after the reload
    windowWithInsights.insights.chrome.auth.doOffline();
  };

  const renewTokenCmd = `curl ${SSO_URL} -d grant_type=refresh_token -d client_id="cloud-services" -d refresh_token="${
    tokenData?.refresh_token ?? '{{ user_token }}'
  }" --fail --silent --show-error --output /dev/null`;

  return (
    <PageLayout>
      <PageHeader title={t('Connect to Hub')} />

      {/* Connect Private Automation Hub */}
      <PageSection hasBodyWrapper={false}>
        <Stack hasGutter>
          <StackItem>
            <Title headingLevel="h2">{t('Connect Private Automation Hub')}</Title>
          </StackItem>
          <StackItem>
            {t(
              'Use the Server URL below to sync certified collections to the Red Hat Certified repository in your private Automation Hub. If you wish to sync validated content, you can add a remote with a server url pointed to the validated repo.'
            )}
          </StackItem>
        </Stack>
      </PageSection>

      {/* Connect ansible-galaxy client */}
      <PageSection hasBodyWrapper={false}>
        <Stack hasGutter>
          <StackItem>
            <Title headingLevel="h2">{t('Connect the ansible-galaxy client')}</Title>
          </StackItem>
          <StackItem>
            <Trans i18nKey="connectAnsibleGalaxyClient">
              Documentation on how to configure the <code>ansible-galaxy</code> client can be found{' '}
              <ExternalLink href={AAPDocsURL}>here</ExternalLink>. Use the following parameters to
              configure the client.
            </Trans>
          </StackItem>
        </Stack>
      </PageSection>

      {/* Offline token */}
      <PageSection hasBodyWrapper={false}>
        <Stack hasGutter>
          <StackItem>
            <Title headingLevel="h2">{t('Offline token')}</Title>
          </StackItem>
          <StackItem>
            {t(
              'Use this token to authenticate clients that need to download content from Automation Hub. This is a secret token used to protect your content. Store your API token in a secure location.'
            )}
          </StackItem>
          <StackItem>
            {tokenData ? (
              <CopyCell text={tokenData.refresh_token} testId="offline-token" minWidth={400} />
            ) : (
              <Button onClick={loadToken} data-cy="load-token" data-testid="load-token">
                {t('Load token')}
              </Button>
            )}
          </StackItem>
          <StackItem>
            {t(
              'The token will expire after 30 days of inactivity. Run the command below periodically to prevent your token from expiring.'
            )}
          </StackItem>
          <StackItem>
            <ClipboardCopy
              isCode
              isReadOnly
              variant="expansion"
              data-cy="renew-token-command"
              data-testid="renew-token-command"
            >
              {renewTokenCmd}
            </ClipboardCopy>
          </StackItem>
        </Stack>
      </PageSection>

      {/* Manage tokens */}
      <PageSection hasBodyWrapper={false}>
        <Stack hasGutter>
          <StackItem>
            <Title headingLevel="h2">{t('Manage tokens')}</Title>
          </StackItem>
          <StackItem>
            <Trans i18nKey="manageTokens">
              To revoke a token or see all of your tokens, visit the{' '}
              <ExternalLink href={TOKEN_MANAGEMENT_URL}>offline API token management</ExternalLink>{' '}
              page.
            </Trans>
          </StackItem>
        </Stack>
      </PageSection>

      {/* Server URL */}
      <PageSection hasBodyWrapper={false}>
        <Stack hasGutter>
          <StackItem>
            <Title headingLevel="h2">{t('Server URL')}</Title>
          </StackItem>
          <StackItem>
            <Trans i18nKey="serverUrlCertified">
              Use this URL to configure the API endpoints that clients need to download{' '}
              <strong>certified</strong> content from Automation Hub.
            </Trans>
          </StackItem>
          <StackItem>
            <CopyCell text={getRepoURL('published', true)} testId="certified-url" minWidth={400} />
          </StackItem>
          <StackItem>
            <Trans i18nKey="serverUrlValidated">
              Use this URL for <strong>validated</strong> content from Automation Hub.
            </Trans>
          </StackItem>
          <StackItem>
            <CopyCell text={getRepoURL('validated')} testId="validated-url" minWidth={400} />
          </StackItem>
          <StackItem>
            <Trans i18nKey="synclistsDeprecated">
              Synclists are deprecated in AAP 2.4 and will be removed in a future release, use
              client-side <code>requirements.yml</code> instead.
            </Trans>
          </StackItem>
        </Stack>
      </PageSection>

      {/* SSO URL */}
      <PageSection hasBodyWrapper={false}>
        <Stack hasGutter>
          <StackItem>
            <Title headingLevel="h2">{t('SSO URL')}</Title>
          </StackItem>
          <StackItem>
            {t(
              'Use this URL to configure the authentication URLs that clients need to download content from Automation Hub.'
            )}
          </StackItem>
          <StackItem>
            <CopyCell text={SSO_URL} testId="sso-url" minWidth={400} />
          </StackItem>
        </Stack>
      </PageSection>

      {/* CRC public key */}
      <PageSection hasBodyWrapper={false}>
        <Stack hasGutter>
          <StackItem>
            <Title headingLevel="h2">{t('CRC public key')}</Title>
          </StackItem>
          <StackItem>
            <Trans i18nKey="crcPublicKey">
              We use a number of keys to sign our software packages. The necessary public keys are
              included in the relevant products and are used to automatically verify software
              updates. You can also verify the packages manually using the keys on this page. More
              information can be found <ExternalLink href={SECURITY_KEY_URL}>here.</ExternalLink>
            </Trans>
          </StackItem>
        </Stack>
      </PageSection>
    </PageLayout>
  );
}
