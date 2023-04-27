/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  ButtonVariant,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStateVariant,
  Title,
} from '@patternfly/react-core';
import { CubesIcon, PlusIcon, TrashIcon } from '@patternfly/react-icons';
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
import styled from 'styled-components';

const EmptyStateDiv = styled.div`
  height: 100%;
  background-color: var(--pf-global--BackgroundColor--100);
`;

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
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: TrashIcon,
        label: t('Remove selected roles from user'),
        onClick: () => alert('TODO'),
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
      },
    ],
    [t]
  );
  const isSysAdmin =
    view?.pageItems && view.pageItems.length > 0
      ? view.pageItems.some((role) => role.name === 'System Administrator')
      : false;

  if (isSysAdmin) {
    return (
      <EmptyStateDiv>
        <EmptyState variant={EmptyStateVariant.small} style={{ paddingTop: 48 }}>
          <EmptyStateIcon icon={CubesIcon} />
          <Title headingLevel="h2" size="lg">
            {t(`System Administrator`)}
          </Title>
          <EmptyStateBody>
            {t(`System administrators have unrestricted access to all resources.`)}
          </EmptyStateBody>
        </EmptyState>
      </EmptyStateDiv>
    );
  }

  return (
    <>
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
