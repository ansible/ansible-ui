import { ButtonVariant } from '@patternfly/react-core';
import { EditIcon, PlusIcon, TrashIcon } from '@patternfly/react-icons';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  IPageAction,
  ITableColumn,
  IToolbarFilter,
  PageActionSelection,
  PageActionType,
  PageHeader,
  PageLayout,
  PageTable,
} from '../../../../framework';
import { RouteObj } from '../../../Routes';
import {
  useCreatedColumn,
  useDescriptionColumn,
  useModifiedColumn,
  useNameColumn,
} from '../../../common/columns';
import {
  useCreatedByToolbarFilter,
  useDescriptionToolbarFilter,
  useModifiedByToolbarFilter,
  useNameToolbarFilter,
} from '../../common/awx-toolbar-filters';
import { AwxHost } from '../../interfaces/AwxHost';
import { useAwxView } from '../../useAwxView';
import { useDeleteHosts } from './useDeleteHosts';
import getDocsBaseUrl from '../../common/util/getDocsBaseUrl';
import { useAwxConfig } from '../../common/useAwxConfig';

export function Hosts() {
  const { t } = useTranslation();
  const product: string = process.env.PRODUCT ?? t('AWX');
  const navigate = useNavigate();
  const toolbarFilters = useHostsFilters();
  const tableColumns = useHostsColumns();
  const view = useAwxView<AwxHost>({ url: '/api/v2/hosts/', toolbarFilters, tableColumns });
  const deleteHosts = useDeleteHosts(view.unselectItemsAndRefresh);
  const config = useAwxConfig();

  const toolbarActions = useMemo<IPageAction<AwxHost>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.None,
        variant: ButtonVariant.primary,
        isPinned: true,
        icon: PlusIcon,
        label: t('Create host'),
        onClick: () => navigate(RouteObj.CreateHost),
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: TrashIcon,
        label: t('Delete selected hosts'),
        onClick: deleteHosts,
        isDanger: true,
      },
    ],
    [navigate, deleteHosts, t]
  );

  const rowActions = useMemo<IPageAction<AwxHost>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: EditIcon,
        label: t('Edit host'),
        onClick: (host) => navigate(RouteObj.EditHost.replace(':id', host.id.toString())),
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Delete host'),
        onClick: (host) => deleteHosts([host]),
        isDanger: true,
      },
    ],
    [navigate, deleteHosts, t]
  );

  return (
    <PageLayout>
      <PageHeader
        title={t('Hosts')}
        description={t(
          `A system managed by {{product}}, which may include a physical, virtual, cloud-based server, or other device.`,
          { product }
        )}
        titleHelpTitle={t('Host')}
        titleHelp={[
          t(
            `A system managed by {{product}}, which may include a physical, virtual, cloud-based server, or other device. Typically an operating system instance. Hosts are contained in Inventory. Sometimes referred to as a “node”.`,
            { product }
          ),
          t(
            'Ansible works against multiple managed nodes or “hosts” in your infrastructure at the same time, using a list or group of lists known as inventory. Once your inventory is defined, you use patterns to select the hosts or groups you want Ansible to run against.'
          ),
        ]}
        titleDocLink={`${getDocsBaseUrl(config)}/html/userguide/hosts.html`}
      />
      <PageTable<AwxHost>
        toolbarFilters={toolbarFilters}
        toolbarActions={toolbarActions}
        tableColumns={tableColumns}
        rowActions={rowActions}
        errorStateTitle={t('Error loading hosts')}
        emptyStateTitle={t('No hosts yet')}
        emptyStateDescription={t('To get started, create an host.')}
        emptyStateButtonText={t('Create host')}
        emptyStateButtonClick={() => navigate(RouteObj.CreateHost)}
        {...view}
        defaultSubtitle={t('Host')}
      />
    </PageLayout>
  );
}

export function useHostsFilters() {
  const nameToolbarFilter = useNameToolbarFilter();
  const descriptionToolbarFilter = useDescriptionToolbarFilter();
  const createdByToolbarFilter = useCreatedByToolbarFilter();
  const modifiedByToolbarFilter = useModifiedByToolbarFilter();
  const toolbarFilters = useMemo<IToolbarFilter[]>(
    () => [
      nameToolbarFilter,
      descriptionToolbarFilter,
      createdByToolbarFilter,
      modifiedByToolbarFilter,
    ],
    [nameToolbarFilter, descriptionToolbarFilter, createdByToolbarFilter, modifiedByToolbarFilter]
  );
  return toolbarFilters;
}

export function useHostsColumns(options?: { disableSort?: boolean; disableLinks?: boolean }) {
  const navigate = useNavigate();
  const nameClick = useCallback(
    (host: AwxHost) => navigate(RouteObj.HostDetails.replace(':id', host.id.toString())),
    [navigate]
  );
  const nameColumn = useNameColumn({
    ...options,
    onClick: nameClick,
  });
  const descriptionColumn = useDescriptionColumn();
  const createdColumn = useCreatedColumn(options);
  const modifiedColumn = useModifiedColumn(options);
  const tableColumns = useMemo<ITableColumn<AwxHost>[]>(
    () => [nameColumn, descriptionColumn, createdColumn, modifiedColumn],
    [nameColumn, descriptionColumn, createdColumn, modifiedColumn]
  );
  return tableColumns;
}
