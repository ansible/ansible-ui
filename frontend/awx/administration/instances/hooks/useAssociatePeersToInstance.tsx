import { requestPatch } from '@ansible/common-ui/crud/Data';
import { useGetItem } from '@ansible/common-ui/crud/useGet';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { awxAPI } from '../../../common/api/awx-utils';
import { useAwxBulkActionDialog } from '../../../common/useAwxBulkActionDialog';
import { Instance, Peer } from '../../../interfaces/Instance';

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
        actionColumns: [{ header: t('Name'), cell: (peer: Peer) => peer.address }],
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
