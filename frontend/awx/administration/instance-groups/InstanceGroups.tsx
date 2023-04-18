import { ButtonVariant } from '@patternfly/react-core';
import { EditIcon, PlusCircleIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  CapacityCell,
  IPageAction,
  ITableColumn,
  IToolbarFilter,
  PageActionSelection,
  PageActionType,
  PageHeader,
  PageLayout,
  PageTable,
  TextCell,
} from '../../../../framework';
import { RouteObj } from '../../../Routes';
import { useCreatedColumn, useModifiedColumn } from '../../../common/columns';
import { InstanceGroup } from '../../interfaces/InstanceGroup';
import { useAwxView } from '../../useAwxView';
import { useDeleteInstanceGroups } from './hooks/useDeleteInstanceGroups';

export function InstanceGroups() {
  const { t } = useTranslation();
  const navigate = useNavigate();
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
            onClick: () => navigate(RouteObj.CreateInstanceGroup),
          },
          {
            type: PageActionType.Button,
            selection: PageActionSelection.None,
            label: t('Create instance group'),
            onClick: () => navigate(RouteObj.CreateInstanceGroup),
          },
        ],
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: TrashIcon,
        label: t('Delete selected instance groups'),
        onClick: deleteInstanceGroups,
        isDanger: true,
      },
    ],
    [deleteInstanceGroups, navigate, t]
  );

  const rowActions = useMemo<IPageAction<InstanceGroup>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: EditIcon,
        label: t('Edit instance group'),
        onClick: (instanceGroup) =>
          navigate(RouteObj.EditInstanceGroup.replace(':id', instanceGroup.id.toString())),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Delete instance group'),
        onClick: (instanceGroup) => deleteInstanceGroups([instanceGroup]),
        isDanger: true,
      },
    ],
    [deleteInstanceGroups, navigate, t]
  );

  return (
    <PageLayout>
      <PageHeader
        title={t('Instance groups')}
        titleHelpTitle={t('Instance groups')}
        titleHelp={t('An instance group defines grouped instances or grouped containers')}
        description={t(
          'An Instance Group provides the ability to group instances in a clustered environment.'
        )}
      />
      <PageTable<InstanceGroup>
        toolbarFilters={toolbarFilters}
        toolbarActions={toolbarActions}
        tableColumns={tableColumns}
        rowActions={rowActions}
        errorStateTitle={t('Error loading instance groups')}
        emptyStateTitle={t('No instance groups yet')}
        emptyStateDescription={t('To get started, create an instance group.')}
        emptyStateButtonText={t('Create instance group')}
        emptyStateButtonClick={() => navigate(RouteObj.CreateInstanceGroup)}
        {...view}
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
        type: 'string',
        query: 'name__icontains',
        placeholder: t('Enter name'),
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
      },
      {
        header: t('Type'),
        cell: (instanceGroup) => (
          <TextCell
            text={instanceGroup.is_container_group ? t('Container group') : t('Instance group')}
          />
        ),
        card: 'description',
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
          <CapacityCell used={instanceGroup.consumed_capacity} capacity={instanceGroup.capacity} />
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
