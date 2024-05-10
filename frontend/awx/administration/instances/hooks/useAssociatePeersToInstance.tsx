import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAwxBulkActionDialog } from '../../../common/useAwxBulkActionDialog';
import { requestPatch } from '../../../../common/crud/Data';
import { awxAPI } from '../../../common/api/awx-utils';
import { Instance, Peer } from '../../../interfaces/Instance';
import { useGetItem } from '../../../../common/crud/useGet';

export function useAssociatePeersToInstance(
  onComplete: (peers: Peer[]) => void,
  instanceId: string
) {
  const { t } = useTranslation();
  const bulkAction = useAwxBulkActionDialog<Peer>();

  const { data: instance } = useGetItem<Instance>(awxAPI`/instances`, instanceId);

  const addPeersToInstance = useCallback(
    (peers: Peer[]) => {
      bulkAction({
        title: t('Associating {{count}} peers', { count: peers.length }),
        keyFn: (peer: Peer) => peer.id,
        items: peers,
        actionColumns: [{ header: 'Name', cell: (peer: Peer) => peer.address }],
        actionFn: () => {
          const peerIds = peers.map((peer) => peer.id);
          const res = requestPatch(awxAPI`/instances/${instanceId}/`, {
            peers: instance?.peers ? [...instance.peers, ...peerIds] : peerIds,
          });
          return res;
        },
        processingText: t('Associating {{count}} peers...', { count: peers.length }),
        onComplete,
      });
    },
    [bulkAction, t, onComplete, instanceId, instance]
  );
  return addPeersToInstance;
}
