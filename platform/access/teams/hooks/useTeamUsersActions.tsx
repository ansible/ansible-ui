import { IPageAction, PageActionSelection, PageActionType } from '@ansible/ansible-ui-framework';
import { ActionsResponse, OptionsResponse } from '@ansible/awx-ui/interfaces/OptionsResponse';
import { ButtonVariant } from '@patternfly/react-core';
import { MinusCircleIcon, PlusCircleIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useGetItem } from '../../../../frontend/common/crud/useGet';
import { useOptions } from '../../../../frontend/common/crud/useOptions';
import { IPlatformView } from '../../../hooks/usePlatformView';
import { PlatformTeam } from '../../../interfaces/PlatformTeam';
import { PlatformUser } from '../../../interfaces/PlatformUser';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import { useAssociateTeamUsers } from './useAssociateTeamUsers';
import { useRemoveTeamUsers } from './useRemoveTeamUsers';

export function useTeamUsersToolbarActions(view: IPlatformView<PlatformUser>) {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const { data: team } = useGetItem<PlatformTeam>(gatewayAPI`/teams`, params.id);
  const { data: teamOptions } = useOptions<OptionsResponse<ActionsResponse>>(
    gatewayAPI`/teams/${team?.id?.toString() ?? ''}/`
  );
  const canEditTeam = Boolean(
    teamOptions &&
      teamOptions.actions &&
      (teamOptions.actions['PUT'] || teamOptions.actions['PATCH'])
  );
  const associateUsers = useAssociateTeamUsers(view.refresh);
  const removeUsers = useRemoveTeamUsers(view.unselectItemsAndRefresh);

  const toolbarActions = useMemo<IPageAction<PlatformUser>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.None,
        variant: ButtonVariant.primary,
        isPinned: true,
        icon: PlusCircleIcon,
        label: t('Add users'),
        isDisabled: canEditTeam
          ? undefined
          : t(
              'You do not have permission to add users to this team. Please contact your system administrator if there is an issue with your access.'
            ),
        onClick: associateUsers,
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: MinusCircleIcon,
        label: t('Remove users'),
        isDisabled: canEditTeam
          ? undefined
          : t(
              'You do not have permission to remove users from this team. Please contact your system administrator if there is an issue with your access.'
            ),
        onClick: removeUsers,
        isDanger: true,
      },
    ],
    [t, canEditTeam, associateUsers, removeUsers]
  );

  return toolbarActions;
}

export function useTeamUsersRowActions(view: IPlatformView<PlatformUser>) {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const { data: team } = useGetItem<PlatformTeam>(gatewayAPI`/teams`, params.id);
  const removeUsers = useRemoveTeamUsers(view.unselectItemsAndRefresh);
  const { data: teamOptions } = useOptions<OptionsResponse<ActionsResponse>>(
    gatewayAPI`/teams/${team?.id?.toString() ?? ''}/`
  );
  const canEditTeam = Boolean(
    teamOptions &&
      teamOptions.actions &&
      (teamOptions.actions['PUT'] || teamOptions.actions['PATCH'])
  );

  const rowActions = useMemo<IPageAction<PlatformUser>[]>(() => {
    return [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: MinusCircleIcon,
        isPinned: true,
        label: t('Remove user'),
        isDisabled: canEditTeam
          ? ''
          : t(`The user cannot be removed due to insufficient permissions.`),
        onClick: (user) => removeUsers([user]),
        isDanger: true,
      },
    ];
  }, [canEditTeam, removeUsers, t]);

  return rowActions;
}
