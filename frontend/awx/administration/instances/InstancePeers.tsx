import { Button, ButtonVariant } from '@patternfly/react-core';
import { MinusCircleIcon, PlusCircleIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { IPageAction, PageActionSelection, PageActionType, PageTable } from '../../../../framework';
import { useGetItem } from '../../../common/crud/useGet';
import { awxAPI } from '../../common/api/awx-utils';
import { Instance, Peer } from '../../interfaces/Instance';
import { usePeersTabFilters } from './Instances';
import { PeerColumnId, usePeersColumns } from './hooks/usePeersColumns';
import { useAwxView } from '../../common/useAwxView';
import { useMemo } from 'react';
import { usePeerInstanceModal } from './hooks/useSelectAssociatePeers';
import { useDisassociatePeer } from './hooks/useDisassociatePeer';
import { useAssociatePeersToInstance } from './hooks/useAssociatePeersToInstance';
import { PageTableEmptyState } from '../../../../framework/PageTable/PageTableEmptyState';

export function InstancePeers() {
  const params = useParams<{ id: string }>();
  const { data: instance } = useGetItem<Instance>(awxAPI`/instances`, params.id);

  return instance ? <InstancePeersTab instance={instance} /> : null;
}

export function InstancePeersTab(props: { instance: Instance }) {
  const { instance } = props;
  return <ResourcePeersList url={awxAPI`/instances/${instance.id.toString()}/peers/`} />;
}

const tableColumnsIds: PeerColumnId[] = [
  'instanceName',
  'address',
  'port',
  'nodeType',
  'canonical',
];

export function ResourcePeersList(props: { url: string }) {
  const { t } = useTranslation();
  const { url } = props;
  const toolbarFilters = usePeersTabFilters();
  const columns = usePeersColumns();
  const tableColumns = useMemo(
    () => columns.filter((item) => item.id && tableColumnsIds.includes(item.id as PeerColumnId)),
    [columns]
  );
  const view = useAwxView({
    url: url,
    toolbarFilters,
    tableColumns,
    disableQueryString: true,
  });
  const { id } = useParams<{ id: string }>();

  const associatePeerToInstance = useAssociatePeersToInstance(
    view.unselectItemsAndRefresh,
    id ?? ''
  );
  const openPeerInstanceModal = usePeerInstanceModal();

  const disassociatePeer = useDisassociatePeer(view.unselectItemsAndRefresh, id ?? '');

  const toolbarActions = useMemo<IPageAction<Peer>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.None,
        variant: ButtonVariant.primary,
        isPinned: true,
        icon: PlusCircleIcon,
        label: t('Associate peers'),
        onClick: () =>
          openPeerInstanceModal({ onPeer: associatePeerToInstance, instanceId: id ?? '' }),
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        variant: ButtonVariant.primary,
        icon: MinusCircleIcon,
        label: t('Disassociate peers'),
        onClick: (peers: Peer[]) => disassociatePeer(peers),
        isDanger: true,
      },
    ],
    [openPeerInstanceModal, associatePeerToInstance, disassociatePeer, id, t]
  );

  return (
    <PageTable<Peer>
      toolbarFilters={toolbarFilters}
      toolbarActions={toolbarActions}
      tableColumns={tableColumns}
      errorStateTitle={t('Error loading peers')}
      emptyState={
        <PageTableEmptyState
          title={t('No peers found')}
          description={t('Please associate peers to populate this list.')}
        >
          <Button
            onClick={() =>
              openPeerInstanceModal({ onPeer: associatePeerToInstance, instanceId: id ?? '' })
            }
          >
            {t('Associate peers')}
          </Button>
        </PageTableEmptyState>
      }
      {...view}
    />
  );
}
