import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ITableColumn, TextCell, useGetPageUrl } from '../../../../../framework';
import { AwxRoute } from '../../../main/AwxRoutes';
import { useGet } from '../../../../common/crud/useGet';
import { awxAPI } from '../../../common/api/awx-utils';
import { Instance } from '../../../interfaces/Instance';
import { Peer } from '../../../interfaces/Peer';

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

export interface ReceptorAddress {
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
}

export function usePeersColumns(_options?: { disableLinks?: boolean; disableSort?: boolean }) {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const tableColumns = useMemo<ITableColumn<Peer>[]>(
    () => [
      {
        header: t('Instance name'),
        cell: (peer) => (
          <TextCell
            text={peer.address}
            to={getPageUrl(AwxRoute.InstanceDetails, { params: { id: peer.instance } })}
          />
        ),
        card: 'name',
        list: 'name',
        sort: 'pk',
        maxWidth: 200,
      },
      {
        header: t('Address'),
        type: 'text',
        value: (peer) => peer.address,
        sort: 'address',
      },
      {
        header: t('Port'),
        type: 'text',
        value: (peer) => peer.port.toString(),
        sort: 'port',
      },
      {
        header: t('Node type'),
        type: 'text',
        value: (peer) => GetNodeTypePeer(peer),
        sort: undefined,
      },
      {
        header: t('Canonical'),
        type: 'text',
        value: (peer) => peer.canonical.toString(),
        sort: 'canonical',
      },
    ],
    [getPageUrl, t]
  );
  return tableColumns;
}

export function usePeersToAssociateColumns(_options?: {
  disableLinks?: boolean;
  disableSort?: boolean;
}) {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const tableColumns = useMemo<ITableColumn<Peer>[]>(
    () => [
      {
        header: t('Instance name'),
        cell: (peer) => (
          <TextCell
            text={peer.address}
            to={getPageUrl(AwxRoute.InstanceDetails, { params: { id: peer.instance } })}
          />
        ),
        card: 'name',
        list: 'name',
        sort: 'pk',
        maxWidth: 200,
      },
      {
        header: t('Address'),
        type: 'text',
        value: (peer) => peer.address,
        sort: 'address',
      },
      {
        header: t('Port'),
        type: 'text',
        value: (peer) => peer.port.toString(),
        sort: 'port',
      },
      {
        header: t('Node type'),
        type: 'text',
        value: (peer) => GetNodeTypePeer(peer),
        sort: undefined,
      },
      {
        header: t('Protocol'),
        type: 'text',
        value: (peer) => peer.protocol,
        sort: 'protocol',
      },
    ],
    [getPageUrl, t]
  );
  return tableColumns;
}

export function GetNodeTypePeer(peer: Peer) {
  const { data: instance } = useGet<Instance>(awxAPI`/instances/${peer.instance.toString()}/`);
  return instance?.node_type;
}
