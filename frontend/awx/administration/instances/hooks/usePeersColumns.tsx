import { ITableColumn, TextCell, useGetPageUrl } from '@ansible/ansible-ui-framework';
import { useGet, useGetItem } from '@ansible/common-ui/crud/useGet';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { awxAPI } from '../../../common/api/awx-utils';
import { Instance, Peer } from '../../../interfaces/Instance';
import { AwxRoute } from '../../../main/AwxRoutes';

export interface ReceptorAddresses {
  results: [
    {
      id: number;
      url: string;
      address: string;
      port: number;
      protocol: string;
      websocket_path: string;
      is_internal: boolean;
      canonical: boolean;
      instance: number;
      peers_from_control_nodes: boolean;
      full_address: string;
    },
  ];
}

export type PeerColumnId =
  | 'instanceName'
  | 'address'
  | 'port'
  | 'nodeType'
  | 'protocol'
  | 'canonical';

export function usePeersColumns(options?: {
  disableLinks?: boolean;
  isListenerAddresses?: boolean;
}) {
  const params = useParams<{ id?: string }>();
  const id = Number(params.id);
  const { data: instance } = useGetItem<Instance>(awxAPI`/instances`, id);

  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const tableColumns = useMemo<ITableColumn<Peer>[]>(
    () => [
      {
        header: t('Instance name'),
        id: 'instanceName' as PeerColumnId,
        cell: (peer) => (
          <TextCell
            text={peer.address}
            to={
              !options?.disableLinks
                ? getPageUrl(AwxRoute.InstanceDetails, { params: { id: peer.instance } })
                : undefined
            }
          />
        ),
        card: 'name',
        list: 'name',
        sort: 'pk',
        maxWidth: 200,
      },
      {
        header: t('Address'),
        id: 'address' as PeerColumnId,
        type: 'text',
        value: (peer) => (options?.isListenerAddresses ? instance?.hostname : peer.address),
        sort: 'address',
      },
      {
        header: t('Port'),
        id: 'port' as PeerColumnId,
        type: 'text',
        value: (peer) =>
          options?.isListenerAddresses
            ? instance?.listener_port?.toString()
            : peer.port?.toString(),
        sort: 'port',
      },
      {
        header: t('Node type'),
        id: 'nodeType' as PeerColumnId,
        type: 'text',
        value: (peer) => GetNodeTypePeer(peer),
        sort: undefined,
      },
      {
        header: t('Protocol'),
        id: 'protocol' as PeerColumnId,
        type: 'text',
        value: (peer) => (options?.isListenerAddresses ? instance?.protocol : peer.protocol),
        sort: 'protocol',
      },
      {
        header: t('Canonical'),
        id: 'canonical' as PeerColumnId,
        type: 'text',
        value: (peer) =>
          options?.isListenerAddresses
            ? GetCanonical(instance)?.toString()
            : peer.canonical.toString(),
        sort: 'canonical',
      },
    ],
    [options?.isListenerAddresses, options?.disableLinks, getPageUrl, instance, t]
  );
  return tableColumns;
}

export function GetNodeTypePeer(peer: Peer) {
  const { data: instance } = useGet<Instance>(awxAPI`/instances/${peer.instance.toString()}/`);
  return instance?.node_type;
}

export function GetCanonical(instance?: Instance) {
  const { data: receptor_addresses } = useGet<ReceptorAddresses>(awxAPI`/receptor_addresses/`);
  const canonical = receptor_addresses?.results.find(
    (element) => element.address === instance?.hostname
  );
  return canonical?.canonical;
}
