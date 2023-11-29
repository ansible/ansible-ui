import { QuickStartCatalogPage } from '@patternfly/quickstarts';
import { PageSection } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';

export function QuickStartsPage() {
  const { t } = useTranslation();
  return (
    <PageSection padding={{ default: 'noPadding' }}>
      <QuickStartCatalogPage
        title={t('Quick starts')}
        hint={t('Learn Ansible automation with hands-on quickstarts.')}
        showFilter
      />
    </PageSection>
  );
}
