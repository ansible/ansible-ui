import { ButtonVariant, Progress } from '@patternfly/react-core';
import { EditIcon, PlusCircleIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IPageAction,
  ITableColumn,
  IToolbarFilter,
  PageActionSelection,
  PageActionType,
  PageHeader,
  PageLayout,
  PageTable,
  TextCell,
  ToolbarFilterType,
  usePageNavigate,
} from '../../../../framework';
import { RouteObj } from '../../../common/Routes';
import { useCreatedColumn, useModifiedColumn } from '../../../common/columns';
import { AwxRoute } from '../../AwxRoutes';
import { InstanceGroup } from '../../interfaces/InstanceGroup';
import { useAwxView } from '../../useAwxView';
import { useDeleteInstanceGroups } from './hooks/useDeleteInstanceGroups';

export function InstanceGroups() {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const toolbarFilters = useInstanceGroupsFilters();
  const tableColumns = useInstanceGroupsColumns();
  const view = useAwxView({
    url: '/api/v2/instance_groups/',
    toolbarFilters,
    tableColumns,
  });

  const deleteInstanceGroups = useDeleteInstanceGroups(view.unselectItemsAndRefresh);

  const toolbarActions = useMemo<IPageAction<InstanceGroup>[]>(
    () => [
      {
        type: PageActionType.Dropdown,
        icon: PlusCircleIcon,
        variant: ButtonVariant.primary,
        isPinned: true,
        selection: PageActionSelection.None,
        label: t('Create group'),
        actions: [
          {
            type: PageActionType.Button,
            selection: PageActionSelection.None,
            label: t('Create container group'),
            onClick: () => pageNavigate(AwxRoute.CreateInstanceGroup),
          },
          {
            type: PageActionType.Button,
            selection: PageActionSelection.None,
            label: t('Create instance group'),
            onClick: () => pageNavigate(AwxRoute.CreateInstanceGroup),
          },
        ],
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: TrashIcon,
        label: t('Delete selected instance groups'),
        onClick: deleteInstanceGroups,
        isDanger: true,
      },
    ],
    [deleteInstanceGroups, pageNavigate, t]
  );

  const rowActions = useMemo<IPageAction<InstanceGroup>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: EditIcon,
        isPinned: true,
        label: t('Edit instance group'),
        onClick: (instanceGroup) =>
          pageNavigate(AwxRoute.EditInstanceGroup, { params: { id: instanceGroup.id } }),
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Delete instance group'),
        onClick: (instanceGroup) => deleteInstanceGroups([instanceGroup]),
        isDanger: true,
      },
    ],
    [deleteInstanceGroups, pageNavigate, t]
  );

  return (
    <PageLayout>
      <PageHeader
        title={t('Instance Groups')}
        titleHelpTitle={t('Instance Groups')}
        titleHelp={t('An instance group defines grouped instances or grouped containers')}
        description={t(
          'An instance group provides the ability to group instances in a clustered environment.'
        )}
      />
      <PageTable<InstanceGroup>
        id="awx-instance-groups-table"
        toolbarFilters={toolbarFilters}
        toolbarActions={toolbarActions}
        tableColumns={tableColumns}
        rowActions={rowActions}
        errorStateTitle={t('Error loading instance groups')}
        emptyStateTitle={t('No instance groups yet')}
        emptyStateDescription={t('To get started, create an instance group.')}
        emptyStateButtonText={t('Create instance group')}
        emptyStateButtonClick={() => pageNavigate(AwxRoute.CreateInstanceGroup)}
        {...view}
        defaultSubtitle={t('Instance Group')}
      />
    </PageLayout>
  );
}

export function useInstanceGroupsFilters() {
  const { t } = useTranslation();
  const toolbarFilters = useMemo<IToolbarFilter[]>(
    () => [
      {
        key: 'name',
        label: t('Name'),
        type: ToolbarFilterType.Text,
        query: 'name__icontains',
        comparison: 'contains',
      },
    ],
    [t]
  );
  return toolbarFilters;
}

export function useInstanceGroupsColumns(options?: {
  disableSort?: boolean;
  disableLinks?: boolean;
}) {
  const { t } = useTranslation();
  const disableLinks = options && options.disableLinks;

  const createdColumn = useCreatedColumn(options);
  const modifiedColumn = useModifiedColumn(options);

  const tableColumns = useMemo<ITableColumn<InstanceGroup>[]>(
    () => [
      {
        header: t('Name'),
        cell: (instanceGroup) => (
          <TextCell
            to={
              disableLinks
                ? undefined
                : RouteObj.InstanceGroupDetails.replace(':id', instanceGroup.id.toString())
            }
            text={instanceGroup.name}
          />
        ),
        sort: 'name',
        card: 'name',
        list: 'name',
      },
      {
        header: t('Type'),
        cell: (instanceGroup) => (
          <TextCell
            text={instanceGroup.is_container_group ? t('Container group') : t('Instance group')}
          />
        ),
        card: 'subtitle',
        list: 'subtitle',
      },
      {
        header: t('Running jobs'),
        cell: (instanceGroup) => instanceGroup.jobs_running,
      },
      {
        header: t('Total jobs'),
        cell: (instanceGroup) => instanceGroup.jobs_total,
      },
      {
        header: t('Used capacity'),
        cell: (instanceGroup) => (
          <Progress value={Math.round(100 - instanceGroup.percent_capacity_remaining)} />
        ),
        list: 'secondary',
      },
      createdColumn,
      modifiedColumn,
    ],

    [t, disableLinks, createdColumn, modifiedColumn]
  );

  return tableColumns;
}
