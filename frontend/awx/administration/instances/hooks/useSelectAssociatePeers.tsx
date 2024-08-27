import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MultiSelectDialog, usePageDialogs } from '../../../../../framework';
import { usePeersTabFilters } from '../Instances';
import { awxAPI } from '../../../common/api/awx-utils';
import { QueryParams, useAwxView } from '../../../common/useAwxView';
import { usePeersColumns } from './usePeersColumns';
import { useGetItem } from '../../../../common/crud/useGet';
import { Peer, Instance } from '../../../interfaces/Instance';
import { useAwxGetAllPages } from '../../../common/useAwxGetAllPages';

export interface PeerInstanceModalProps {
  instanceId: string;
  onPeer: (peers: Peer[]) => void;
}

function PeerInstanceModal(props: PeerInstanceModalProps) {
  const { t } = useTranslation();
  const { instanceId, onPeer } = props;

  const toolbarFilters = usePeersTabFilters();
  const columns = usePeersColumns();
  const tableColumns = useMemo(
    () =>
      columns.filter((item) =>
        ['Instance name', 'Address', 'Port', 'Node type', 'Protocol'].includes(item.header)
      ),
    [columns]
  );

  const { results: receptors } = useAwxGetAllPages<Peer>(awxAPI`/receptor_addresses/`);
  const { results: instances } = useAwxGetAllPages<Instance>(awxAPI`/instances`, {
    not__node_type: ['control', 'hybird'],
  });

  const { data: instance } = useGetItem<Instance>(awxAPI`/instances/`, instanceId);

  const peeredInstanceIds = instance?.peers?.map((peer) => String(peer)) ?? [];

  let peeredReceptorIds: string[] = [];

  if (receptors && instance && !instance.managed && instances) {
    const filteredReceptors = receptors.filter(
      (receptor) =>
        !peeredInstanceIds.includes(String(receptor.instance)) &&
        !instance.peers?.includes(receptor.id) &&
        !(instance.id === receptor.instance) &&
        !receptor.is_internal &&
        instances &&
        instances.some((instance) => instance.id === receptor.instance)
    );

    peeredReceptorIds = filteredReceptors.map((receptor) => String(receptor.instance));
  }

  const queryParams: QueryParams = {
    is_internal: 'false',
    order_by: 'address',
    not__instance: [String(instance?.id ?? '')],
  };

  if (peeredInstanceIds.length > 0) queryParams['not__id__in'] = peeredInstanceIds;

  if (peeredReceptorIds.length > 0)
    queryParams['not__instance'] = [...queryParams.not__instance, ...peeredReceptorIds];

  const view = useAwxView<Peer>({
    url: awxAPI`/receptor_addresses/`,
    toolbarFilters,
    tableColumns,
    disableQueryString: true,
    queryParams: queryParams,
  });

  return (
    <MultiSelectDialog
      title={t('Select peer addresses')}
      onSelect={onPeer}
      toolbarFilters={toolbarFilters}
      tableColumns={tableColumns}
      view={view}
      confirmText={t('Associate peers')}
    />
  );
}

export function usePeerInstanceModal() {
  const { pushDialog, popDialog } = usePageDialogs();
  const [props, setProps] = useState<PeerInstanceModalProps>();

  useEffect(() => {
    if (props) {
      pushDialog(<PeerInstanceModal {...props} />);
    } else {
      popDialog();
    }
  }, [props, pushDialog, popDialog]);
  return setProps;
}
