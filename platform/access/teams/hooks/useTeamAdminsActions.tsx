import { useTranslation } from 'react-i18next';
import { useOptions } from '../../../../frontend/common/crud/useOptions';
import { IPlatformView } from '../../../hooks/usePlatformView';
import { PlatformUser } from '../../../interfaces/PlatformUser';
import {
  ActionsResponse,
  OptionsResponse,
} from '../../../../frontend/awx/interfaces/OptionsResponse';
import { gatewayV1API } from '../../../api/gateway-api-utils';
import { useMemo } from 'react';
import { IPageAction, PageActionSelection, PageActionType } from '../../../../framework';
import { ButtonVariant } from '@patternfly/react-core';
import { PlusCircleIcon, TrashIcon } from '@patternfly/react-icons';
import { PlatformTeam } from '../../../interfaces/PlatformTeam';
import { useGetItem } from '../../../../frontend/common/crud/useGet';
import { useParams } from 'react-router-dom';
import { useRemoveTeamAdmins } from './useRemoveTeamAdmins';
import { useAssociateTeamAdmins } from './useAssociateTeamAdmins';

export function useTeamAdminsToolbarActions(view: IPlatformView<PlatformUser>) {
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
        label: t('Add administrator(s)'),
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
        icon: TrashIcon,
        label: t('Remove selected administrators'),
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
  const { data: team } = useGetItem<PlatformTeam>(gatewayV1API`/teams`, params.id);
  const removeAdmins = useRemoveTeamAdmins(view.unselectItemsAndRefresh);
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
