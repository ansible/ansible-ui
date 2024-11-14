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
import { useAssociateTeamAdmins } from './useAssociateTeamAdmins';
import { useRemoveTeamAdmins } from './useRemoveTeamAdmins';

export function useTeamAdminsToolbarActions(view: IPlatformView<PlatformUser>) {
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
  const associateAdmins = useAssociateTeamAdmins(view.refresh);
  const removeAdmins = useRemoveTeamAdmins(view.unselectItemsAndRefresh);

  const toolbarActions = useMemo<IPageAction<PlatformUser>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.None,
        variant: ButtonVariant.primary,
        isPinned: true,
        icon: PlusCircleIcon,
        label: t('Add administrators'),
        isDisabled: canEditTeam
          ? undefined
          : t(
              'You do not have permission to add administrators to this team. Please contact your system administrator if there is an issue with your access.'
            ),
        onClick: associateAdmins,
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: MinusCircleIcon,
        label: t('Remove administrators'),
        isDisabled: canEditTeam
          ? undefined
          : t(
              'You do not have permission to remove administrators from this team. Please contact your system administrator if there is an issue with your access.'
            ),
        onClick: removeAdmins,
        isDanger: true,
      },
    ],
    [t, canEditTeam, associateAdmins, removeAdmins]
  );

  return toolbarActions;
}

export function useTeamAdminsRowActions(view: IPlatformView<PlatformUser>) {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const { data: team } = useGetItem<PlatformTeam>(gatewayAPI`/teams`, params.id);
  const removeAdmins = useRemoveTeamAdmins(view.unselectItemsAndRefresh);
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
        label: t('Remove administrator'),
        isDisabled: canEditTeam
          ? ''
          : t(`The administrator cannot be removed due to insufficient permissions.`),
        onClick: (admin) => removeAdmins([admin]),
        isDanger: true,
      },
    ];
  }, [canEditTeam, removeAdmins, t]);

  return rowActions;
}
