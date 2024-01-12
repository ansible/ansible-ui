import { TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  PageHeader,
  PageLayout,
  PageTable,
} from '../../../../../framework';
import { awxAPI } from '../../../common/api/awx-utils';
import { useAwxConfig } from '../../../common/useAwxConfig';
import { useAwxView } from '../../../common/useAwxView';
import { getDocsBaseUrl } from '../../../common/util/getDocsBaseUrl';
import { Token } from '../../../interfaces/Token';
import { useDeleteTokens } from '../hooks/useDeleteTokens';
import { useTokensColumns } from '../hooks/useTokensColumns';
import { useTokensFilters } from '../hooks/useTokensFilters';

export function ApplicationTokens() {
  const { t } = useTranslation();
  const config = useAwxConfig();
  const tableColumns = useTokensColumns();
  const toolbarFilters = useTokensFilters();
  const params = useParams<{ id: string }>();
  const view = useAwxView<Token>({
    url: awxAPI`/applications/${params.id ?? ''}/tokens`,
    tableColumns,
    toolbarFilters,
  });
  const deleteTokens = useDeleteTokens(view.unselectItemsAndRefresh);

  const toolbarActions = useMemo<IPageAction<Token>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: TrashIcon,
        label: t('Delete selected tokens'),
        onClick: deleteTokens,
        isDanger: true,
      },
    ],
    [deleteTokens, t]
  );

  const rowActions = useMemo<IPageAction<Token>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Delete token'),
        onClick: (token) => deleteTokens([token]),
        isDanger: true,
      },
    ],
    [t, deleteTokens]
  );

  return (
    <PageLayout>
      <PageHeader
        title={t('Application Tokens')}
        description={t('List of access tokens associated with this application.')}
        titleHelpTitle={t('Application Tokens')}
        titleHelp={t('List of access tokens associated with this application.')}
        titleDocLink={`${getDocsBaseUrl(config)}/html/userguide/applications_auth.html`}
      />
      <PageTable<Token>
        id="awx-applications-token-table"
        toolbarFilters={toolbarFilters}
        toolbarActions={toolbarActions}
        tableColumns={tableColumns}
        rowActions={rowActions}
        errorStateTitle={t('Error loading tokens')}
        emptyStateTitle={t('There are currently no tokens associated with this application')}
        emptyStateDescription={t('You can create a token from your user page.')}
        {...view}
        defaultSubtitle={t('Token')}
      />
    </PageLayout>
  );
}
