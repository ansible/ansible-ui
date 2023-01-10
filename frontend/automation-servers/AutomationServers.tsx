import { ButtonVariant } from '@patternfly/react-core';
import { MinusCircleIcon, PlusCircleIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IPageAction,
  ITableColumn,
  PageActionType,
  PageHeader,
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
        type: PageActionType.button,
        variant: ButtonVariant.primary,
        icon: PlusCircleIcon,
        label: t('Add automation server'),
        onClick: addAutomationServer,
      },
      {
        type: PageActionType.bulk,
        icon: MinusCircleIcon,
        label: t('Remove selected automation servers'),
        onClick: (servers) => removeAutomationServers(servers),
      },
    ],
    [addAutomationServer, removeAutomationServers, t]
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
        type: PageActionType.single,
        icon: MinusCircleIcon,
        label: t('Remove automation server'),
        onClick: (server) => removeAutomationServers([server]),
      },
    ],
    [removeAutomationServers, t]
  );

  return (
    <PageLayout>
      {automationServers.length > 0 && <PageHeader title={t('Automation servers')} />}
      <PageTable<AutomationServer>
        toolbarActions={toolbarActions}
        tableColumns={tableColumns}
        rowActions={rowActions}
        errorStateTitle={t('Error loading automation servers')}
        emptyStateTitle={t('Welcome to the Ansible Automation Platform')}
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
            case 'controller':
              return <TextCell text="Automation controller" />;
            case 'hub':
              return <TextCell text="Automation hub" />;
            case 'eda':
              return <TextCell text="Event driven automation" />;
            default:
              return <TextCell text="Unknown" />;
          }
        },
        card: 'subtitle',
        list: 'subtitle',
      },
      {
        header: t('Url'),
        cell: (server) => <TextCell text={server.url} to={server.url} />,
        card: 'description',
        list: 'description',
      },
    ],
    [openLoginModal, t]
  );
  return tableColumns;
}
