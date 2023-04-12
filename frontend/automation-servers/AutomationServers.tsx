import { ButtonVariant } from '@patternfly/react-core';
import { MinusCircleIcon, PlusCircleIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IPageAction,
  ITableColumn,
  PageActionType,
  PageLayout,
  PageTable,
  TextCell,
  useSelected,
} from '../../framework';
import { PageTableViewTypeE } from '../../framework/PageTable/PageTableViewType';
import { useView } from '../../framework/useView';
import { useLoginModal } from '../common/LoginModal';
import { useAutomationServers } from './contexts/AutomationServerProvider';
import { useAddAutomationServer } from './hooks/useAddAutomationServer';
import { useRemoveAutomationServers } from './hooks/useRemoveAutomationServers';
import { AutomationServer, automationServerKeyFn } from './interfaces/AutomationServer';
import { AutomationServerType } from './interfaces/AutomationServerType';

export function AutomationServers() {
  const { t } = useTranslation();

  const tableColumns = useAutomationServersColumns();
  const { automationServers } = useAutomationServers();
  const view = useView();
  const selected = useSelected(automationServers, automationServerKeyFn);

  const addAutomationServer = useAddAutomationServer();
  const removeAutomationServers = useRemoveAutomationServers();

  const toolbarActions = useMemo<IPageAction<AutomationServer>[]>(
    () => [
      {
        type: PageActionType.Button,
        variant: ButtonVariant.primary,
        icon: PlusCircleIcon,
        label: t('Add automation server'),
        onClick: addAutomationServer,
      },
      // {
      //   type: PageActionType.bulk,
      //   icon: MinusCircleIcon,
      //   label: t('Remove selected automation servers'),
      //   onClick: (servers) => removeAutomationServers(servers),
      // },
    ],
    [addAutomationServer, t]
  );

  const rowActions = useMemo<IPageAction<AutomationServer>[]>(
    () => [
      // {
      //   type: TypedActionType.single,
      //   variant: ButtonVariant.primary,
      //   icon: EditIcon,
      //   label: t('Edit automation server'),
      //   onClick: () => null,
      // },
      // { type: TypedActionType.seperator },
      {
        type: PageActionType.Single,
        icon: MinusCircleIcon,
        label: t('Remove automation server'),
        onClick: (server) => removeAutomationServers([server]),
      },
    ],
    [removeAutomationServers, t]
  );

  return (
    <PageLayout>
      <PageTable<AutomationServer>
        toolbarActions={toolbarActions}
        tableColumns={tableColumns}
        rowActions={rowActions}
        errorStateTitle={t('Error loading automation servers')}
        emptyStateTitle={t('Welcome to Ansible')}
        emptyStateDescription={t('To get started, add your Ansible automation servers.')}
        emptyStateButtonText={t('Add automation server')}
        emptyStateButtonClick={addAutomationServer}
        {...view}
        pageItems={automationServers}
        itemCount={automationServers.length}
        {...selected}
        defaultTableView={PageTableViewTypeE.Cards}
      />
    </PageLayout>
  );
}

export function useAutomationServersColumns(_options?: {
  disableLinks?: boolean;
  disableSort?: boolean;
}) {
  const { t } = useTranslation();

  const openLoginModal = useLoginModal();

  const tableColumns = useMemo<ITableColumn<AutomationServer>[]>(
    () => [
      {
        header: t('Name'),
        cell: (server) => (
          <TextCell text={server.name} onClick={() => openLoginModal(server.url)} />
        ),
        card: 'name',
        list: 'name',
      },
      {
        header: t('Type'),
        cell: (server) => {
          switch (server.type) {
            case AutomationServerType.AWX:
              return <TextCell text={t('AWX Ansible server')} />;
            case AutomationServerType.HUB:
              return <TextCell text={t('Galaxy Ansible server')} />;
            case AutomationServerType.EDA:
              return <TextCell text={t('EDA server')} />;
            default:
              return <TextCell text={t('Unknown')} />;
          }
        },
        card: 'subtitle',
        list: 'subtitle',
      },
      {
        header: t('Url'),
        cell: (server) => <TextCell text={server.url} />,
        card: 'description',
        list: 'description',
      },
    ],
    [openLoginModal, t]
  );
  return tableColumns;
}
