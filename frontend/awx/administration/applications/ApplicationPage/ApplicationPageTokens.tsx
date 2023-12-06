import { useTranslation } from 'react-i18next';
import { PageHeader, PageLayout, PageTable } from '../../../../../framework';
import { useAwxView } from '../../../useAwxView';
import { useAwxConfig } from '../../../common/useAwxConfig';
import getDocsBaseUrl from '../../../common/util/getDocsBaseUrl';
import { useTokensColumns } from '../hooks/useTokensColumns';
import { awxAPI } from '../../../api/awx-utils';
import { Token } from '../../../interfaces/Token';
import { useParams } from 'react-router-dom';

export function ApplicationTokens() {
  const { t } = useTranslation();
  const config = useAwxConfig();
  const tableColumns = useTokensColumns();
  const params = useParams<{ id: string }>();
  const view = useAwxView<Token>({
    url: awxAPI`/applications/${params.id ?? ''}/tokens`,
    tableColumns,
  });

  return (
    <PageLayout>
      <PageHeader
        title={t('Application Tokens')}
        description={t('List of access tokens associated with this application.')}
        titleHelpTitle={t('Applications')}
        titleHelp={t('List of access tokens associated with this application.')}
        titleDocLink={`${getDocsBaseUrl(config)}/html/userguide/applications_auth.html`}
      />
      <PageTable<Token>
        id="awx-applications-token-table"
        tableColumns={tableColumns}
        errorStateTitle={t('Error loading applications')}
        emptyStateTitle={t('There are currently no tokens associated with this application')}
        emptyStateDescription={t('Please create an application by using the button below.')}
        {...view}
        defaultSubtitle={t('Tokens')}
      />
    </PageLayout>
  );
}
