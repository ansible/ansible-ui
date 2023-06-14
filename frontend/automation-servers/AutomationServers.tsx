import { ButtonVariant } from '@patternfly/react-core';
import { MinusCircleIcon, PlusCircleIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CopyCell,
  IPageAction,
  ITableColumn,
  PageActionSelection,
  PageActionType,
  PageHeader,
  PageLayout,
  PageTable,
  TextCell,
  useSelected,
} from '../../framework';
import { PageTableViewTypeE } from '../../framework/PageTable/PageToolbar/PageTableViewType';
import { useView } from '../../framework/useView';
import { useLoginModal } from '../common/LoginModal';
import AwxIcon from '../assets/AWX.svg';
import EdaIcon from '../assets/EDA.svg';
import { useAutomationServers } from './contexts/AutomationServerProvider';
import { useAddAutomationServer } from './hooks/useAddAutomationServer';
import { useRemoveAutomationServers } from './hooks/useRemoveAutomationServers';
import { AutomationServer, automationServerKeyFn } from './interfaces/AutomationServer';
import { AutomationServerType } from './interfaces/AutomationServerType';
import styled from 'styled-components';

const HubIconDiv = styled.div`
  font-size: xx-large;
`;

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
        selection: PageActionSelection.None,
        isPinned: true,
        variant: ButtonVariant.primary,
        icon: PlusCircleIcon,
        label: t('Add automation server'),
        onClick: addAutomationServer,
      },
      // {
      //   type: PageActionType.Button,
      // selection: PageActionSelection.Multiple,
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
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: MinusCircleIcon,
        label: t('Remove automation server'),
        onClick: (server) => removeAutomationServers([server]),
      },
    ],
    [removeAutomationServers, t]
  );

  // const filters = useAutomationServerFilters();

  return (
    <PageLayout>
      <PageHeader title={t('Automation servers')} />
      <PageTable<AutomationServer>
        toolbarActions={toolbarActions}
        tableColumns={tableColumns}
        rowActions={rowActions}
        // toolbarFilters={filters}
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
        icon: (server) => {
          switch (server.type) {
            case AutomationServerType.AWX:
              return <AwxIcon />;
            case AutomationServerType.EDA:
              return <EdaIcon />;
            case AutomationServerType.HUB:
              return <HubIconDiv>HUB</HubIconDiv>;
          }
        },
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
        value: (server) => server.url,
        cell: (server) => <CopyCell text={server.url} />,
        list: 'secondary',
      },
      {
        header: t('Labels'),
        type: 'labels',
        value: (server) => {
          switch (server.type) {
            case AutomationServerType.AWX:
              return ['AWX'];
            case AutomationServerType.EDA:
              return ['EDA'];
            case AutomationServerType.HUB:
              return ['HUB'];
          }
        },
        card: 'description',
        list: 'description',
      },
    ],
    [openLoginModal, t]
  );
  return tableColumns;
}

// export function useAutomationServerFilters() {
//   const { t } = useTranslation();
//   const toolbarFilters = useMemo<IToolbarFilter[]>(
//     () => [
//       {
//         key: 'type',
//         label: t('Types'),
//         type: 'select',
//         query: 'type',
//         options: [
//           { label: t('AWX'), value: AutomationServerType.AWX },
//           { label: t('EDA'), value: AutomationServerType.EDA },
//           { label: t('HUB'), value: AutomationServerType.HUB },
//         ],
//         placeholder: t('Select types'),
//       },
//     ],
//     [t]
//   );
//   return toolbarFilters;
// }
