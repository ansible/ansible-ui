/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Alert, ButtonVariant } from '@patternfly/react-core';
import { PlusIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  PageTable,
} from '../../../../../framework';
import { RouteObj } from '../../../../Routes';
import { Role } from '../../../interfaces/Role';
import { User } from '../../../interfaces/User';
import { useAwxView } from '../../../useAwxView';
import { useRolesColumns, useRolesFilters } from '../../roles/Roles';

export function UserRoles(props: { user: User }) {
  const { user } = props;
  const { t } = useTranslation();
  const toolbarFilters = useRolesFilters();
  const tableColumns = useRolesColumns();
  const navigate = useNavigate();
  const view = useAwxView<Role>({
    url: `/api/v2/users/${user.id}/roles/`,
    toolbarFilters,
    tableColumns,
    disableQueryString: true,
  });
  const toolbarActions = useMemo<IPageAction<Role>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.None,
        variant: ButtonVariant.primary,
        isPinned: true,
        icon: PlusIcon,
        label: t('Add role to user'),
        onClick: () => navigate(RouteObj.AddRolesToUser.replace(':id', user.id.toString())),
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: TrashIcon,
        label: t('Remove selected roles from user'),
        onClick: () => alert('TODO'),
        isDanger: true,
      },
    ],
    [navigate, t, user.id]
  );
  const rowActions = useMemo<IPageAction<Role>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        variant: ButtonVariant.primary,
        isPinned: true,
        icon: TrashIcon,
        label: t('Remove role from user'),
        onClick: () => alert('TODO'),
        isDanger: true,
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
        // emptyStateButtonClick={() => history(RouteObj.CreateUser)}
        {...view}
      />
    </>
  );
}
