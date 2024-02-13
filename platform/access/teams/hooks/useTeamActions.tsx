import { ButtonVariant } from '@patternfly/react-core';
import { PencilAltIcon, PlusCircleIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  useGetPageUrl,
  usePageNavigate,
} from '../../../../framework';
import {
  ActionsResponse,
  OptionsResponse,
} from '../../../../frontend/awx/interfaces/OptionsResponse';
import { useOptions } from '../../../../frontend/common/crud/useOptions';
import { gatewayV1API } from '../../../api/gateway-api-utils';
import { IPlatformView } from '../../../hooks/usePlatformView';
import { PlatformTeam } from '../../../interfaces/PlatformTeam';
import { PlatformRoute } from '../../../main/PlatformRoutes';
import { useDeleteTeams } from './useDeleteTeams';

export function useTeamToolbarActions(view: IPlatformView<PlatformTeam>) {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();

  const { data } = useOptions<OptionsResponse<ActionsResponse>>(gatewayV1API`/teams/`);
  const canCreateTeam = Boolean(data && data.actions && data.actions['POST']);
  const deleteTeams = useDeleteTeams(view.unselectItemsAndRefresh);

  const toolbarActions = useMemo<IPageAction<PlatformTeam>[]>(
    () => [
      {
        type: PageActionType.Link,
        selection: PageActionSelection.None,
        variant: ButtonVariant.primary,
        isPinned: true,
        icon: PlusCircleIcon,
        label: t('Create team'),
        isDisabled: canCreateTeam
          ? undefined
          : t(
              'You do not have permission to create a team. Please contact your system administrator if there is an issue with your access.'
            ),
        href: getPageUrl(PlatformRoute.CreateTeam),
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: TrashIcon,
        label: t('Delete selected teams'),
        onClick: deleteTeams,
        isDanger: true,
      },
    ],
    [t, canCreateTeam, getPageUrl, deleteTeams]
  );

  return toolbarActions;
}

export function useTeamRowActions(view: IPlatformView<PlatformTeam>) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const deleteTeams = useDeleteTeams(view.unselectItemsAndRefresh);

  const rowActions = useMemo<IPageAction<PlatformTeam>[]>(() => {
    // TODO: Update based on RBAC information from Teams API
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const cannotDeleteTeam = (team: PlatformTeam) =>
      // eslint-disable-next-line no-constant-condition
      true ? '' : t(`The team cannot be deleted due to insufficient permissions.`);
    // TODO: Update based on RBAC information from Teams API
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const cannotEditTeam = (team: PlatformTeam) =>
      // eslint-disable-next-line no-constant-condition
      true ? '' : t(`The team cannot be edited due to insufficient permissions.`);

    return [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        // variant: ButtonVariant.primary,
        isPinned: true,
        icon: PencilAltIcon,
        label: t('Edit team'),
        isDisabled: (team: PlatformTeam) => cannotEditTeam(team),
        onClick: (team) => pageNavigate(PlatformRoute.EditTeam, { params: { id: team.id } }),
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Delete team'),
        isDisabled: (team: PlatformTeam) => cannotDeleteTeam(team),
        onClick: (team) => deleteTeams([team]),
        isDanger: true,
      },
    ];
  }, [deleteTeams, pageNavigate, t]);

  return rowActions;
}
