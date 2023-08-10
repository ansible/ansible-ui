import { useTranslation } from 'react-i18next';
import { PageHeader, PageLayout, PageTable } from '../../../framework';
import { collectionKeyFn, hubAPI } from '../api/utils';
import { useHubView } from '../useHubView';
import { CollectionVersionSearch } from './Approval';
import { useApprovalFilters } from './hooks/useApprovalFilters';
import { useApprovalsColumns } from './hooks/useApprovalsColumns';
import { useApprovalActions } from './hooks/useApprovalActions';
import { useApprovalsActions } from './hooks/useApprovalsActions';

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
