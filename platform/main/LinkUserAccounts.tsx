import { PageHeader, PageLayout, useGetPageUrl } from '@ansible/ansible-ui-framework';
import { LoadingState } from '@ansible/ansible-ui-framework/components/LoadingState';
import { Button, PageSection } from '@patternfly/react-core';
import { t } from 'i18next';
import { useNavigate } from 'react-router';
import { useLegacyAuth } from './LegacyAuthProvider';
import { LegacyMigrationForm } from './LegacyMigrationForm';
import { PlatformRoute } from './PlatformRoutes';

export function LinkUserAccounts() {
  const { legacyAuth } = useLegacyAuth();
  const navigate = useNavigate();
  const getPageUrl = useGetPageUrl();

  if (legacyAuth?.is_migrated && legacyAuth?.linked_accounts.length <= 3) {
    return (
      <PageLayout>
        <PageHeader
          title={t('Link user accounts')}
          breadcrumbs={[
            { label: t('Users'), to: getPageUrl(PlatformRoute.Users) },
            {
              label: legacyAuth?.username,
              to: getPageUrl(PlatformRoute.UserPage, {
                params: { id: legacyAuth?.id },
              }),
            },
            { label: t('Link user accounts') },
          ]}
        />
        <LegacyMigrationForm
          legacyAuth={legacyAuth}
          footer={
            <PageSection hasBodyWrapper={false} isFilled={false}>
              <Button onClick={() => void navigate(-1)}>{t('Close')}</Button>
            </PageSection>
          }
        />
      </PageLayout>
    );
  }
  return <LoadingState />;
}
