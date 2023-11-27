import { useTranslation } from 'react-i18next';
import { PageHeader, PageLayout, PageTable } from '../../../framework';
import { collectionKeyFn } from '../api/utils';
import { hubAPI } from '../api/formatPath';
import { useHubView } from '../useHubView';
import { CollectionVersionSearch } from './Approval';
import { useApprovalActions } from './hooks/useApprovalActions';
import { useApprovalFilters } from './hooks/useApprovalFilters';
import { useApprovalsActions } from './hooks/useApprovalsActions';
import { useApprovalsColumns } from './hooks/useApprovalsColumns';

export function Approvals() {
  const { t } = useTranslation();
  const toolbarFilters = useApprovalFilters();
  const tableColumns = useApprovalsColumns();

  const view = useHubView<CollectionVersionSearch>({
    url: hubAPI`/v3/plugin/ansible/search/collection-versions/`,
    keyFn: collectionKeyFn,
    tableColumns,
    toolbarFilters,
    sortKey: 'order_by',
    defaultFilters: { status: ['pipeline=staging'] },
  });

  const rowActions = useApprovalActions(view.unselectItemsAndRefresh);
  const toolbarActions = useApprovalsActions(view.unselectItemsAndRefresh);

  return (
    <PageLayout>
      <PageHeader title={t('Collection Approvals')} />
      <PageTable<CollectionVersionSearch>
        id="hub-collection-version-search-table"
        toolbarFilters={toolbarFilters}
        tableColumns={tableColumns}
        rowActions={rowActions}
        toolbarActions={toolbarActions}
        errorStateTitle={t('Error loading approvals')}
        emptyStateTitle={t('No approvals yet')}
        {...view}
        defaultSubtitle={t('Collection Approval')}
      />
    </PageLayout>
  );
}
