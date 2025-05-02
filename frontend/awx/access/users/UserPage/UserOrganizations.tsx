/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  PageTable,
} from '@ansible/ansible-ui-framework';
import { PageTableEmptyState } from '@ansible/ansible-ui-framework/PageTable/PageTableEmptyState';
import { DetailInfo } from '@ansible/ansible-ui-framework/components/DetailInfo';
import { useGetItem } from '@ansible/common-ui/crud/useGet';
import { Button, ButtonVariant } from '@patternfly/react-core';
import { MinusCircleIcon, PlusCircleIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { awxAPI } from '../../../common/api/awx-utils';
import { useAwxView } from '../../../common/useAwxView';
import { Organization } from '../../../interfaces/Organization';
import { AwxUser } from '../../../interfaces/User';
import {
  useOrganizationsColumns,
  useOrganizationsFilters,
} from '../../organizations/Organizations';
import { useRemoveOrganizationsFromUsers } from '../../organizations/hooks/useRemoveOrganizationsFromUsers';
import { useSelectOrganizationsAddUsers } from '../../organizations/hooks/useSelectOrganizationsAddUsers';

export function UserOrganizations() {
  const params = useParams<{ id: string }>();
  const { data: user } = useGetItem<AwxUser>(awxAPI`/users`, params.id);

  if (!user) {
    return null;
  }
  return <UserOrganizationsInternal user={user} />;
}

function UserOrganizationsInternal(props: { user: AwxUser }) {
  const { t } = useTranslation();
  const { user } = props;
  const toolbarFilters = useOrganizationsFilters();
  const tableColumns = useOrganizationsColumns();

  const view = useAwxView<Organization>({
    url: awxAPI`/users/${user?.id.toString()}/organizations/`,
    toolbarFilters,
    disableQueryString: true,
  });

  const selectOrganizationsAddUsers = useSelectOrganizationsAddUsers(view.selectItemsAndRefresh);
  const removeOrganizationsFromUsers = useRemoveOrganizationsFromUsers();
  const toolbarActions = useMemo<IPageAction<Organization>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.None,
        variant: ButtonVariant.primary,
        isPinned: true,
        icon: PlusCircleIcon,
        label: t('Add users to organizations'),
        onClick: () => selectOrganizationsAddUsers([user]),
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: MinusCircleIcon,
        label: t('Remove users from organizations'),
        onClick: () =>
          removeOrganizationsFromUsers([user], view.selectedItems, view.unselectItemsAndRefresh),
        isDanger: true,
      },
    ],
    [
      removeOrganizationsFromUsers,
      selectOrganizationsAddUsers,
      t,
      user,
      view.selectedItems,
      view.unselectItemsAndRefresh,
    ]
  );
  const rowActions = useMemo<IPageAction<Organization>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: MinusCircleIcon,
        label: t('Remove user from organization'),
        onClick: (organization) =>
          removeOrganizationsFromUsers([user], [organization], view.unselectItemsAndRefresh),
        isDanger: true,
      },
    ],
    [removeOrganizationsFromUsers, t, user, view.unselectItemsAndRefresh]
  );
  return (
    <>
      <DetailInfo
        title={t(
          'Adding a user to an organization adds them as a member only. Permissions can be granted using teams and user roles.'
        )}
      />
      <PageTable<Organization>
        id="awx-organizations-table"
        toolbarFilters={toolbarFilters}
        tableColumns={tableColumns}
        toolbarActions={toolbarActions}
        rowActions={rowActions}
        errorStateTitle={t('Error loading organizations')}
        emptyState={
          <PageTableEmptyState
            title={t('User is not a member of any organizations.')}
            description={t('To get started, add the user to an organization.')}
          >
            <Button
              variant={ButtonVariant.primary}
              icon={<PlusCircleIcon />}
              onClick={() => selectOrganizationsAddUsers([user])}
            ></Button>
          </PageTableEmptyState>
        }
        {...view}
      />
    </>
  );
}
