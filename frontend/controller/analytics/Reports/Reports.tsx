import { PageHeader, PageLayout } from '../../../../framework';
import { Page, PageSection } from '@patternfly/react-core';
import { AnalyticsErrorState } from './ErrorStates';
import { useActiveUser } from '../../../common/useActiveUser';
import { EmptyStateUnauthorized } from '../../../../framework/components/EmptyStateUnauthorized';

export function Reports() {
  const activeUser = useActiveUser();

  return (
    <Page>
      <PageLayout>
        <PageHeader title={'Reports'} />
        <PageSection>
          {activeUser?.is_superuser || activeUser?.is_system_auditor ? (
            <AnalyticsErrorState error={'no_credentials'} />
          ) : (
            <EmptyStateUnauthorized />
          )}
        </PageSection>
      </PageLayout>
    </Page>
  );
}
