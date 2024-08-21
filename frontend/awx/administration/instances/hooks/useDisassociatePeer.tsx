import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { compareStrings } from '../../../../../framework';
import { useAddressColumn } from '../../../../common/columns';
import { getItemKey, requestPatch } from '../../../../common/crud/Data';
import { awxAPI } from '../../../common/api/awx-utils';
import { useAwxBulkConfirmation } from '../../../common/useAwxBulkConfirmation';
import { usePeersColumns } from './usePeersColumns';
import { useParams } from 'react-router-dom';
import { Instance, Peer } from '../../../interfaces/Instance';
import { useGetItem } from '../../../../common/crud/useGet';

export function useDisassociatePeer(onComplete: (peers: Peer[]) => void, instanceId: string) {
  const params = useParams<{ id?: string }>();
  const id = Number(params.id);
  const { t } = useTranslation();
  const deleteActionNameColumn = useAddressColumn({ disableLinks: true, disableSort: true });
  const actionColumns = useMemo(() => [deleteActionNameColumn], [deleteActionNameColumn]);
  const bulkAction = useAwxBulkConfirmation<Peer>();

  const columns = usePeersColumns();
  const confirmationColumns = useMemo(
    () =>
      columns.filter((item) =>
        ['Peer name', 'Address', 'Port', 'Node type', 'Protocol'].includes(item.header)
      ),
    [columns]
  );

  const { data: instance } = useGetItem<Instance>(awxAPI`/instances`, instanceId);

  const removeInstances = (peersToRemove: Peer[]) => {
    bulkAction({
      title: t('Disassociate peers', { count: peersToRemove.length }),
      confirmText:
        peersToRemove.length === 1
          ? t('Yes, I confirm that I want to disassociate this peer.')
          : t('Yes, I confirm that I want to disassociate these {{count}} peers.', {
              count: peersToRemove.length,
            }),
      actionButtonText: t('Disassociate peers', { count: peersToRemove.length }),
      items: peersToRemove.sort((l, r) => compareStrings(l.name, r.name)),
      keyFn: getItemKey,
      isDanger: true,
      confirmationColumns,
      actionColumns,
      onComplete,
      actionFn: () => {
        const peersToRemoveIds = peersToRemove.map((peer) => peer.id);
        const resultantPeers = instance?.peers
          ? instance?.peers.filter((currentPeerIds) => !peersToRemoveIds.includes(currentPeerIds))
          : [];
        const res = requestPatch(awxAPI`/instances/${id.toString()}/`, {
          peers: resultantPeers,
        });
        return res;
      },
    });
  };
  return removeInstances;
}
