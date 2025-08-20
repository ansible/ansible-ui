/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  PageTable,
} from '@ansible/ansible-ui-framework';
import { DetailInfo } from '@ansible/ansible-ui-framework/components/DetailInfo';
import { PageLoadingTable } from '@ansible/ansible-ui-framework/PageTable/PageLoadingTable';
import { PageTableEmptyState } from '@ansible/ansible-ui-framework/PageTable/PageTableEmptyState';
import { useGetItem } from '@ansible/common-ui/crud/useGet';
import { useOptions } from '@ansible/common-ui/crud/useOptions';
import { Button, ButtonVariant } from '@patternfly/react-core';
import { CubesIcon, MinusCircleIcon, PlusCircleIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { awxAPI } from '../../../common/api/awx-utils';
import { useAwxView } from '../../../common/useAwxView';
import { ActionsResponse, OptionsResponse } from '../../../interfaces/OptionsResponse';
import { Team } from '../../../interfaces/Team';
import { AwxUser } from '../../../interfaces/User';
import { useRemoveTeamsFromUsers } from '../../teams/hooks/useRemoveTeamsFromUsers';
import { useSelectTeamsAddUsers } from '../../teams/hooks/useSelectTeamsAddUsers';
import { useTeamsColumns } from '../../teams/hooks/useTeamsColumns';
import { useTeamsFilters } from '../../teams/hooks/useTeamsFilters';

export function UserTeams() {
  const params = useParams<{ id: string }>();
  const { data: user } = useGetItem<AwxUser>(awxAPI`/users`, params.id);

  if (!user) {
    return null;
  }
  return <UserTeamsInternal user={user} />;
}

function UserTeamsInternal(props: { user: AwxUser }) {
  const { user } = props;
  const { t } = useTranslation();
  const toolbarFilters = useTeamsFilters();
  const tableColumns = useTeamsColumns();
  const view = useAwxView<Team>({
    url: awxAPI`/users/${user?.id.toString()}/teams/`,
    toolbarFilters,
    disableQueryString: true,
  });
  const selectTeamsAddUsers = useSelectTeamsAddUsers(view.selectItemsAndRefresh);
  const removeTeamsFromUsers = useRemoveTeamsFromUsers(view.unselectItemsAndRefresh);
  const { data, isLoading: isLoadingUserOptions } = useOptions<OptionsResponse<ActionsResponse>>(
    awxAPI`/users/`
  );
  const canAddUserToTeam = Boolean(data && data.actions && data.actions['POST']);

  const toolbarActions = useMemo<IPageAction<Team>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.None,
        variant: ButtonVariant.primary,
        isPinned: true,
        icon: PlusCircleIcon,
        label: t('Add users to teams'),
        isDisabled: canAddUserToTeam
          ? undefined
          : t(
              'You do not have permissions to assign this user to a team. Please contact your organization administrator if there is an issue with your access.'
            ),
        onClick: () => selectTeamsAddUsers([user]),
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: MinusCircleIcon,
        label: t('Remove users from teams'),
        onClick: () => removeTeamsFromUsers([user], view.selectedItems),
        isDanger: true,
      },
    ],
    [t, canAddUserToTeam, selectTeamsAddUsers, user, removeTeamsFromUsers, view.selectedItems]
  );

  const rowActions = useMemo<IPageAction<Team>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: MinusCircleIcon,
        label: t('Remove user from team'),
        onClick: (team: Team) => removeTeamsFromUsers([user], [team]),
        isDanger: true,
      },
    ],
    [removeTeamsFromUsers, t, user]
  );

  return (
    <>
      <DetailInfo
        title={t('Being a team member grants the user all the permissions of the team.')}
      />
      {isLoadingUserOptions ? (
        <PageLoadingTable />
      ) : (
        <PageTable<Team>
          id="awx-teams-table"
          toolbarFilters={toolbarFilters}
          tableColumns={tableColumns}
          toolbarActions={toolbarActions}
          rowActions={rowActions}
          errorStateTitle={t('Error loading teams')}
          emptyState={
            canAddUserToTeam ? (
              <PageTableEmptyState
                title={t('This user currently does not belong to any teams.')}
                description={t('To get started, assign the user to a team.')}
              >
                <Button
                  variant={ButtonVariant.primary}
                  icon={<PlusCircleIcon />}
                  onClick={() => selectTeamsAddUsers([user])}
                >
                  {t('Assign team')}
                </Button>
              </PageTableEmptyState>
            ) : (
              <PageTableEmptyState
                icon={CubesIcon}
                title={t('You do not have permissions to assign this user to a team.')}
                description={t(
                  'Please contact your organization administrator if there is an issue with your access.'
                )}
              />
            )
          }
          {...view}
        />
      )}
    </>
  );
}
