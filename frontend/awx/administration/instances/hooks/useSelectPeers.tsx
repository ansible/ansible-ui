import { useCallback, useMemo } from 'react';
import { usePageDialog } from '../../../../../framework';
import { awxAPI } from '../../../common/api/awx-utils';
import { useAwxView } from '../../../common/useAwxView';
import { Instance } from '../../../interfaces/Instance';
import { usePeersFilters } from '../Instances';
import { usePeersColumns } from './usePeersColumns';
import { MultiSelectDialog } from '../../../../../framework';
import { useTranslation } from 'react-i18next';

function SelectPeers(props: {
  isLookup: boolean;
  title: string;
  onSelect: (instances: Instance[]) => void;
}) {
  const toolbarFilters = usePeersFilters();
  const tableColumns = usePeersColumns();
  const columns = useMemo(
    () =>
      props.isLookup
        ? tableColumns.filter((item) => ['Host name', 'Node type'].includes(item.header))
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
      tableColumns={tableColumns}
      view={view}
    />
  );
}

export function useMultiSelectPeer() {
  const [_, setDialog] = usePageDialog();
  const { t } = useTranslation();
  const openSelectPeers = useCallback(
    (onSelect: (instances: Instance[]) => void) => {
      setDialog(<SelectPeers onSelect={onSelect} isLookup={true} title={t('Select peers')} />);
    },
    [setDialog, t]
  );
  return openSelectPeers;
}
