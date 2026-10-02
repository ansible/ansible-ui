import {
  ColumnPriority,
  IPageAction,
  ITableColumn,
  IToolbarFilter,
  PageActionSelection,
  PageActionType,
  PageTable,
  ToolbarFilterType,
  useGetPageUrl,
} from '@ansible/ansible-ui-framework';
import { useAwxBulkConfirmation } from '@ansible/awx-ui/common/useAwxBulkConfirmation';
import { useEdaBulkConfirmation } from '@ansible/eda-ui/common/useEdaBulkConfirmation';
import { useEdaView } from '@ansible/eda-ui/common/useEventDrivenView';
import { useHubBulkConfirmation } from '@ansible/hub-ui/common/useHubBulkConfirmation';
import { ButtonVariant } from '@patternfly/react-core';
import { MinusCircleIcon, PlusCircleIcon } from '@patternfly/react-icons';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { requestDelete } from '../../crud/Data';
import { idKeyFn } from '../../utils/nameKeyFn';
import { useMapContentTypeToDisplayName } from '../hooks/useMapContentTypeToDisplayName';
import { Assignment } from '../interfaces/Assignment';

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
  addRoleButtonText?: string;
  removeRoleText?: string;
  removeConfirmationText?: (count: number) => string;
};

export function Access<T extends Assignment>(props: AccessProps<T>) {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const getDisplayName = useMapContentTypeToDisplayName();
  const params = useParams<{ id: string }>();
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
        let confirmText =
          props.content_type_model === 'team'
            ? t('Yes, I confirm that I want to remove these {{count}} users.', {
                count: items.length,
              })
            : t('Yes, I confirm that I want to remove these {{count}} roles.', {
                count: items.length,
              });
        if (props.removeConfirmationText) confirmText = props.removeConfirmationText(items.length);
        bulkAction({
          title: props.removeRoleText ?? t('Remove role'),
          confirmText,
          actionButtonText: props.removeRoleText ?? t('Remove role'),
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
        query: 'role_definition__name__icontains',
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
        label: props.addRoleButtonText ?? t('Add roles'),
        href: getPageUrl(props.addRolesRoute ?? '', { params: { id: params.id } }),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: MinusCircleIcon,
        label: t('Remove roles'),
        onClick: (items: T[]) => removeRoles(items),
        isDanger: true,
      },
    ],
    [t, getPageUrl, props.addRolesRoute, props.addRoleButtonText, params.id, removeRoles]
  );
  const emptyStateTitle = useMemo(() => {
    let title: string;
    switch (props.accessListType) {
      case 'user':
        title = props.content_type_model
          ? t('No users assigned to {{resourceType}}', {
              resourceType: getDisplayName(props.content_type_model),
            })
          : t('No users assigned to this resource');
        break;
      case 'team':
        title = props.content_type_model
          ? t('No teams are assigned to this {{resourceType}}.', {
              resourceType: getDisplayName(props.content_type_model),
            })
          : t('No teams are assigned to this resource.');
        break;
      case 'user-roles':
        title =
          props.service === 'eda'
            ? t('There are currently no Automation Decisions roles assigned to this user.')
            : props.service === 'hub'
              ? t('There are currently no Automation Content roles assigned to this user.')
              : props.service === 'awx'
                ? t('There are currently no Automation Execution roles assigned to this user.')
                : t('There are currently no roles assigned to this user.');
        break;
      case 'team-roles':
        title = t('There are currently no roles assigned to this team.');
        break;
      default:
        title = t('There are currently no roles assigned to this resource.');
    }
    return title;
  }, [getDisplayName, props.accessListType, props.content_type_model, props.service, t]);

  const emptyStateDescription = useMemo(() => {
    let title: string;
    if (props.accessListType === 'team') {
      title = props.content_type_model
        ? t('To get started, assign a team to this {{resourceType}}.', {
            resourceType: getDisplayName(props.content_type_model),
          })
        : t('To get started, assign a team to this resource.');
    } else {
      title = props.content_type_model
        ? t('To get started, assign users to this {{resourceType}}.', {
            resourceType: getDisplayName(props.content_type_model),
          })
        : t('Add a role by clicking the button below.');
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
      emptyStateDescription={emptyStateDescription}
      emptyStateButtonIcon={<PlusCircleIcon />}
      emptyStateButtonText={props.addRoleButtonText ?? t('Add roles')}
      emptyStateActions={toolbarActions.slice(0, 1)}
      {...view}
    />
  );
}
