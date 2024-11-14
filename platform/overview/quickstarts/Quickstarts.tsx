import { PageHeader, PageLayout, Scrollable } from '@ansible/ansible-ui-framework';
import { QuickStartCatalogPage } from '@patternfly/quickstarts';
import { PageSection } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';

export function QuickStartsPage() {
  const { t } = useTranslation();
  return (
    <PageLayout>
      <PageHeader
        title={t('Quick Starts')}
        description={t('Learn Ansible automation with hands-on quickstarts.')}
      />
      <Scrollable>
        <PageSection padding={{ default: 'noPadding' }}>
          <QuickStartCatalogPage showFilter showTitle={false} />
        </PageSection>
      </Scrollable>
    </PageLayout>
  );
}
