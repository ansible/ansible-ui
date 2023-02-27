/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Alert, ButtonVariant, Divider } from '@patternfly/react-core';
import { CubesIcon, MinusCircleIcon, PlusIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IPageAction,
  IPageActionButton,
  PageActionType,
  PageTable,
} from '../../../../../framework';
import { DetailInfo } from '../../../../../framework/components/DetailInfo';
import { useOptions } from '../../../../Data';
import { ActionsResponse, OptionsResponse } from '../../../interfaces/OptionsResponse';
import { Team } from '../../../interfaces/Team';
import { User } from '../../../interfaces/User';
import { useAwxView } from '../../../useAwxView';
import { useRemoveTeamsFromUsers } from '../../teams/hooks/useRemoveTeamsFromUsers';
import { useSelectTeamsAddUsers } from '../../teams/hooks/useSelectTeamsAddUsers';
import { useTeamsColumns } from '../../teams/hooks/useTeamsColumns';
import { useTeamsFilters } from '../../teams/hooks/useTeamsFilters';

export function UserTeams(props: { user: User }) {
  const { user } = props;
  const { t } = useTranslation();
  const toolbarFilters = useTeamsFilters();
  const tableColumns = useTeamsColumns();
  const view = useAwxView<Team>({
    url: `/api/v2/users/${user.id}/teams/`,
    toolbarFilters,
    disableQueryString: true,
  });
  const selectTeamsAddUsers = useSelectTeamsAddUsers(view.selectItemsAndRefresh);
  const removeTeamsFromUsers = useRemoveTeamsFromUsers(view.unselectItemsAndRefresh);
  const { data } = useOptions<OptionsResponse<ActionsResponse>>({ url: '/api/v2/users/' });
  const canAddTeam = Boolean(data && data.actions && data.actions['POST']);

  const toolbarActions = useMemo<IPageAction<Team>[]>(
    () => [
      {
        type: PageActionType.button,
        variant: ButtonVariant.primary,
        icon: PlusIcon,
        label: t('Add user to teams'),
        isDisabled: canAddTeam
          ? undefined
          : t(
              'You do not have permissions to add this user to a team. Please contact your Organization Administrator if there is an issue with your access.'
            ),
        onClick: () => selectTeamsAddUsers([user]),
      } as IPageActionButton,
      {
        type: PageActionType.bulk,
        icon: MinusCircleIcon,
        label: t('Remove user from selected teams'),
        onClick: () => removeTeamsFromUsers([user], view.selectedItems),
      },
    ],
    [t, canAddTeam, selectTeamsAddUsers, user, removeTeamsFromUsers, view.selectedItems]
  );
  const rowActions = useMemo<IPageAction<Team>[]>(
    () => [
      {
        type: PageActionType.single,
        icon: MinusCircleIcon,
        label: t('Remove user from team'),
        onClick: (team: Team) => removeTeamsFromUsers([user], [team]),
      },
    ],
    [removeTeamsFromUsers, t, user]
  );
  return (
    <>
      {user.is_superuser && (
        <Alert
          variant="info"
          title={t('System administrators have unrestricted access to all resources.')}
          isInline
          style={{ border: 0 }}
        />
      )}
      <DetailInfo disablePaddingTop={user.is_superuser === true}>
        {t('Being a team member grants the user all the permissions of the team.')}
      </DetailInfo>
      <Divider />
      <PageTable<Team>
        toolbarFilters={toolbarFilters}
        tableColumns={tableColumns}
        toolbarActions={toolbarActions}
        rowActions={rowActions}
        errorStateTitle={t('Error loading teams')}
        emptyStateTitle={
          canAddTeam
            ? t('This user currently does not belong to any teams.')
            : t('You do not have permissions to add this user to a team.')
        }
        emptyStateDescription={
          canAddTeam
            ? t('Please add a team by using the button below.')
            : t(
                'Please contact your Organization Administrator if there is an issue with your access.'
              )
        }
        emptyStateIcon={canAddTeam ? undefined : CubesIcon}
        emptyStateButtonText={canAddTeam ? t('Add team') : undefined}
        emptyStateButtonIcon={canAddTeam ? <PlusIcon /> : null}
        emptyStateButtonClick={canAddTeam ? () => selectTeamsAddUsers([user]) : undefined}
        {...view}
      />
    </>
  );
}
