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
  const { data: associateOptions } = useOptions<OptionsResponse<ActionsResponse>>(
    gatewayV1API`/teams/${team?.id?.toString() ?? ''}/users/associate`
  );
  const { data: disassociateOptions } = useOptions<OptionsResponse<ActionsResponse>>(
    gatewayV1API`/teams/${team?.id?.toString() ?? ''}/users/disassociate`
  );

  const canAssociateUser = Boolean(associateOptions?.actions && associateOptions.actions['POST']);
  const canRemoveUser = Boolean(
    disassociateOptions?.actions && disassociateOptions.actions['POST']
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
        label: t('Associate user(s)'),
        isDisabled: canAssociateUser
          ? undefined
          : t(
              'You do not have permission to associate users with this team. Please contact your system administrator if there is an issue with your access.'
            ),
        onClick: associateUsers,
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: TrashIcon,
        label: t('Remove selected users'),
        isDisabled: canRemoveUser
          ? undefined
          : t(
              'You do not have permission to remove users from this team. Please contact your system administrator if there is an issue with your access.'
            ),
        onClick: removeUsers,
        isDanger: true,
      },
    ],
    [t, canAssociateUser, canRemoveUser, removeUsers, associateUsers]
  );

  return toolbarActions;
}

export function useTeamUsersRowActions(view: IPlatformView<PlatformUser>) {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const { data: team } = useGetItem<PlatformTeam>(gatewayV1API`/teams`, params.id);
  const removeUsers = useRemoveTeamUsers(view.unselectItemsAndRefresh);
  const { data: disassociateOptions } = useOptions<OptionsResponse<ActionsResponse>>(
    gatewayV1API`/teams/${team?.id?.toString() ?? ''}/users/disassociate`
  );
  const canRemoveUser = Boolean(
    disassociateOptions?.actions && disassociateOptions.actions['POST']
  );

  const rowActions = useMemo<IPageAction<PlatformUser>[]>(() => {
    return [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Remove user'),
        isDisabled: canRemoveUser
          ? ''
          : t(`The user cannot be removed due to insufficient permissions.`),
        onClick: (user) => removeUsers([user]),
        isDanger: true,
      },
    ];
  }, [canRemoveUser, removeUsers, t]);

  return rowActions;
}
