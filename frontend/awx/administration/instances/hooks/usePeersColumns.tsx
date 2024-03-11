import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ITableColumn, TextCell, useGetPageUrl } from '../../../../../framework';
import { AwxRoute } from '../../../main/AwxRoutes';
import { useGet, useGetItem } from '../../../../common/crud/useGet';
import { awxAPI } from '../../../common/api/awx-utils';
import { Instance, Peer } from '../../../interfaces/Instance';
import { useParams } from 'react-router-dom';

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

export function usePeersColumns(_options?: { isListenerAddresses?: boolean }) {
  const params = useParams<{ id?: string }>();
  const id = Number(params.id);
  const { data: instance } = useGetItem<Instance>(awxAPI`/instances`, id);

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
        value: (peer) => (_options?.isListenerAddresses ? instance?.hostname : peer.address),
        sort: 'address',
      },
      {
        header: t('Port'),
        type: 'text',
        value: (peer) =>
          _options?.isListenerAddresses
            ? instance?.listener_port?.toString()
            : peer.port?.toString(),
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
        value: (peer) => (_options?.isListenerAddresses ? instance?.protocol : peer.protocol),
        sort: 'protocol',
      },
      {
        header: t('Canonical'),
        type: 'text',
        value: (peer) =>
          _options?.isListenerAddresses
            ? GetCanonical(instance)?.toString()
            : peer.canonical.toString(),
        sort: 'canonical',
      },
    ],
    [_options?.isListenerAddresses, getPageUrl, instance, t]
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
