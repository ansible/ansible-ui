import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IToolbarFilter, PageHeader, PageLayout, PageTable } from '../../../../framework';
import { ActivityStreamIcon } from '../../common/ActivityStreamIcon';
import { awxAPI } from '../../common/api/awx-utils';
import {
  useAddressToolbarFilter,
  useHostnameToolbarFilter,
} from '../../common/awx-toolbar-filters';
import { useAwxView } from '../../common/useAwxView';
import { Instance } from '../../interfaces/Instance';
import { useInstanceRowActions } from './hooks/useInstanceRowActions';
import { useInstanceToolbarActions } from './hooks/useInstanceToolbarActions';
import { useInstancesColumns } from './hooks/useInstancesColumns';
import { useInstancesFilters } from './hooks/useInstancesFilter';

export function Instances() {
  const { t } = useTranslation();
  const toolbarFilters = useInstancesFilters();
  const tableColumns = useInstancesColumns();
  const defaultParams: {
    not__node_type: string;
  } = {
    not__node_type: 'control,hybrid',
  };

  const view = useAwxView<Instance>({
    url: awxAPI`/instances/`,
    toolbarFilters,
    tableColumns,
    queryParams: defaultParams,
  });
  const toolbarActions = useInstanceToolbarActions(view);
  const rowActions = useInstanceRowActions(view.unselectItemsAndRefresh);

  return (
    <PageLayout>
      <PageHeader
        title={t('Instances')}
        description={t(
          'Ansible node instances dedicated for a particular purpose indicated by node type.'
        )}
        headerActions={<ActivityStreamIcon type={'instance'} />}
      />
      <PageTable<Instance>
        id="awx-instances-table"
        toolbarFilters={toolbarFilters}
        toolbarActions={toolbarActions}
        tableColumns={tableColumns}
        rowActions={rowActions}
        errorStateTitle={t('Error loading instances')}
        emptyStateTitle={t('No instances yet')}
        {...view}
      />
    </PageLayout>
  );
}

export function usePeersFilters() {
  const hostnameToolbarFilter = useHostnameToolbarFilter();

  const toolbarFilters = useMemo<IToolbarFilter[]>(
    () => [hostnameToolbarFilter],
    [hostnameToolbarFilter]
  );
  return toolbarFilters;
}

export function usePeersTabFilters() {
  const addressToolbarFilter = useAddressToolbarFilter();

  const toolbarFilters = useMemo<IToolbarFilter[]>(
    () => [addressToolbarFilter],
    [addressToolbarFilter]
  );
  return toolbarFilters;
}
