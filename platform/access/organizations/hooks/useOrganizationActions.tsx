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
import { PlatformOrganization } from '../../../interfaces/PlatformOrganization';
import { PlatformRoute } from '../../../main/PlatformRoutes';
import { useDeleteOrganizations } from './useDeleteOrganizations';

export function useOrganizationToolbarActions(view: IPlatformView<PlatformOrganization>) {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();

  const { data } = useOptions<OptionsResponse<ActionsResponse>>(gatewayV1API`/organizations/`);
  const canCreateOrganization = Boolean(data && data.actions && data.actions['POST']);
  const deleteOrganizations = useDeleteOrganizations(view.unselectItemsAndRefresh);

  const toolbarActions = useMemo<IPageAction<PlatformOrganization>[]>(
    () => [
      {
        type: PageActionType.Link,
        selection: PageActionSelection.None,
        variant: ButtonVariant.primary,
        isPinned: true,
        icon: PlusCircleIcon,
        label: t('Create organization'),
        isDisabled: canCreateOrganization
          ? undefined
          : t(
              'You do not have permission to create a organization. Please contact your system administrator if there is an issue with your access.'
            ),
        href: getPageUrl(PlatformRoute.CreateOrganization),
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: TrashIcon,
        label: t('Delete selected organizations'),
        onClick: deleteOrganizations,
        isDanger: true,
      },
    ],
    [t, canCreateOrganization, getPageUrl, deleteOrganizations]
  );

  return toolbarActions;
}

export function useOrganizationRowActions(
  onOrganizationsDeleted: (organizations: PlatformOrganization[]) => void
) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const deleteOrganizations = useDeleteOrganizations(onOrganizationsDeleted);

  const rowActions = useMemo<IPageAction<PlatformOrganization>[]>(() => {
    // TODO: Update based on RBAC information from Organizations API
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const cannotDeleteOrganization = (organization: PlatformOrganization) =>
      // eslint-disable-next-line no-constant-condition
      true ? '' : t(`The organization cannot be deleted due to insufficient permissions.`);
    // TODO: Update based on RBAC information from Organizations API
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const cannotEditOrganization = (organization: PlatformOrganization) =>
      // eslint-disable-next-line no-constant-condition
      true ? '' : t(`The organization cannot be edited due to insufficient permissions.`);

    return [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        // variant: ButtonVariant.primary,
        isPinned: true,
        icon: PencilAltIcon,
        label: t('Edit organization'),
        isDisabled: (organization: PlatformOrganization) => cannotEditOrganization(organization),
        onClick: (organization) =>
          pageNavigate(PlatformRoute.EditOrganization, { params: { id: organization.id } }),
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Delete organization'),
        isDisabled: (organization: PlatformOrganization) => cannotDeleteOrganization(organization),
        onClick: (organization) => deleteOrganizations([organization]),
        isDanger: true,
      },
    ];
  }, [deleteOrganizations, pageNavigate, t]);

  return rowActions;
}
