import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  PageLayout,
  PageTable,
} from '@ansible/ansible-ui-framework';
import { Token } from '@ansible/awx-ui/interfaces/Token';
import { TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { usePlatformView } from '../../../hooks/usePlatformView';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import { useDeleteTokens } from '../hooks/useDeleteTokens';
import { useTokensColumns } from '../hooks/useTokensColumns';
import { useTokensFilters } from '../hooks/useTokensFilters';

export function PlatformApplicationPageTokens() {
  const { t } = useTranslation();
  const tableColumns = useTokensColumns();
  const toolbarFilters = useTokensFilters();
  const params = useParams<{ id: string }>();
  const view = usePlatformView<Token>({
    url: gatewayAPI`/applications/${params.id ?? ''}/tokens/`,
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
        label: t('Delete tokens'),
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
        emptyStateTitle={t('There are currently no tokens associated with this OAuth application')}
        emptyStateDescription={t(
          'When a user authorizes using an OAuth application, a token will be created and displayed here.'
        )}
        {...view}
        defaultSubtitle={t('Token')}
      />
    </PageLayout>
  );
}
