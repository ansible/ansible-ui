import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Page,
  PageSection,
  Text,
} from '@patternfly/react-core';
import { ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { PageLayout } from '../../framework';
import { LoadingState } from '../../framework/components/LoadingState';
import { usePostRequest } from '../../frontend/common/crud/usePostRequest';
import AAPLogo from '../assets/aap-logo.svg';
import { gatewayAPI } from '../utils/gateway-api-utils';
import { useLegacyAuth } from './LegacyAuthProvider';
import { CreateAAPUserForm } from './LegacyMigrationCreateAAPUserForm';
import { LegacyMigrationForm } from './LegacyMigrationForm';
import { usePlatformActiveUser } from './PlatformActiveUserProvider';

const AAPLogoBlackText = styled(AAPLogo)`
  .aap-logo_svg__st0 {
    height: 64px;
    fill: var(--pf-v5-global--Color--100);
  }
`;
const PageSectionWrapper = styled(PageSection)`
  align-items: center;
  display: flex;
  height: 100%;
  justify-content: center;
  overflow: scroll;
`;

const Footer = (props: {
  onCancel: () => Promise<void>;
  setShowCreateUserForm: (value: boolean) => void;
}) => {
  const { t } = useTranslation();
  const { onCancel, setShowCreateUserForm } = props;
  const [isLoading, setIsLoading] = useState(false);

  const handleCancel = async () => {
    setIsLoading(true);
    await onCancel();
  };

  return (
    <PageSection variant="light" isFilled={false} className="bg-lighten border-top">
      <Button variant="primary" onClick={() => setShowCreateUserForm(true)}>
        {t('Next')}
      </Button>
      <Button variant="link" onClick={() => void handleCancel()} isLoading={isLoading}>
        {t('Cancel')}
      </Button>
    </PageSection>
  );
};

export function LegacyMigration(props: { children: ReactNode }) {
  const { t } = useTranslation();
  const { legacyAuth, refreshLegacyAuth, isLoading } = useLegacyAuth();
  const { activePlatformUser, refreshActivePlatformUser } = usePlatformActiveUser();
  const cancelRequest = usePostRequest<{ username: string }>();
  const [showCreateUserForm, setShowCreateUserForm] = useState(false);

  const isLDAPAccount =
    legacyAuth?.allow_aap_password === false && legacyAuth?.allow_rename === false;
  const isSSOAccount = legacyAuth?.is_sso_account;

  const showLoading =
    legacyAuth === undefined ||
    (isLoading && legacyAuth?.is_migrated === false) ||
    (legacyAuth?.is_authenticated === true && !activePlatformUser) ||
    (legacyAuth?.is_migrated === undefined && activePlatformUser);

  const showDashboard =
    legacyAuth?.is_migrated === true &&
    (legacyAuth?.needs_aap_password === undefined || legacyAuth?.needs_aap_password === false);

  const showLogin = legacyAuth?.is_migrated === undefined;
  const showLinkAccountsForm = legacyAuth?.is_migrated === false && showCreateUserForm === false;
  const showUsernamePasswordForm =
    (legacyAuth?.is_migrated === true && legacyAuth?.needs_aap_password === true) ||
    (legacyAuth?.is_migrated === false && showCreateUserForm === true);

  if (showLoading) {
    return (
      <Page>
        <LoadingState />
      </Page>
    );
  }

  const handleCancel = async () => {
    try {
      await cancelRequest(gatewayAPI`/legacy_auth/reset/`, {
        username: legacyAuth?.username || '',
      });
    } finally {
      void refreshActivePlatformUser?.();
      void refreshLegacyAuth?.();
    }
  };

  if (showUsernamePasswordForm) {
    // User is not migrated, completed linking accounts, and needs to create a username/password
    // User is migrated and needs to create a username/password
    return (
      <Page>
        <PageLayout>
          <PageSectionWrapper variant="light">
            <Card isFlat isCompact style={{ maxWidth: '800px' }}>
              <CardHeader style={{ padding: '16px 32px' }}>
                <AAPLogoBlackText />
              </CardHeader>
              <CardBody>
                <CardTitle
                  data-cy={
                    isLDAPAccount || isSSOAccount ? 'complete-aap-migration' : 'set-app-credentials'
                  }
                >
                  {isLDAPAccount || isSSOAccount
                    ? t('Complete your AAP migration')
                    : t('Set your AAP credentials')}
                </CardTitle>
                <Text style={{ padding: '0 16px' }}>
                  {isLDAPAccount || isSSOAccount
                    ? t(
                        'Your accounts have been linked. Complete your migration by clicking on the submit button below. If you have an LDAP account, you can continue using your same LDAP credentials to log in to AAP.'
                      )
                    : t(
                        'Your accounts have been linked. To complete the migration please set a new username and password. These will be your credentials to log in to AAP.'
                      )}
                </Text>

                <CreateAAPUserForm
                  legacyAuth={legacyAuth}
                  setShowCreateUserForm={setShowCreateUserForm}
                  isLDAPAccount={isLDAPAccount}
                />
              </CardBody>
            </Card>
          </PageSectionWrapper>
        </PageLayout>
      </Page>
    );
  }

  if (showLinkAccountsForm) {
    // User is not migrated and needs to link accounts
    return (
      <Page>
        <PageLayout>
          <PageSectionWrapper variant="light">
            <Card isFlat isCompact style={{ maxWidth: '800px' }}>
              <CardHeader style={{ padding: '16px 32px' }}>
                <AAPLogoBlackText />
              </CardHeader>
              <CardBody>
                <CardTitle data-cy="link-accounts">
                  {t('Link your Ansible Automation Platform accounts')}
                </CardTitle>
                <Text style={{ padding: '0 16px' }}>
                  {t(
                    'You have just linked your AAP v2.4 account to AAP v2.5. You can continue linking your AAP services to this same AAP v2.5 account.'
                  )}
                </Text>
                <LegacyMigrationForm
                  legacyAuth={legacyAuth}
                  footer={
                    <Footer onCancel={handleCancel} setShowCreateUserForm={setShowCreateUserForm} />
                  }
                />
              </CardBody>
            </Card>
          </PageSectionWrapper>
        </PageLayout>
      </Page>
    );
  }

  if (showLogin || showDashboard) {
    // User has not logged (legacyAuth?.is_migrated === undefined;)
    // User has logged in, is migrated, and does not need to create a username/password
    return props.children;
  }

  return (
    <Page>
      <LoadingState />
    </Page>
  );
}
