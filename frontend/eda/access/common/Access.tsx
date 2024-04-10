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
  translatedType: string;
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
        card: 'description',
        list: 'description',
      },
      {
        header: t('Role description'),
        type: 'description',
        value: (item: T) => item.summary_fields.role_definition.description,
        card: 'description',
        list: 'description',
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
          title: t('Remove {{type}} assignment', { type: props.translatedType }),
          confirmText: t(
            'Yes, I confirm that I want to remove these {{count}} {{type}} assignment.',
            {
              count: items.length,
              type: props.translatedType,
            }
          ),
          actionButtonText: t('Remove {{type}} assignment', { type: props.translatedType }),
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
      [actionColumns, bulkAction, confirmationColumns, onComplete, t, props.translatedType]
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
        label: t('Remove {{type}}', { type: props.translatedType }),
        onClick: (item: T) => removeRoles([item]),
      },
    ],
    [t, removeRoles, props.translatedType]
  );
  const toolbarActions = useMemo<IPageAction<T>[]>(
    () => [
      {
        type: PageActionType.Link,
        selection: PageActionSelection.None,
        variant: ButtonVariant.primary,
        isPinned: true,
        icon: PlusCircleIcon,
        label: t('Add {{type}}', { type: props.translatedType }),
        href: getPageUrl(props.addRolesRoute ?? '', { params: { id: props.id } }),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: TrashIcon,
        label: t('Delete selected {{type}}', { type: props.translatedType }),
        onClick: (items: T[]) => removeRoles(items),
        isDanger: true,
      },
    ],
    [t, getPageUrl, props.addRolesRoute, props.id, removeRoles, props.translatedType]
  );
  return (
    <PageTable
      id={`eda-${props.content_type_model}-access-table`}
      tableColumns={tableColumns}
      toolbarActions={toolbarActions}
      toolbarFilters={toolbarFilters}
      rowActions={rowActions}
      errorStateTitle={t('Error loading access data.')}
      emptyStateTitle={t('There are currently no {{type}} assigned to this object.', {
        type: props.translatedType,
      })}
      emptyStateDescription={t('Please add a {{type}} by using the button below.', {
        type: props.translatedType,
      })}
      emptyStateButtonText={t('Add {{type}}', { type: props.translatedType })}
      emptyStateActions={toolbarActions.slice(0, 1)}
      {...view}
    />
  );
}
