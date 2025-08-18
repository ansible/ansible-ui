import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  useGetPageUrl,
  usePageNavigate,
} from '@ansible/ansible-ui-framework';
import { useGetItem } from '@ansible/common-ui/crud/useGet';
import { ButtonVariant } from '@patternfly/react-core';
import { PencilAltIcon, PlusCircleIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { PlatformOrganization } from '../../../interfaces/PlatformOrganization';
import { PlatformTeam } from '../../../interfaces/PlatformTeam';
import { PlatformRoute } from '../../../main/PlatformRoutes';
import { gatewayAPI } from '../../../utils/gateway-api-utils';

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
        label: t('Assign organization roles'),
        onClick: () => {
          pageNavigate(PlatformRoute.OrganizationTeamsAddRoles, {
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
  const params = useParams<{ id: string }>();
  const { data: organization } = useGetItem<PlatformOrganization>(
    gatewayAPI`/organizations`,
    params.id
  );

  const getPageUrl = useGetPageUrl();

  const rowActions = useMemo<IPageAction<PlatformTeam>[]>(() => {
    return [
      {
        type: PageActionType.Link,
        selection: PageActionSelection.Single,
        variant: ButtonVariant.secondary,
        isPinned: true,
        icon: PencilAltIcon,
        label: t(`View and manage organization roles`),
        // isDisabled: // TODO
        href: (team: PlatformTeam) =>
          getPageUrl(PlatformRoute.OrganizationManageTeamRoles, {
            params: {
              id: organization?.id,
              teamId: team.id,
            },
          }),
      },
    ];
  }, [getPageUrl, organization?.id, t]);

  return rowActions;
}
