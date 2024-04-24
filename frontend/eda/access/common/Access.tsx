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
} from '../../../../framework';
import { useCallback, useMemo } from 'react';
import { ButtonVariant } from '@patternfly/react-core';
import { MinusCircleIcon, PlusCircleIcon, TrashIcon } from '@patternfly/react-icons';
import { QueryParams, useEdaView } from '../../common/useEventDrivenView';
import { useEdaBulkConfirmation } from '../../common/useEdaBulkConfirmation';
import { idKeyFn } from '../../../common/utils/nameKeyFn';
import { requestDelete } from '../../../common/crud/Data';
import { Assignment } from '../interfaces/Assignment';

type AccessProps<T extends Assignment> = {
  tableColumnFunctions: { name: { sort?: string; function: (item: T) => string; label: string } };
  additionalTableColumns?: ITableColumn<T>[];
  toolbarFiltersValues: { label: string; query: string };
  url: string;
  id: string;
  content_type_model?: string;
  addRolesRoute?: string;
  type: 'user' | 'team' | 'user-roles' | 'team-roles';
};

export function Access<T extends Assignment>(props: AccessProps<T>) {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const tableColumns = useMemo<ITableColumn<T>[]>(
    () => [
      {
        header: props.tableColumnFunctions.name.label,
        type: 'description',
        sort: props.tableColumnFunctions.name.sort,
        value: props.tableColumnFunctions.name.function,
        card: 'description',
        list: 'description',
      },
      {
        header: t('Role'),
        type: 'description',
        value: (item: T) => item.summary_fields.role_definition.name,
        sort: 'role_definition__name',
      },
      {
        header: t('Role description'),
        type: 'description',
        value: (item: T) => item.summary_fields.role_definition.description,
      },
      ...(props.additionalTableColumns ? props.additionalTableColumns : []),
    ],
    [
      props.tableColumnFunctions.name.label,
      props.tableColumnFunctions.name.sort,
      props.tableColumnFunctions.name.function,
      props.additionalTableColumns,
      t,
    ]
  );
  function useRemoveRoles(onComplete: (roles: T[]) => void) {
    const { t } = useTranslation();
    const confirmationColumns = tableColumns;
    const actionColumns = useMemo(() => [confirmationColumns[0]], [confirmationColumns]);
    const bulkAction = useEdaBulkConfirmation<T>();
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
      {
        key: 'name',
        label: props.toolbarFiltersValues.label,
        type: ToolbarFilterType.SingleText,
        query: props.toolbarFiltersValues.query,
        comparison: 'equals',
      },
      {
        key: 'role_definition__name',
        label: t('Role name'),
        type: ToolbarFilterType.SingleText,
        query: 'role_definition__name',
        comparison: 'equals',
      },
    ],
    [t, props.toolbarFiltersValues.label, props.toolbarFiltersValues.query]
  );
  const queryParams = useMemo<QueryParams>(() => {
    let params = {};
    switch (props.type) {
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
  }, [props.content_type_model, props.id, props.type]);
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
  return (
    <PageTable
      id={
        props.content_type_model
          ? `eda-${props.content_type_model}-access-table`
          : `eda-${props.type}-table`
      }
      tableColumns={tableColumns}
      toolbarActions={toolbarActions}
      toolbarFilters={toolbarFilters}
      rowActions={rowActions}
      errorStateTitle={t('Error loading access data.')}
      emptyStateTitle={t('There are currently no roles assigned to this resource.')}
      emptyStateDescription={t('Add a role by clicking the button below.')}
      emptyStateButtonIcon={<PlusCircleIcon />}
      emptyStateButtonText={t('Add roles')}
      emptyStateActions={toolbarActions.slice(0, 1)}
      {...view}
    />
  );
}
