import { useTranslation } from 'react-i18next';
import {
  HubAccessRole,
  PropsForHubRoleListForTeam,
  PropsForHubRoleListForUser,
} from './HubResourceAccessInterfaces';
import { useMemo } from 'react';
import {
  IPageAction,
  ITableColumn,
  IToolbarFilter,
  PageActionSelection,
  PageActionType,
  PageTable,
  TextCell,
  ToolbarFilterType,
  useGetPageUrl,
  useInMemoryView,
} from '../../../../framework';
import { CubesIcon, PlusCircleIcon, TrashIcon } from '@patternfly/react-icons';
import { HubRoute } from '../../main/HubRoutes';
import { RoleExpandedRow } from '../roles/components/RoleExpandedRow';

function roleKeyFn(role: HubAccessRole) {
  return role.name;
}

export function HubResourceAccessRoles(
  props: PropsForHubRoleListForUser | PropsForHubRoleListForTeam
) {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const { user, team, canEditAccess } = props;

  const mappedRoles = useMemo(() => {
    if (user) {
      return user.object_roles?.map((role) => ({
        name: role,
      }));
    } else if (team) {
      return team.object_roles.map((role) => ({
        name: role,
      }));
    }
  }, [team, user]);

  const tableColumns = useMemo<ITableColumn<HubAccessRole>[]>(
    () => [
      {
        header: t('Role'),
        cell: (role) => <TextCell text={role.name} />,
        key: 'name',
        value: (role) => role.name,
        sort: 'name',
        card: 'name',
        list: 'name',
      },
    ],
    [t]
  );

  const toolbarActions = useMemo<IPageAction<HubAccessRole>[]>(
    () => [
      {
        type: PageActionType.Link,
        selection: PageActionSelection.None,
        isPinned: true,
        icon: PlusCircleIcon,
        label: t('Add role'),
        isDisabled: canEditAccess
          ? undefined
          : t(
              'You do not have permission to add a role. Please contact your system administrator if there is an issue with your access.'
            ),
        href: user
          ? `${getPageUrl(HubRoute.NamespaceUserAccessAddRoles)}`
          : `${getPageUrl(HubRoute.NamespaceTeamAccessAddRoles)}`,
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: TrashIcon,
        label: t('Delete selected roles'),
        onClick: () => alert(t('Todo')),
        isDanger: true,
      },
    ],
    [canEditAccess, getPageUrl, t, user]
  );

  const rowActions = useMemo<IPageAction<HubAccessRole>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Delete role'),
        onClick: () => alert(t('Todo')),
        isDisabled: canEditAccess
          ? undefined
          : t(
              'You do not have permission to delete a role. Please contact your system administrator if there is an issue with your access.'
            ),
        isDanger: true,
      },
    ],
    [canEditAccess, t]
  );

  const toolbarFilters = useMemo(() => {
    const filters: IToolbarFilter[] = [
      {
        type: ToolbarFilterType.Text,
        label: t('Role'),
        key: 'name',
        query: 'name',
        comparison: 'contains',
        placeholder: t('Filter by name'),
        isPinned: true,
      },
    ];
    return filters;
  }, [t]);

  const view = useInMemoryView<HubAccessRole>({
    keyFn: roleKeyFn,
    items: mappedRoles,
    tableColumns,
    toolbarFilters,
  });

  return (
    <PageTable
      {...view}
      tableColumns={tableColumns}
      toolbarFilters={toolbarFilters}
      toolbarActions={toolbarActions}
      expandedRow={(role) => <RoleExpandedRow role={role} showCustom={true} />}
      rowActions={rowActions}
      emptyStateTitle={
        canEditAccess
          ? t('There are currently no roles added.')
          : t('You do not have permission to add a role.')
      }
      emptyStateDescription={
        canEditAccess
          ? t('Please add a role by using the button below.')
          : t(
              'Please contact your organization administrator if there is an issue with your access.'
            )
      }
      emptyStateIcon={canEditAccess ? undefined : CubesIcon}
      emptyStateActions={canEditAccess ? toolbarActions.slice(0, 1) : undefined}
      defaultSubtitle={t('Users')}
      errorStateTitle={t('Error loading users.')}
    />
  );
}
