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
import { useParams } from 'react-router-dom';

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

export function useTeamRowActions(onTeamsDeleted: (teams: PlatformTeam[]) => void) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const deleteTeams = useDeleteTeams(onTeamsDeleted);

  const rowActions = useMemo<IPageAction<PlatformTeam>[]>(() => {
    return [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        isPinned: true,
        icon: PencilAltIcon,
        label: t('Edit team'),
        onClick: (team) => pageNavigate(PlatformRoute.EditTeam, { params: { id: team.id } }),
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Delete team'),
        onClick: (team) => deleteTeams([team]),
        isDanger: true,
      },
    ];
  }, [deleteTeams, pageNavigate, t]);

  return rowActions;
}

export function useTeamPageActions(onTeamsDeleted: (teams: PlatformTeam[]) => void) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const deleteTeams = useDeleteTeams(onTeamsDeleted);
  const params = useParams<{ id: string }>();
  const { data } = useOptions<OptionsResponse<ActionsResponse>>(
    gatewayV1API`/teams/${params.id ?? ''}/`
  );

  const canEditTeam = Boolean(
    data && data.actions && (data.actions['PUT'] || data.actions['PATCH'])
  );

  const pageActions = useMemo<IPageAction<PlatformTeam>[]>(() => {
    const cannotDeleteTeam = () =>
      canEditTeam ? '' : t(`The team cannot be deleted due to insufficient permissions.`);
    const cannotEditTeam = () =>
      canEditTeam ? '' : t(`The team cannot be edited due to insufficient permissions.`);

    return [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        isPinned: true,
        icon: PencilAltIcon,
        label: t('Edit team'),
        isDisabled: cannotEditTeam,
        onClick: (team) => pageNavigate(PlatformRoute.EditTeam, { params: { id: team.id } }),
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Delete team'),
        isDisabled: cannotDeleteTeam,
        onClick: (team) => deleteTeams([team]),
        isDanger: true,
      },
    ];
  }, [canEditTeam, deleteTeams, pageNavigate, t]);

  return pageActions;
}
