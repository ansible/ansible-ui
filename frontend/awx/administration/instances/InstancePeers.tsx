import { ButtonVariant } from '@patternfly/react-core';
import { MinusCircleIcon, PlusCircleIcon, PlusIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { IPageAction, PageActionSelection, PageActionType, PageTable } from '../../../../framework';
import { useGetItem } from '../../../common/crud/useGet';
import { awxAPI } from '../../common/api/awx-utils';
import { Instance, Peer } from '../../interfaces/Instance';
import { usePeersTabFilters } from './Instances';
import { usePeersColumns } from './hooks/usePeersColumns';
import { useAwxView } from '../../common/useAwxView';
import { useMemo } from 'react';
import { useSelectAssociatePeers } from './hooks/useSelectAssociatePeers';
import { useDisassociatePeer } from './hooks/useDisassociatePeer';

export function InstancePeers() {
  const params = useParams<{ id: string }>();
  const { data: instance } = useGetItem<Instance>(awxAPI`/instances`, params.id);

  return instance ? <InstancePeersTab instance={instance} /> : null;
}

export function InstancePeersTab(props: { instance: Instance }) {
  const { instance } = props;
  return <ResourcePeersList url={awxAPI`/instances/${instance.id.toString()}/peers/`} />;
}

export function ResourcePeersList(props: { url: string }) {
  const { t } = useTranslation();
  const { url } = props;
  const toolbarFilters = usePeersTabFilters();
  const columns = usePeersColumns();
  const tableColumns = useMemo(
    () =>
      columns.filter((item) =>
        ['Instance name', 'Address', 'Port', 'Node type', 'Canonical'].includes(item.header)
      ),
    [columns]
  );
  const view = useAwxView({
    url: url,
    toolbarFilters,
    tableColumns,
    disableQueryString: true,
  });

  const multiSelectelectPeer = useSelectAssociatePeers(() => void view.refresh());
  const disassociatePeer = useDisassociatePeer(view.unselectItemsAndRefresh);

  const toolbarActions = useMemo<IPageAction<Peer>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.None,
        variant: ButtonVariant.primary,
        isPinned: true,
        icon: PlusIcon,
        label: t('Associate'),
        onClick: multiSelectelectPeer,
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        variant: ButtonVariant.primary,
        icon: MinusCircleIcon,
        label: t('Disassociate'),
        onClick: (peer: Peer[]) => disassociatePeer(peer),
        isDanger: true,
      },
    ],
    [disassociatePeer, multiSelectelectPeer, t]
  );

  return (
    <PageTable<Peer>
      toolbarFilters={toolbarFilters}
      toolbarActions={toolbarActions}
      tableColumns={tableColumns}
      errorStateTitle={t('Error loading peers')}
      emptyStateTitle={t('No peers found')}
      emptyStateDescription={t('Please add Peers to populate this list.')}
      emptyStateButtonIcon={<PlusCircleIcon />}
      emptyStateButtonText={t('Associate peer')}
      emptyStateButtonClick={multiSelectelectPeer}
      {...view}
    />
  );
}
