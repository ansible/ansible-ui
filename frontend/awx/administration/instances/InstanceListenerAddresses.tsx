import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { PageTable } from '../../../../framework';
import { awxAPI } from '../../common/api/awx-utils';
import { usePeersFilters } from './Instances';
import { usePeersColumns } from './hooks/usePeersColumns';
import { useAwxView } from '../../common/useAwxView';
import { useMemo } from 'react';
import { Instance, Peer } from '../../interfaces/Instance';
import { useGetItem } from '../../../common/crud/useGet';

export function InstanceListenerAddresses() {
  const { t } = useTranslation();
  const { id } = useParams<{ id?: string }>();
  const { data: instance } = useGetItem<Instance>(awxAPI`/instances`, id);
  const toolbarFilters = usePeersFilters();
  const columns = usePeersColumns({ isListenerAddresses: true });
  const tableColumns = useMemo(
    () =>
      columns.filter((item) => ['Address', 'Port', 'Protocol', 'Canonical'].includes(item.header)),
    [columns]
  );
  const instanceName = instance?.hostname as string;
  const view = useAwxView<Peer>({
    url: awxAPI`/instances/`,
    toolbarFilters,
    tableColumns,
    queryParams: {
      order_by: 'hostname',
      hostname: instanceName,
    },
    disableQueryString: true,
  });

  return (
    <PageTable<Peer>
      tableColumns={tableColumns}
      errorStateTitle={t('Error loading listener addresses')}
      emptyStateTitle={t('No listener addresses found')}
      emptyStateDescription={t('Please add Listener Addresses to populate this list.')}
      {...(instance?.listener_port
        ? view
        : {
            itemCount: 0,
            keyFn: () => '',
            perPage: 0,
            pageItems: [],
            page: 0,
            setPage: () => {},
            setPerPage: () => {},
          })}
    />
  );
}
