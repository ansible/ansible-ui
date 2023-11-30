import { QuickStartCatalogPage } from '@patternfly/quickstarts';
import { PageSection } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '../../../framework';

export function QuickStartsPage() {
  const { t } = useTranslation();
  return (
    <>
      <PageHeader
        title={t('Quick starts')}
        description={t('Learn Ansible automation with hands-on quickstarts.')}
      />
      <PageSection padding={{ default: 'noPadding' }}>
        <QuickStartCatalogPage showFilter showTitle={false} />
      </PageSection>
    </>
  );
}
