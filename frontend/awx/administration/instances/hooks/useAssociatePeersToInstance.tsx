import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAwxBulkActionDialog } from '../../../common/useAwxBulkActionDialog';
import { requestPatch } from '../../../../common/crud/Data';
import { awxAPI } from '../../../common/api/awx-utils';
import { useParams } from 'react-router-dom';
import { useGetItem } from '../../../../common/crud/useGet';
import { Peer } from '../../../interfaces/Instance';

export function useAssociatePeersToInstance() {
  const { t } = useTranslation();
  const userProgressDialog = useAwxBulkActionDialog<Peer>();
  const params = useParams<{ id?: string }>();
  const id = Number(params.id);
  const { data: instance } = useGetItem<Peer>(awxAPI`/instances/`, params.id);
  const px = instance?.peers as number[];

  const addPeersToInstance = useCallback(
    (instances: Peer[], onComplete: () => void) => {
      if (instances) {
        for (const p of instances) {
          if (!px.includes(p.id)) {
            px.push(p.id);
          }
        }

        userProgressDialog({
          title: t('Associating {{count}} peers', { count: instances.length }),
          keyFn: (peer: Peer) => peer.id,
          items: instances,
          actionColumns: [{ header: 'Name', cell: (peer: Peer) => peer.address }],
          actionFn: () =>
            requestPatch(awxAPI`/instances/${id.toString()}/`, {
              peers: px,
            }),
          processingText: t('Associating {{count}} peers...', { count: instances.length }),
          onComplete,
        });
      }
    },
    [userProgressDialog, t, id, px]
  );
  return addPeersToInstance;
}
