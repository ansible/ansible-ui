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
import { usePlatformView } from '@ansible/platform-ui/hooks/usePlatformView';
import { ButtonVariant } from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useMapContentTypeToDisplayName } from '../hooks/useMapContentTypeToDisplayName';
import { useResourceRolesActions } from '../hooks/useResourceRolesActions';
import { UserRoleAccess } from '../interfaces/UserRoleAccess';

type QueryParams = {
  [key: string]: string;
};

type AccessProps<T extends UserRoleAccess> = {
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
  manageRolesRoute?: string;
  accessListType: 'user' | 'team' | 'user-roles' | 'team-roles';
  addRoleButtonText?: string;
};

export function AccessList<T extends UserRoleAccess>(props: AccessProps<T>) {
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
      ...(firstColumns ?? []),
      ...(lastColumns ?? []),
    ],
    [
      props.tableColumnFunctions.name.label,
      props.tableColumnFunctions.name.sort,
      props.tableColumnFunctions.name.function,
      props.tableColumnFunctions.name.to,
      firstColumns,
      lastColumns,
    ]
  );
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
      ...(props.additionalTableFilters ?? []),
    ],
    [props.accessListType, props.toolbarNameColumnFiltersValues, props.additionalTableFilters, t]
  );
  const queryParams = useMemo<QueryParams>(() => {
    let params = {};
    switch (props.accessListType) {
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
  }, [props.id, props.accessListType]);
  const view = usePlatformView<T>({
    url: props.url,
    tableColumns,
    toolbarFilters,
    queryParams: queryParams,
  });
  const rowActions = useResourceRolesActions(props?.manageRolesRoute ?? '', params?.id);

  const toolbarActions = useMemo<IPageAction<T>[]>(
    () => [
      {
        type: PageActionType.Link,
        selection: PageActionSelection.None,
        variant: ButtonVariant.primary,
        isPinned: true,
        icon: PlusCircleIcon,
        label: props.addRoleButtonText ?? t('Assign roles'),
        href: getPageUrl(props.addRolesRoute ?? '', { params: { id: params.id } }),
      },
    ],
    [t, getPageUrl, props.addRolesRoute, props.addRoleButtonText, params.id]
  );
  const emptyStateTitle = useMemo(() => {
    let title: string;
    switch (props.accessListType) {
      case 'user':
        title = props.content_type_model
          ? t('No users assigned to this {{resourceType}}.', {
              resourceType: getDisplayName(props.content_type_model),
            })
          : t('No users assigned to this resource.');
        break;
      case 'team':
        title = props.content_type_model
          ? t('No teams assigned to {{resourceType}}', {
              resourceType: getDisplayName(props.content_type_model),
            })
          : t('No teams assigned to this resource');
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

  const emptyStateDescription = useMemo(() => {
    let title: string;
    if (props.accessListType === 'team') {
      title = props.content_type_model
        ? t('To get started, assign teams to this {{resourceType}}.', {
            resourceType: getDisplayName(props.content_type_model),
          })
        : t('To get started, assign teams to this resource.');
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
    <PageTable<T>
      id={
        props.content_type_model
          ? `${props.service}-${props.content_type_model}-access-table`
          : `${props.service}-${props.accessListType}-table`
      }
      tableColumns={tableColumns}
      toolbarActions={toolbarActions}
      toolbarFilters={toolbarFilters}
      rowActions={rowActions as IPageAction<T>[] | undefined}
      errorStateTitle={t('Error loading access data.')}
      emptyStateTitle={emptyStateTitle}
      emptyStateDescription={emptyStateDescription}
      emptyStateButtonIcon={<PlusCircleIcon />}
      emptyStateButtonText={props.addRoleButtonText ?? t('Assign roles')}
      emptyStateActions={toolbarActions.slice(0, 1)}
      {...view}
    />
  );
}
