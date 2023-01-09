/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Alert, ButtonVariant, Divider } from '@patternfly/react-core';
import { MinusCircleIcon, PlusIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IPageAction, PageActionType, PageTable } from '../../../../../framework';
import { DetailInfo } from '../../../../../framework/components/DetailInfo';
import { Team } from '../../../interfaces/Team';
import { User } from '../../../interfaces/User';
import { useControllerView } from '../../../useControllerView';
import { useRemoveTeamsFromUsers } from '../../teams/hooks/useRemoveTeamsFromUsers';
import { useSelectTeamsAddUsers } from '../../teams/hooks/useSelectTeamsAddUsers';
import { useTeamsColumns } from '../../teams/hooks/useTeamsColumns';
import { useTeamsFilters } from '../../teams/hooks/useTeamsFilters';

export function UserTeams(props: { user: User }) {
  const { user } = props;
  const { t } = useTranslation();
  const toolbarFilters = useTeamsFilters();
  const tableColumns = useTeamsColumns();
  const view = useControllerView<Team>({
    url: `/api/v2/users/${user.id}/teams/`,
    toolbarFilters,
    disableQueryString: true,
  });
  const selectTeamsAddUsers = useSelectTeamsAddUsers(view.selectItemsAndRefresh);
  const removeTeamsFromUsers = useRemoveTeamsFromUsers(view.unselectItemsAndRefresh);
  const toolbarActions = useMemo<IPageAction<Team>[]>(
    () => [
      {
        type: PageActionType.button,
        variant: ButtonVariant.primary,
        icon: PlusIcon,
        label: t('Add user to teams'),
        onClick: () => selectTeamsAddUsers([user]),
      },
      {
        type: PageActionType.bulk,
        icon: MinusCircleIcon,
        label: t('Remove user from selected teams'),
        onClick: () => removeTeamsFromUsers([user], view.selectedItems),
      },
    ],
    [t, selectTeamsAddUsers, user, removeTeamsFromUsers, view.selectedItems]
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
        emptyStateTitle={t('User is not a member of any teams.')}
        emptyStateDescription={t('To get started, add the user to a team.')}
        emptyStateButtonText={t('Add user to team')}
        emptyStateButtonClick={() => selectTeamsAddUsers([user])}
        {...view}
      />
    </>
  );
}
