import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { compareStrings } from '../../../../../framework';
import { useAddressColumn } from '../../../../common/columns';
import { getItemKey, requestPatch } from '../../../../common/crud/Data';
import { awxAPI } from '../../../common/api/awx-utils';
import { useAwxBulkConfirmation } from '../../../common/useAwxBulkConfirmation';
import { Peer } from '../../../interfaces/Peer';
import { usePeersColumns } from './usePeersColumns';
import { useParams } from 'react-router-dom';
import { useGetItem } from '../../../../common/crud/useGet';
import { Instance } from '../../../interfaces/Instance';

export function useDisassociatePeer(onComplete: (peers: Peer[]) => void) {
  const params = useParams<{ id?: string }>();
  const id = Number(params.id);
  const { data: instance } = useGetItem<Instance>(awxAPI`/instances`, id);
  const px = instance?.peers as number[];

  const columns = usePeersColumns(undefined);
  const confirmationColumns = useMemo(
    () =>
      columns.filter((item) =>
        ['Peer name', 'Address', 'Port', 'Node type', 'Protocol'].includes(item.header)
      ),
    [columns]
  );

  const { t } = useTranslation();

  const deleteActionNameColumn = useAddressColumn({ disableLinks: true, disableSort: true });
  const actionColumns = useMemo(() => [deleteActionNameColumn], [deleteActionNameColumn]);
  const bulkAction = useAwxBulkConfirmation<Peer>();
  const removeInstances = (peers: Peer[]) => {
    for (const p of peers) {
      if (px.includes(p.id)) {
        px.splice(px.indexOf(p.id), 1);
      }
    }
    bulkAction({
      title: t('Disassociate peers', { count: peers.length }),
      confirmText:
        peers.length === 1
          ? t('Yes, I confirm that I want to disassociate this peer.')
          : t('Yes, I confirm that I want to disassociate these {{count}} peers.', {
              count: peers.length,
            }),
      actionButtonText: t('Disassociate peer', { count: peers.length }),
      items: peers.sort((l, r) => compareStrings(l.name, r.name)),
      keyFn: getItemKey,
      isDanger: true,
      confirmationColumns,
      actionColumns,
      onComplete,
      actionFn: () =>
        requestPatch(awxAPI`/instances/${id.toString()}/`, {
          peers: px,
        }),
    });
  };
  return removeInstances;
}
