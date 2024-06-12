import { useCallback, useMemo } from 'react';
import { usePageDialogs } from '../../../../../framework';
import { awxAPI } from '../../../common/api/awx-utils';
import { useAwxView } from '../../../common/useAwxView';
import { Instance } from '../../../interfaces/Instance';
import { usePeersFilters } from '../Instances';
import { MultiSelectDialog } from '../../../../../framework';
import { useTranslation } from 'react-i18next';
import { useInstancesColumns } from './useInstancesColumns';

function SelectPeers(props: {
  isLookup: boolean;
  title: string;
  onSelect: (instances: Instance[]) => void;
}) {
  const toolbarFilters = usePeersFilters();
  const tableColumns = useInstancesColumns({ disableLinks: true });
  const columns = useMemo(
    () =>
      props.isLookup
        ? tableColumns.filter((item) => ['Name', 'Node type'].includes(item.header))
        : tableColumns,
    [tableColumns, props.isLookup]
  );

  const view = useAwxView<Instance>({
    url: awxAPI`/instances/`,
    toolbarFilters,
    tableColumns: columns,
    disableQueryString: true,
    queryParams: {
      not__node_type: 'control',
    },
  });

  return (
    <MultiSelectDialog
      {...props}
      toolbarFilters={toolbarFilters}
      tableColumns={columns}
      view={view}
    />
  );
}

export function useMultiSelectPeer() {
  const { pushDialog } = usePageDialogs();
  const { t } = useTranslation();
  const openSelectPeers = useCallback(
    (onSelect: (instances: Instance[]) => void) => {
      pushDialog(<SelectPeers onSelect={onSelect} isLookup={true} title={t('Select peers')} />);
    },
    [pushDialog, t]
  );
  return openSelectPeers;
}
