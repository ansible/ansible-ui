import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IToolbarFilter, PageHeader, PageLayout } from '../../../../framework';
import { ActivityStreamIcon } from '../../common/ActivityStreamIcon';
import {
  useAddressToolbarFilter,
  useHostnameToolbarFilter,
} from '../../common/awx-toolbar-filters';
import { InstancesList } from './components/InstancesList';
import { useInstanceToolbarActions } from './hooks/useInstanceToolbarActions';
import { useInstanceRowActions } from './hooks/useInstanceRowActions';
import { useInstancesColumns } from './hooks/useInstancesColumns';

export function Instances() {
  const { t } = useTranslation();
  const tableColumns = useInstancesColumns();

  return (
    <PageLayout>
      <PageHeader
        title={t('Instances')}
        titleHelpTitle={t('Instances')}
        titleHelp={t(
          'Ansible node instances dedicated for a particular purpose indicated by node type.'
        )}
        description={t(
          'Ansible node instances dedicated for a particular purpose indicated by node type.'
        )}
        headerActions={<ActivityStreamIcon type={'instance'} />}
      />
      <InstancesList
        useToolbarActions={useInstanceToolbarActions}
        useRowActions={useInstanceRowActions}
        tableColumns={tableColumns}
      />
    </PageLayout>
  );
}

export function usePeersFilters() {
  const hostnameToolbarFilter = useHostnameToolbarFilter();

  const toolbarFilters = useMemo<IToolbarFilter[]>(
    () => [hostnameToolbarFilter],
    [hostnameToolbarFilter]
  );
  return toolbarFilters;
}

export function usePeersTabFilters() {
  const addressToolbarFilter = useAddressToolbarFilter();

  const toolbarFilters = useMemo<IToolbarFilter[]>(
    () => [addressToolbarFilter],
    [addressToolbarFilter]
  );
  return toolbarFilters;
}
