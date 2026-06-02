import { PageTable, PageLayoutWithUnauthorized } from '@ansible/ansible-ui-framework';
import { useGetDocsUrl } from '@ansible/common-ui/utils/useGetDocsUrl';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { hubAPI } from '../../common/api/formatPath';
import { collectionKeyFn } from '../../common/api/hub-api-utils';
import { filterInsightsBulkActions } from '../../common/isInsights';
import { isInsightsMode } from '../../common/isInsights';
import { useHubConfig } from '../../common/useHubConfig';
import { useHubContext } from '../../common/useHubContext';
import { useHubView } from '../../common/useHubView';
import { isAccessDeniedError } from '../../common/utils/errorUtils';
import { CollectionVersionSearch } from './Approval';
import { useApprovalActions } from './hooks/useApprovalActions';
import { useApprovalFilters } from './hooks/useApprovalFilters';
import { useApprovalsActions } from './hooks/useApprovalsActions';
import { useApprovalsColumns } from './hooks/useApprovalsColumns';

export function Approvals() {
  const { t } = useTranslation();
  const toolbarFilters = useApprovalFilters();
  const tableColumns = useApprovalsColumns();
  const config = useHubConfig();
  const docsUrl = useGetDocsUrl(config, 'collectionApprovals');
  const { hasPermission, user } = useHubContext();

  const isInsights = isInsightsMode();
  const canModifyRepoContent =
    !isInsights || hasPermission('ansible.modify_ansible_repo_content') || !!user?.is_superuser;

  const view = useHubView<CollectionVersionSearch>({
    url: canModifyRepoContent ? hubAPI`/v3/plugin/ansible/search/collection-versions/` : '',
    keyFn: collectionKeyFn,
    tableColumns,
    toolbarFilters,
    defaultFilters: { status: ['pipeline=staging'] },
  });

  const rowActions = useApprovalActions(view.unselectItemsAndRefresh);
  const allToolbarActions = useApprovalsActions(view.unselectItemsAndRefresh);
  const toolbarActions = useMemo(
    () => filterInsightsBulkActions(allToolbarActions),
    [allToolbarActions]
  );

  const isUnauthorized = !canModifyRepoContent || isAccessDeniedError(view.error);

  const description = t(
    'Collection approvals enable administrators to manage and authorize Ansible content for organizational use.'
  );

  return (
    <PageLayoutWithUnauthorized
      isUnauthorized={isUnauthorized}
      resourceName={t('Collection Approvals')}
      title={t('Collection Approvals')}
      description={description}
      titleHelpTitle={t('Collection Approvals')}
      titleHelp={description}
      titleDocLink={docsUrl}
    >
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
    </PageLayoutWithUnauthorized>
  );
}
