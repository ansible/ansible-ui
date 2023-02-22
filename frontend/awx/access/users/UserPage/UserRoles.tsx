/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Alert, ButtonVariant } from '@patternfly/react-core';
import { PlusIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { IPageAction, PageActionType, PageTable } from '../../../../../framework';
import { RouteE } from '../../../../Routes';
import { Role } from '../../../interfaces/Role';
import { User } from '../../../interfaces/User';
import { useControllerView } from '../../../useAwxView';
import { useRolesColumns, useRolesFilters } from '../../roles/Roles';

export function UserRoles(props: { user: User }) {
  const { user } = props;
  const { t } = useTranslation();
  const toolbarFilters = useRolesFilters();
  const tableColumns = useRolesColumns();
  const navigate = useNavigate();
  const view = useControllerView<Role>({
    url: `/api/v2/users/${user.id}/roles/`,
    toolbarFilters,
    tableColumns,
    disableQueryString: true,
  });
  const toolbarActions = useMemo<IPageAction<Role>[]>(
    () => [
      {
        type: PageActionType.button,
        variant: ButtonVariant.primary,
        icon: PlusIcon,
        label: t('Add role to user'),
        shortLabel: t('Add role'),
        onClick: () => navigate(RouteE.AddRolesToUser.replace(':id', user.id.toString())),
      },
      {
        type: PageActionType.bulk,
        icon: TrashIcon,
        label: t('Remove selected roles from user'),
        shortLabel: t('Remove roles'),
        onClick: () => alert('TODO'),
      },
    ],
    [navigate, t, user.id]
  );
  const rowActions = useMemo<IPageAction<Role>[]>(
    () => [
      {
        type: PageActionType.single,
        variant: ButtonVariant.primary,
        icon: TrashIcon,
        label: t('Remove role from user'),
        onClick: () => alert('TODO'),
      },
    ],
    [t]
  );
  return (
    <>
      {user.is_superuser && (
        <Alert
          variant="warning"
          title={t('System administrators have unrestricted access to all resources.')}
          isInline
          style={{ border: 0 }}
        />
      )}
      {user.is_system_auditor && (
        <Alert
          variant="warning"
          title={t('System auditor have unrestricted access to all resources.')}
          isInline
          style={{ border: 0 }}
        />
      )}
      <PageTable<Role>
        toolbarFilters={toolbarFilters}
        tableColumns={tableColumns}
        toolbarActions={toolbarActions}
        rowActions={rowActions}
        errorStateTitle={t('Error loading roles')}
        emptyStateTitle={t('User does not have any roles.')}
        emptyStateDescription={t('To get started, add roles to the user.')}
        emptyStateButtonText={t('Add role to user')}
        // emptyStateButtonClick={() => history(RouteE.CreateUser)}
        {...view}
      />
    </>
  );
}
