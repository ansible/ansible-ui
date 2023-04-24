import { useTranslation } from 'react-i18next';
import { PageHeader, PageLayout, PageTable } from '../../../../framework';
import { idKeyFn, useHubView } from '../../useHubView';
import { Approval } from './Approval';
import { useApprovalActions } from './hooks/useApprovalActions';
import { useApprovalFilters } from './hooks/useApprovalFilters';
import { useApprovalsActions } from './hooks/useApprovalsActions';
import { useApprovalsColumns } from './hooks/useApprovalsColumns';

export function Approvals() {
  const { t } = useTranslation();
  const toolbarFilters = useApprovalFilters();
  const tableColumns = useApprovalsColumns();
  const view = useHubView<Approval>(
    '/api/automation-hub/_ui/v1/collection-versions/',
    idKeyFn,
    toolbarFilters,
    tableColumns
  );
  const toolbarActions = useApprovalsActions();
  const rowActions = useApprovalActions(() => void view.refresh());
  return (
    <PageLayout>
      <PageHeader title={t('Collection Approvals')} />
      <PageTable<Approval>
        toolbarFilters={toolbarFilters}
        tableColumns={tableColumns}
        toolbarActions={toolbarActions}
        rowActions={rowActions}
        errorStateTitle={t('Error loading approvals')}
        emptyStateTitle={t('No approvals yet')}
        {...view}
        defaultSubtitle={t('Collection Approval')}
      />
    </PageLayout>
  );
}
