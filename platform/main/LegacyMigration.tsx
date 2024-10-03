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
import { usePlatformActiveUser } from './PlatformActiveUserProvider';
import { CreateAAPUserForm } from './LegacyMigrationCreateAAPUserForm';
import { LegacyMigrationForm } from './LegacyMigrationForm';

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

  if (legacyAuth === undefined || (isLoading && legacyAuth?.is_migrated === false)) {
    return (
      <Page>
        <LoadingState />
      </Page>
    );
  }

  if (legacyAuth?.is_authenticated === true && !activePlatformUser) {
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

  if (legacyAuth?.is_migrated === false && !showCreateUserForm) {
    return (
      <Page>
        <PageLayout>
          <PageSectionWrapper variant="light">
            <Card isFlat isCompact style={{ maxWidth: '800px' }}>
              <CardHeader style={{ padding: '16px 32px' }}>
                <AAPLogoBlackText />
              </CardHeader>
              <CardBody>
                <CardTitle>{t('Link your Ansible Automation Platform accounts')}</CardTitle>
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
  if (legacyAuth?.is_migrated === false && showCreateUserForm) {
    return (
      <Page>
        <PageLayout>
          <PageSectionWrapper variant="light">
            <Card isFlat isCompact style={{ maxWidth: '800px' }}>
              <CardHeader style={{ padding: '16px 32px' }}>
                <AAPLogoBlackText />
              </CardHeader>
              <CardBody>
                <CardTitle>
                  {isLDAPAccount || isSSOAccount
                    ? t('Complete your AAP migration')
                    : t('Set your AAP credentials')}
                </CardTitle>
                <Text style={{ padding: '0 16px' }}>
                  {isLDAPAccount || isSSOAccount
                    ? t(
                        'You accounts have been linked. Complete your migration by clicking on the submit button below. If you have an LDAP account, you can continue using your same LDAP credentials to log in to AAP.'
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

  return props.children;
}
