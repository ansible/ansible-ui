import { PageHeader, PageLayout } from '@ansible/ansible-ui-framework';
import { useTranslation } from 'react-i18next';
import { LegacyTokensTable } from './LegacyTokensTable';

export function LegacyTokensPage() {
  const { t } = useTranslation();
  return (
    <PageLayout>
      <PageHeader
        title={t('Legacy Tokens')}
        description={t('Legacy tokens used for authentication and authorization in automation.')}
      />
      <LegacyTokensTable />
    </PageLayout>
  );
}
