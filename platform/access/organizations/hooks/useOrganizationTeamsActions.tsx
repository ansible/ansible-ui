import { useTranslation } from 'react-i18next';
import { PlatformTeam } from '../../../interfaces/PlatformTeam';
import { useMemo } from 'react';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  usePageNavigate,
} from '../../../../framework';
import { ButtonVariant } from '@patternfly/react-core';
import { CogIcon, PlusCircleIcon } from '@patternfly/react-icons';
import { useParams } from 'react-router-dom';
import { PlatformRoute } from '../../../main/PlatformRoutes';

export function useOrganizationTeamsToolbarActions() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const pageNavigate = usePageNavigate();

  const toolbarActions = useMemo<IPageAction<PlatformTeam>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.None,
        variant: ButtonVariant.primary,
        isPinned: true,
        icon: PlusCircleIcon,
        label: t('Add roles'),
        // isDisabled: TODO RBAC
        onClick: () => {
          pageNavigate(PlatformRoute.OrganizationAddTeams, {
            params: { id: params.id },
          });
        },
      },
    ],
    [t, pageNavigate, params.id]
  );

  return toolbarActions;
}

export function useOrganizationTeamsRowActions() {
  const { t } = useTranslation();

  const rowActions = useMemo<IPageAction<PlatformTeam>[]>(() => {
    return [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        variant: ButtonVariant.secondary,
        isPinned: true,
        icon: CogIcon,
        label: t(`Manage roles`),
        // isDisabled: // TODO
        onClick: () =>
          alert(
            'TODO: Modal to view role assignments for the team and optionally trigger navigation to the Manage Roles wizard'
          ), // Modal to view roles and optionally navigate to PlatformRoute.OrganizationManageTeamRoles to edit roles
      },
    ];
  }, [t]);

  return rowActions;
}
