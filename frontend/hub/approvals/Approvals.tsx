import { useTranslation } from 'react-i18next';
import { PageHeader, PageLayout, PageTable } from '../../../framework';
import { useHubView } from '../useHubView';
import { CollectionVersionSearch } from './Approval';
import { useApprovalActions } from './hooks/useApprovalActions';
import { useApprovalFilters } from './hooks/useApprovalFilters';
import { useApprovalsActions } from './hooks/useApprovalsActions';
import { useApprovalsColumns } from './hooks/useApprovalsColumns';
import { hubAPI } from '../api';

export function Approvals() {
  const { t } = useTranslation();
  //const toolbarFilters = useApprovalFilters();
  const tableColumns = useApprovalsColumns();
  const view = useHubView<CollectionVersionSearch>({
    url: hubAPI`/v3/plugin/ansible/search/collection-versions/`,
    keyFn: (item) => item.collection_version.pulp_href,
    tableColumns,
  });
  //const toolbarActions = useApprovalsActions();
  //const rowActions = useApprovalActions(() => void view.refresh());

  return (
    <PageLayout>
      <PageHeader title={t('Collection Approvals')} />
      <PageTable<CollectionVersionSearch>
        tableColumns={tableColumns}
        errorStateTitle={t('Error loading approvals')}
        emptyStateTitle={t('No approvals yet')}
        {...view}
        defaultSubtitle={t('Collection Approval')}
      />
    </PageLayout>
  );
}
