import { useTranslation } from 'react-i18next';
import {
  IPageAction,
  ITableColumn,
  PageActionSelection,
  PageActionType,
  PageTable,
  IToolbarFilter,
  ToolbarFilterType,
  useGetPageUrl,
  ColumnPriority,
} from '../../../../framework';
import { useCallback, useMemo } from 'react';
import { ButtonVariant } from '@patternfly/react-core';
import { MinusCircleIcon, PlusCircleIcon, TrashIcon } from '@patternfly/react-icons';
import { idKeyFn } from '../../../common/utils/nameKeyFn';
import { requestDelete } from '../../../common/crud/Data';
import { Assignment } from '../interfaces/Assignment';
import { useMapContentTypeToDisplayName } from '../../../common/access/hooks/useMapContentTypeToDisplayName';
import { useEdaView } from '../../../eda/common/useEventDrivenView';
import { useEdaBulkConfirmation } from '../../../eda/common/useEdaBulkConfirmation';
import { useAwxBulkConfirmation } from '../../../awx/common/useAwxBulkConfirmation';
import { useHubBulkConfirmation } from '../../../hub/common/useHubBulkConfirmation';

type QueryParams = {
  [key: string]: string;
};

type AccessProps<T extends Assignment> = {
  service: 'awx' | 'eda' | 'hub';
  tableColumnFunctions: {
    name: {
      sort?: string;
      function: (item: T) => string;
      label: string;
      to?: (item: T) => string | undefined;
    };
  };
  additionalTableColumns?: ITableColumn<T>[];
  toolbarNameColumnFiltersValues?: { label: string; query: string };
  additionalTableFilters?: IToolbarFilter[];
  url: string;
  id: string;
  content_type_model?: string;
  addRolesRoute?: string;
  accessListType: 'user' | 'team' | 'user-roles' | 'team-roles';
};

export function Access<T extends Assignment>(props: AccessProps<T>) {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const getDisplayName = useMapContentTypeToDisplayName();
  const firstColumns = useMemo(
    () => props.additionalTableColumns?.filter((column) => column.priority !== ColumnPriority.last),
    [props.additionalTableColumns]
  );
  const lastColumns = useMemo(
    () => props.additionalTableColumns?.filter((column) => column.priority === ColumnPriority.last),
    [props.additionalTableColumns]
  );

  const tableColumns = useMemo<ITableColumn<T>[]>(
    () => [
      {
        header: props.tableColumnFunctions.name.label,
        type: 'text',
        sort: props.tableColumnFunctions.name.sort,
        value: props.tableColumnFunctions.name.function,
        to: props.tableColumnFunctions.name.to,
      },
      ...(firstColumns ? firstColumns : []),
      {
        header: t('Role'),
        type: 'description',
        value: (item: T) => item.summary_fields.role_definition.name,
        sort: 'role_definition__name',
      },
      ...(lastColumns ? lastColumns : []),
    ],
    [
      props.tableColumnFunctions.name.label,
      props.tableColumnFunctions.name.sort,
      props.tableColumnFunctions.name.function,
      props.tableColumnFunctions.name.to,
      firstColumns,
      t,
      lastColumns,
    ]
  );
  function useRemoveRoles(onComplete: (roles: T[]) => void) {
    const { t } = useTranslation();
    const confirmationColumns = tableColumns;
    const actionColumns = useMemo(() => [confirmationColumns[0]], [confirmationColumns]);
    const bulkActionEda = useEdaBulkConfirmation<T>();
    const bulkActionAwx = useAwxBulkConfirmation<T>();
    const bulkActionHub = useHubBulkConfirmation<T>();
    const bulkAction =
      props.service === 'awx'
        ? bulkActionAwx
        : props.service === 'eda'
          ? bulkActionEda
          : bulkActionHub;

    return useCallback(
      (items: T[]) => {
        bulkAction({
          title: t('Remove role'),
          confirmText: t('Yes, I confirm that I want to remove these {{count}} roles.', {
            count: items.length,
          }),
          actionButtonText: t('Remove role'),
          items: items,
          keyFn: idKeyFn,
          isDanger: true,
          confirmationColumns,
          actionColumns,
          onComplete,
          actionFn: (item: T, signal: AbortSignal) =>
            requestDelete(props.url + `${item.id.toString()}/`, signal),
        });
      },
      [actionColumns, bulkAction, confirmationColumns, onComplete, t]
    );
  }
  const toolbarFilters = useMemo<IToolbarFilter[]>(
    () => [
      // The name filter is not supported on object resource names in the role assignment endpoints
      ...(['user', 'team'].includes(props.accessListType) && props.toolbarNameColumnFiltersValues
        ? ([
            {
              key: 'name',
              label: props.toolbarNameColumnFiltersValues.label,
              type: ToolbarFilterType.SingleText,
              query: props.toolbarNameColumnFiltersValues.query,
              comparison: 'contains',
            },
          ] as IToolbarFilter[])
        : []),
      {
        key: 'role_definition__name',
        label: t('Role name'),
        type: ToolbarFilterType.SingleText,
        query: 'role_definition__name__contains',
        comparison: 'contains',
      },
      ...(props.additionalTableFilters ? props.additionalTableFilters : []),
    ],
    [props.accessListType, props.toolbarNameColumnFiltersValues, props.additionalTableFilters, t]
  );
  const queryParams = useMemo<QueryParams>(() => {
    let params = {};
    switch (props.accessListType) {
      case 'user':
      case 'team':
        params = { object_id: props.id, content_type__model: props.content_type_model };
        break;
      case 'user-roles':
        params = { user_id: props.id };
        break;
      case 'team-roles':
        params = { team_id: props.id };
        break;
      default:
        params = {};
    }
    return params;
  }, [props.content_type_model, props.id, props.accessListType]);
  const view = useEdaView<T>({
    url: props.url,
    tableColumns,
    toolbarFilters,
    queryParams: queryParams,
  });
  const removeRoles = useRemoveRoles(view.unselectItemsAndRefresh);

  const rowActions = useMemo<IPageAction<T>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        variant: ButtonVariant.primary,
        icon: MinusCircleIcon,
        isPinned: true,
        label: t('Remove role'),
        onClick: (item: T) => removeRoles([item]),
      },
    ],
    [t, removeRoles]
  );
  const toolbarActions = useMemo<IPageAction<T>[]>(
    () => [
      {
        type: PageActionType.Link,
        selection: PageActionSelection.None,
        variant: ButtonVariant.primary,
        isPinned: true,
        icon: PlusCircleIcon,
        label: t('Add roles'),
        href: getPageUrl(props.addRolesRoute ?? '', { params: { id: props.id } }),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: TrashIcon,
        label: t('Remove selected roles'),
        onClick: (items: T[]) => removeRoles(items),
        isDanger: true,
      },
    ],
    [t, getPageUrl, props.addRolesRoute, props.id, removeRoles]
  );
  const emptyStateTitle = useMemo(() => {
    let title: string;
    switch (props.accessListType) {
      case 'user':
        title = props.content_type_model
          ? t('There are currently no users assigned to this {{resourceType}}.', {
              resourceType: getDisplayName(props.content_type_model),
            })
          : t('There are currently no users assigned to this resource.');
        break;
      case 'team':
        title = props.content_type_model
          ? t('There are currently no teams assigned to this {{resourceType}}.', {
              resourceType: getDisplayName(props.content_type_model),
            })
          : t('There are currently no teams assigned to this resource.');
        break;
      case 'user-roles':
        title = t('There are currently no roles assigned to this user.');
        break;
      case 'team-roles':
        title = t('There are currently no roles assigned to this team.');
        break;
      default:
        title = t('There are currently no roles assigned to this resource.');
    }
    return title;
  }, [getDisplayName, props.accessListType, props.content_type_model, t]);
  return (
    <PageTable
      id={
        props.content_type_model
          ? `${props.service}-${props.content_type_model}-access-table`
          : `${props.service}-${props.accessListType}-table`
      }
      tableColumns={tableColumns}
      toolbarActions={toolbarActions}
      toolbarFilters={toolbarFilters}
      rowActions={rowActions}
      errorStateTitle={t('Error loading access data.')}
      emptyStateTitle={emptyStateTitle}
      emptyStateDescription={t('Add a role by clicking the button below.')}
      emptyStateButtonIcon={<PlusCircleIcon />}
      emptyStateButtonText={t('Add roles')}
      emptyStateActions={toolbarActions.slice(0, 1)}
      {...view}
    />
  );
}
