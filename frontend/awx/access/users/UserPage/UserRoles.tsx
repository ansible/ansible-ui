/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  ButtonVariant,
  EmptyState,
  EmptyStateBody,
  EmptyStateHeader,
  EmptyStateIcon,
} from '@patternfly/react-core';
import { CubesIcon, PlusCircleIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  PageTable,
  usePageNavigate,
} from '../../../../../framework';
import { useGetItem } from '../../../../common/crud/useGet';
import { awxAPI } from '../../../common/api/awx-utils';
import { useAwxView } from '../../../common/useAwxView';
import { Role } from '../../../interfaces/Role';
import { User } from '../../../interfaces/User';
import { AwxRoute } from '../../../main/AwxRoutes';
import { useRolesColumns } from '../../roles/useRolesColumns';
import { useRolesFilters } from '../../roles/useRolesFilters';

export function UserRoles() {
  const params = useParams<{ id: string }>();
  const { data: user } = useGetItem<User>(awxAPI`/users`, params.id);

  if (!user) {
    return null;
  }
  return <UserRolesInternal user={user} />;
}

function UserRolesInternal(props: { user: User }) {
  const { user } = props;
  const { t } = useTranslation();
  const toolbarFilters = useRolesFilters();
  const tableColumns = useRolesColumns();
  const pageNavigate = usePageNavigate();
  const view = useAwxView<Role>({
    url: awxAPI`/users/${user.id.toString()}/roles/`,
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
        icon: PlusCircleIcon,
        label: t('Add role to user'),
        onClick: () => pageNavigate(AwxRoute.AddRolesToUser, { params: { id: user.id } }),
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
    [pageNavigate, t, user.id]
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
  const isSysAdmin =
    view?.pageItems && view.pageItems.length > 0
      ? view.pageItems.some((role) => role.name === 'System Administrator')
      : false;

  if (isSysAdmin) {
    return (
      <EmptyState isFullHeight>
        <EmptyStateHeader
          titleText={<>{t(`System Administrator`)}</>}
          icon={<EmptyStateIcon icon={CubesIcon} />}
          headingLevel="h2"
        />
        <EmptyStateBody>
          {t(`System administrators have unrestricted access to all resources.`)}
        </EmptyStateBody>
      </EmptyState>
    );
  }

  return (
    <>
      <PageTable<Role>
        id="awx-roles-table"
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
