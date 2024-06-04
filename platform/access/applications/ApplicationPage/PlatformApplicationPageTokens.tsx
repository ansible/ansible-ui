import { TrashIcon } from '@patternfly/react-icons';
import { Token } from '../../../../frontend/awx/interfaces/Token';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  PageLayout,
  PageTable,
} from '../../../../framework';
import { useTokensColumns } from '../../../../frontend/awx/administration/applications/hooks/useTokensColumns';
import { useTokensFilters } from '../../../../frontend/awx/administration/applications/hooks/useTokensFilters';
import { gatewayV1API } from '../../../api/gateway-api-utils';
import { useDeleteTokens } from '../hooks/useDeleteTokens';
import { usePlatformView } from '../../../hooks/usePlatformView';

export function PlatformApplicationPageTokens() {
  const { t } = useTranslation();
  const tableColumns = useTokensColumns();
  const toolbarFilters = useTokensFilters();
  const params = useParams<{ id: string }>();
  const view = usePlatformView<Token>({
    url: gatewayV1API`/applications/${params.id ?? ''}/tokens/`,
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
      <PageTable<Token>
        id="platform-applications-token-table"
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
