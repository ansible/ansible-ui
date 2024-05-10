import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MultiSelectDialog, usePageDialogs } from '../../../../../framework';
import { usePeersTabFilters } from '../Instances';
import { awxAPI } from '../../../common/api/awx-utils';
import { useAwxView } from '../../../common/useAwxView';
import { usePeersColumns } from './usePeersColumns';
import { useGetItem } from '../../../../common/crud/useGet';
import { useParams } from 'react-router-dom';
import { Peer, Instance } from '../../../interfaces/Instance';

export interface PeerInstanceModalProps {
  accessUrl?: string;
  onPeer: (peers: Peer[]) => void;
  confirmText?: string;
}

function PeerInstanceModal(props: PeerInstanceModalProps) {
  const { t } = useTranslation();
  const params = useParams<{ id?: string }>();
  const { data: instance } = useGetItem<Instance>(awxAPI`/instances/`, params.id);

  const toolbarFilters = usePeersTabFilters();
  const columns = usePeersColumns();
  const tableColumns = useMemo(
    () =>
      columns.filter((item) =>
        ['Instance name', 'Address', 'Port', 'Node type', 'Protocol'].includes(item.header)
      ),
    [columns]
  );

  const { onPeer } = props;

  const instanceName = instance?.hostname as string;
  const view = useAwxView<Peer>({
    url: awxAPI`/receptor_addresses/`,
    toolbarFilters,
    tableColumns,
    disableQueryString: true,
    queryParams: {
      not__address: instanceName,
    },
  });

  return (
    <MultiSelectDialog
      title={t('Select Peer Addresses')}
      onSelect={onPeer}
      toolbarFilters={toolbarFilters}
      tableColumns={tableColumns}
      view={view}
      confirmText={t('Associate peer(s)')}
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
