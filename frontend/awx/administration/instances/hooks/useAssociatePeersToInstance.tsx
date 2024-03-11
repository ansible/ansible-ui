import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAwxBulkActionDialog } from '../../../common/useAwxBulkActionDialog';
import { requestGet, requestPatch } from '../../../../common/crud/Data';
import { awxAPI } from '../../../common/api/awx-utils';
import { useParams } from 'react-router-dom';
import { Instance, Peer } from '../../../interfaces/Instance';

export function useAssociatePeersToInstance() {
  const [data, setData] = useState<Instance>();
  const { t } = useTranslation();
  const userProgressDialog = useAwxBulkActionDialog<Peer>();
  const params = useParams<{ id?: string }>();
  const id = Number(params.id);
  const { peers = [] } = data ?? {};

  useMemo(() => {
    if (!peers) return;
    requestGet<Instance>(awxAPI`/instances/${id.toString()}/`)
      .then((res) => {
        setData(res);
      })
      .catch(() => {
        setData(undefined);
      });
  }, [id, peers]);

  const addPeersToInstance = useCallback(
    (instances: Peer[], onComplete: () => void) => {
      if (instances) {
        for (const p of instances) {
          if (!peers.includes(p.id)) {
            peers.push(p.id);
          }
        }

        userProgressDialog({
          title: t('Associating {{count}} peers', { count: instances.length }),
          keyFn: (peer: Peer) => peer.id,
          items: instances,
          actionColumns: [{ header: 'Name', cell: (peer: Peer) => peer.address }],
          actionFn: () =>
            requestPatch(awxAPI`/instances/${id.toString()}/`, {
              peers: peers,
            }),
          processingText: t('Associating {{count}} peers...', { count: instances.length }),
          onComplete,
        });
      }
    },
    [userProgressDialog, t, id, peers]
  );
  return addPeersToInstance;
}
