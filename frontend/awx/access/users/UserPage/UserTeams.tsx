/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ButtonVariant } from '@patternfly/react-core';
import { CubesIcon, MinusCircleIcon, PlusCircleIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  PageTable,
} from '../../../../../framework';
import { DetailInfo } from '../../../../../framework/components/DetailInfo';
import { useGetItem } from '../../../../common/crud/useGet';
import { useOptions } from '../../../../common/crud/useOptions';
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
    url: awxAPI`/users/${user.id.toString()}/teams/`,
    toolbarFilters,
    disableQueryString: true,
  });
  const selectTeamsAddUsers = useSelectTeamsAddUsers(view.selectItemsAndRefresh);
  const removeTeamsFromUsers = useRemoveTeamsFromUsers(view.unselectItemsAndRefresh);
  const { data } = useOptions<OptionsResponse<ActionsResponse>>(awxAPI`/users/`);
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
              'You do not have permissions to add this user to a team. Please contact your organization administrator if there is an issue with your access.'
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
      <PageTable<Team>
        id="awx-teams-table"
        toolbarFilters={toolbarFilters}
        tableColumns={tableColumns}
        toolbarActions={toolbarActions}
        rowActions={rowActions}
        errorStateTitle={t('Error loading teams')}
        emptyStateTitle={
          canAddUserToTeam
            ? t('This user currently does not belong to any teams.')
            : t('You do not have permissions to add this user to a team.')
        }
        emptyStateDescription={
          canAddUserToTeam
            ? t('Please add a team by using the button below.')
            : t(
                'Please contact your organization administrator if there is an issue with your access.'
              )
        }
        emptyStateIcon={canAddUserToTeam ? undefined : CubesIcon}
        emptyStateButtonText={canAddUserToTeam ? t('Add team') : undefined}
        emptyStateButtonIcon={canAddUserToTeam ? <PlusCircleIcon /> : null}
        emptyStateButtonClick={canAddUserToTeam ? () => selectTeamsAddUsers([user]) : undefined}
        {...view}
      />
    </>
  );
}
