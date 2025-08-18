import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  usePageNavigate,
} from '@ansible/ansible-ui-framework';
import { ActionsResponse, OptionsResponse } from '@ansible/awx-ui/interfaces/OptionsResponse';
import { TeamAssignment } from '@ansible/common-ui/access/interfaces/TeamAssignment';
import { useGetItem } from '@ansible/common-ui/crud/useGet';
import { useOptions } from '@ansible/common-ui/crud/useOptions';
import { ButtonVariant } from '@patternfly/react-core';
import { MinusCircleIcon, PlusCircleIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { IPlatformView } from '../../../hooks/usePlatformView';
import { PlatformTeam } from '../../../interfaces/PlatformTeam';
import { PlatformRoute } from '../../../main/PlatformRoutes';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import { useRemoveTeamRoleAssignments } from './useRemoveTeamRoleAssignments';

export function useTeamRolesToolbarActions(view: IPlatformView<TeamAssignment>) {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const pageNavigate = usePageNavigate();
  const { data: team } = useGetItem<PlatformTeam>(gatewayAPI`/teams`, params.id);
  const { data: teamOptions } = useOptions<OptionsResponse<ActionsResponse>>(
    gatewayAPI`/teams/${team?.id?.toString() ?? ''}/`
  );
  const canEditTeam = Boolean(
    teamOptions?.actions && (teamOptions.actions['PUT'] || teamOptions.actions['PATCH'])
  );

  const removeTeamRoles = useRemoveTeamRoleAssignments(view.unselectItemsAndRefresh);
  const toolbarActions = useMemo<IPageAction<TeamAssignment>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.None,
        variant: ButtonVariant.primary,
        isPinned: true,
        icon: PlusCircleIcon,
        label: t('Assign roles'),
        isDisabled: canEditTeam
          ? undefined
          : t(
              'You do not have permission to assign roles to this team. Please contact your system administrator if there is an issue with your access.'
            ),
        onClick: () => {
          pageNavigate(PlatformRoute.TeamAssignRoles, { params: { id: params.id } });
        },
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: MinusCircleIcon,
        label: t('Remove roles'),
        isDisabled: canEditTeam
          ? undefined
          : t(
              'You do not have permission to remove roles from this team. Please contact your system administrator if there is an issue with your access.'
            ),
        onClick: removeTeamRoles,
        isDanger: true,
      },
    ],
    [t, canEditTeam, pageNavigate, params.id, removeTeamRoles]
  );

  return toolbarActions;
}

export function useTeamRolesRowActions(view: IPlatformView<TeamAssignment>) {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const { data: team } = useGetItem<PlatformTeam>(gatewayAPI`/teams`, params.id);
  const { data: teamOptions } = useOptions<OptionsResponse<ActionsResponse>>(
    gatewayAPI`/teams/${team?.id?.toString() ?? ''}/`
  );
  const canEditTeam = Boolean(
    teamOptions?.actions && (teamOptions.actions['PUT'] || teamOptions.actions['PATCH'])
  );
  const removeTeamRoles = useRemoveTeamRoleAssignments(view.unselectItemsAndRefresh);

  const rowActions = useMemo<IPageAction<TeamAssignment>[]>(() => {
    return [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: MinusCircleIcon,
        isPinned: true,
        label: t('Remove role'),
        isDisabled: canEditTeam
          ? ''
          : t(`The role cannot be removed due to insufficient permissions.`),
        onClick: (role) => removeTeamRoles([role]),
        isDanger: true,
      },
    ];
  }, [canEditTeam, t, removeTeamRoles]);

  return rowActions;
}
