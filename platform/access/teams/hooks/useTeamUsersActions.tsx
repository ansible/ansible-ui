import { useTranslation } from 'react-i18next';
import { useOptions } from '../../../../frontend/common/crud/useOptions';
import { IPlatformView } from '../../../hooks/usePlatformView';
import { PlatformUser } from '../../../interfaces/PlatformUser';
import {
  ActionsResponse,
  OptionsResponse,
} from '../../../../frontend/awx/interfaces/OptionsResponse';
import { gatewayV1API } from '../../../api/gateway-api-utils';
import { useRemoveTeamUsers } from './useRemoveTeamUsers';
import { useMemo } from 'react';
import { IPageAction, PageActionSelection, PageActionType } from '../../../../framework';
import { ButtonVariant } from '@patternfly/react-core';
import { PlusCircleIcon, TrashIcon } from '@patternfly/react-icons';
import { PlatformTeam } from '../../../interfaces/PlatformTeam';
import { useAssociateTeamUsers } from './useAssociateTeamUsers';
import { useGetItem } from '../../../../frontend/common/crud/useGet';
import { useParams } from 'react-router-dom';

export function useTeamUsersToolbarActions(view: IPlatformView<PlatformUser>) {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const { data: team } = useGetItem<PlatformTeam>(gatewayV1API`/teams`, params.id);
  const { data: teamOptions } = useOptions<OptionsResponse<ActionsResponse>>(
    gatewayV1API`/teams/${team?.id?.toString() ?? ''}/`
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
        label: t('Add user(s)'),
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
        icon: TrashIcon,
        label: t('Remove selected users'),
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
  const { data: team } = useGetItem<PlatformTeam>(gatewayV1API`/teams`, params.id);
  const removeUsers = useRemoveTeamUsers(view.unselectItemsAndRefresh);
  const { data: teamOptions } = useOptions<OptionsResponse<ActionsResponse>>(
    gatewayV1API`/teams/${team?.id?.toString() ?? ''}/`
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
        icon: TrashIcon,
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
