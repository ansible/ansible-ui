import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { CopyCell, ITableColumn, TextCell } from '../../../framework';
import { useLoginModal } from '../../common/LoginModal';
import { AutomationServer } from '../AutomationServer';
import { useAutomationServerTypes } from './useAutomationServerTypes';

export function useAutomationServersColumns(_options?: {
  disableLinks?: boolean;
  disableSort?: boolean;
}) {
  const { t } = useTranslation();
  const openLoginModal = useLoginModal();
  const automationServerTypes = useAutomationServerTypes();
  const tableColumns = useMemo<ITableColumn<AutomationServer>[]>(
    () => [
      {
        header: t('Name'),
        cell: (server) => <TextCell text={server.name} onClick={() => openLoginModal(server.id)} />,
        sort: 'name',
        card: 'name',
        list: 'name',
        icon: (server) => automationServerTypes[server.type].icon ?? '',
      },
      {
        header: t('Type'),
        sort: 'type',
        cell: (server) => <TextCell text={automationServerTypes[server.type].name ?? ''} />,
        card: 'subtitle',
        list: 'subtitle',
      },
      {
        header: t('Url'),
        value: (server) => server.url,
        cell: (server) => <CopyCell text={server.url} />,
      },
    ],
    [automationServerTypes, openLoginModal, t]
  );
  return tableColumns;
}
