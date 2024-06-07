import { useTranslation } from 'react-i18next';
import { PlatformTeam } from '../../../interfaces/PlatformTeam';
import { useCallback, useMemo } from 'react';
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
import { useGatewayService } from '../../../main/GatewayServices';
import { useGetItem } from '../../../../frontend/common/crud/useGet';
import { PlatformOrganization } from '../../../interfaces/PlatformOrganization';
import { gatewayV1API } from '../../../api/gateway-api-utils';
import { getAwxResource, useAwxResource } from '../../../hooks/useAwxResource';
import { Organization } from '../../../../frontend/awx/interfaces/Organization';
import { getEdaResource, useEdaResource } from '../../../hooks/useEdaResource';
import { EdaOrganization } from '../../../../frontend/eda/interfaces/EdaOrganization';
import { useManageOrgRoles } from '../../../../frontend/common/access/hooks/useManageOrgRolesDialog';
import { Team } from '../../../../frontend/awx/interfaces/Team';
import { EdaTeam } from '../../../../frontend/eda/interfaces/EdaTeam';
import { awxAPI } from '../../../../frontend/awx/common/api/awx-utils';
import { edaAPI } from '../../../../frontend/eda/common/eda-utils';

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
  const pageNavigate = usePageNavigate();
  const { data: organization } = useGetItem<PlatformOrganization>(
    gatewayV1API`/organizations`,
    params.id
  );
  const { resource: awxOrganization, error: errorRetrievingAwxOrg } = useAwxResource<Organization>(
    '/organizations/',
    organization
  );
  const { resource: edaOrganization, error: errorRetrievingEdaOrg } =
    useEdaResource<EdaOrganization>('organizations/', organization);
  const manageOrgRoles = useManageOrgRoles();
  const awxService = useGatewayService('controller');
  const edaService = useGatewayService('eda');
  const manageRolesHandleClick = useCallback(
    async (team: PlatformTeam) => {
      const awxTeam = await getAwxResource<Team>('/teams/', team);
      const edaTeam = await getEdaResource<EdaTeam>('teams/', team);
      const orgListOptions = [
        ...(awxService && !errorRetrievingAwxOrg && awxOrganization?.id && (awxTeam as Team)?.id
          ? [
              {
                title: t('Automation Execution roles'),
                isExpandable: true,
                apiPrefixFunction: awxAPI,
                orgId: awxOrganization?.id?.toString() ?? '',
                teamId: (awxTeam as Team)?.id?.toString(),
              },
            ]
          : []),
        ...(edaService && !errorRetrievingEdaOrg && edaOrganization?.id && (edaTeam as EdaTeam)?.id
          ? [
              {
                title: t('Automation Decisions roles'),
                isExpandable: true,
                apiPrefixFunction: edaAPI,
                orgId: edaOrganization?.id?.toString() ?? '',
                teamId: (edaTeam as EdaTeam)?.id?.toString() ?? '',
              },
            ]
          : []),
      ];
      manageOrgRoles({
        orgListsOptions: orgListOptions,
        onManageRolesClick: () =>
          pageNavigate(PlatformRoute.OrganizationManageTeamRoles, {
            params: { id: params.id, teamId: team.id },
          }),
        userOrTeamName: team.name,
      });
    },
    [
      awxOrganization?.id,
      awxService,
      edaOrganization?.id,
      edaService,
      errorRetrievingAwxOrg,
      errorRetrievingEdaOrg,
      manageOrgRoles,
      pageNavigate,
      params.id,
      t,
    ]
  );

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
        onClick: manageRolesHandleClick,
      },
    ];
  }, [manageRolesHandleClick, t]);

  return rowActions;
}
