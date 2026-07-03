import { PageHeader, PageLayout } from '@ansible/ansible-ui-framework';
import { useTranslation } from 'react-i18next';
import { ApiTokensTable } from './ApiTokensTable';

export function ApiTokensPage() {
  const { t } = useTranslation();
  return (
    <PageLayout>
      <PageHeader
        title={t('API Tokens')}
        titleHelpTitle={t('API Tokens')}
        titleHelp={t('API tokens used for authentication and authorization in automation.')}
        description={t('API tokens used for authentication and authorization in automation.')}
      />
      <ApiTokensTable />
    </PageLayout>
  );
}
