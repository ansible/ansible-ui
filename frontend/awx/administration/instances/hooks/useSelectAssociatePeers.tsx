import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { MultiSelectDialog, usePageDialog } from '../../../../../framework';
import { usePeersTabFilters } from '../Instances';
import { awxAPI } from '../../../common/api/awx-utils';
import { useAwxView } from '../../../common/useAwxView';
import { useAssociatePeersToInstance } from './useAssociatePeersToInstance';
import { usePeersColumns } from './usePeersColumns';
import { useGetItem } from '../../../../common/crud/useGet';
import { useParams } from 'react-router-dom';
import { Peer, Instance } from '../../../interfaces/Instance';

function SelectAssociates(props: {
  accessUrl?: string;
  title: string;
  onSelect: (peers: Peer[]) => void;
  confirmText?: string;
}) {
  const { t } = useTranslation();
  const params = useParams<{ id?: string }>();
  const { data: instance } = useGetItem<Instance>(awxAPI`/instances/`, params.id);

  const toolbarFilters = usePeersTabFilters();
  const columns = usePeersColumns();
  const tableColumns = useMemo(
    () =>
      columns.filter((item) =>
        ['Instance name', 'Address', 'Port', 'Node type', 'Protocol'].includes(item.header)
      ),
    [columns]
  );

  const instanceName = instance?.hostname as string;
  const view = useAwxView<Peer>({
    url: awxAPI`/receptor_addresses/`,
    toolbarFilters,
    tableColumns,
    disableQueryString: true,
    queryParams: {
      not__address: instanceName,
    },
  });

  return (
    <MultiSelectDialog
      title={props.title}
      onSelect={props.onSelect}
      toolbarFilters={toolbarFilters}
      tableColumns={tableColumns}
      view={view}
      confirmText={t('Associate peer(s)')}
    />
  );
}

export function useSelectAssociates() {
  const [_, setDialog] = usePageDialog();
  const openSelectUsers = useCallback(
    (
      title: string,
      onSelect: (peers: Peer[]) => void,
      confirmText?: string,
      accessUrl?: string
    ) => {
      setDialog(
        <SelectAssociates
          accessUrl={accessUrl}
          title={title}
          onSelect={onSelect}
          confirmText={confirmText}
        />
      );
    },
    [setDialog]
  );
  return openSelectUsers;
}

export function useSelectAssociatePeers(onClose: () => void) {
  const { t } = useTranslation();
  const selectAssociates = useSelectAssociates();
  const addPeersToInstance = useAssociatePeersToInstance();

  const select = useCallback(() => {
    selectAssociates(t('Select peer addresses'), (instances: Peer[]) => {
      addPeersToInstance(instances, onClose);
    });
  }, [addPeersToInstance, onClose, selectAssociates, t]);
  return select;
}
