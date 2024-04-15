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
import { useEdaView } from '../../common/useEventDrivenView';
import { useEdaBulkConfirmation } from '../../common/useEdaBulkConfirmation';
import { idKeyFn } from '../../../common/utils/nameKeyFn';
import { requestDelete } from '../../../common/crud/Data';
import { Assignment } from '../interfaces/Assignment';

export function Access<T extends Assignment>(props: {
  tableColumnFunctions: { name: { sort: string; function: (item: T) => string; label: string } };
  toolbarFiltersValues: { label: string; query: string };
  url: string;
  id: string;
  content_type_model: string;
  addRolesRoute?: string;
  type: 'user' | 'team';
}) {
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
    ],
    [
      t,
      props.tableColumnFunctions.name.label,
      props.tableColumnFunctions.name.sort,
      props.tableColumnFunctions.name.function,
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
          title: props.type === 'team' ? t('Remove team assignment') : t('Remove user assignment'),
          confirmText:
            props.type === 'team'
              ? t('Yes, I confirm that I want to remove these {{count}} team assignments.', {
                  count: items.length,
                })
              : t('Yes, I confirm that I want to remove these {{count}} user assignments.', {
                  count: items.length,
                }),
          actionButtonText:
            props.type === 'team' ? t('Remove team assignment') : t('Remove user assignment'),
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
  const view = useEdaView<T>({
    url: props.url,
    tableColumns,
    toolbarFilters,
    queryParams: { object_id: props.id, content_type__model: props.content_type_model },
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
        label: props.type === 'team' ? t('Remove team') : t('Remove user'),
        onClick: (item: T) => removeRoles([item]),
      },
    ],
    [t, removeRoles, props.type]
  );
  const toolbarActions = useMemo<IPageAction<T>[]>(
    () => [
      {
        type: PageActionType.Link,
        selection: PageActionSelection.None,
        variant: ButtonVariant.primary,
        isPinned: true,
        icon: PlusCircleIcon,
        label: props.type === 'team' ? t('Add team') : t('Add user'),
        href: getPageUrl(props.addRolesRoute ?? '', { params: { id: props.id } }),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: TrashIcon,
        label: props.type === 'team' ? t('Delete selected team') : t('Delete selected user'),
        onClick: (items: T[]) => removeRoles(items),
        isDanger: true,
      },
    ],
    [t, getPageUrl, props.addRolesRoute, props.id, removeRoles, props.type]
  );
  return (
    <PageTable
      id={`eda-${props.content_type_model}-access-table`}
      tableColumns={tableColumns}
      toolbarActions={toolbarActions}
      toolbarFilters={toolbarFilters}
      rowActions={rowActions}
      errorStateTitle={t('Error loading access data.')}
      emptyStateTitle={
        props.type === 'team'
          ? t('There are currently no teams assigned to this object.')
          : t('There are currently no users assigned to this object.')
      }
      emptyStateDescription={
        props.type === 'team'
          ? t('Please add a team by using the button below.')
          : t('Please add an user by using the button below.')
      }
      emptyStateButtonText={props.type === 'team' ? t('Add team') : t('Add user')}
      emptyStateActions={toolbarActions.slice(0, 1)}
      {...view}
    />
  );
}
