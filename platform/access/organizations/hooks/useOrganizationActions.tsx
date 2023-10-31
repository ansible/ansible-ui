import { useMemo } from 'react';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  useGetPageUrl,
  usePageNavigate,
} from '../../../../framework';
import { Organization } from '../../../interfaces/Organization';
import { ButtonVariant } from '@patternfly/react-core';
import { PencilAltIcon, PlusCircleIcon, TrashIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { PlatformRoute } from '../../../PlatformRoutes';
import { useDeleteOrganizations } from './useDeleteOrganizations';
import { IPlatformView } from '../../../hooks/usePlatformView';
import { useOptions } from '../../../../frontend/common/crud/useOptions';
import {
  ActionsResponse,
  OptionsResponse,
} from '../../../../frontend/awx/interfaces/OptionsResponse';

export function useOrganizationToolbarActions(view: IPlatformView<Organization>) {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();

  const { data } = useOptions<OptionsResponse<ActionsResponse>>('/api/gateway/v1/organizations');
  const canCreateOrganization = Boolean(data && data.actions && data.actions['POST']);
  const deleteOrganizations = useDeleteOrganizations(view.unselectItemsAndRefresh);

  const toolbarActions = useMemo<IPageAction<Organization>[]>(
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

export function useOrganizationRowActions(view: IPlatformView<Organization>) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const deleteOrganizations = useDeleteOrganizations(view.unselectItemsAndRefresh);

  const rowActions = useMemo<IPageAction<Organization>[]>(() => {
    // TODO: Update based on RBAC information from Organizations API
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const cannotDeleteOrganization = (organization: Organization) =>
      // eslint-disable-next-line no-constant-condition
      true ? '' : t(`The organization cannot be deleted due to insufficient permissions.`);
    // TODO: Update based on RBAC information from Organizations API
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const cannotEditOrganization = (organization: Organization) =>
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
        isDisabled: (organization: Organization) => cannotEditOrganization(organization),
        onClick: (organization) =>
          pageNavigate(PlatformRoute.EditOrganization, { params: { id: organization.id } }),
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Delete organization'),
        isDisabled: (organization: Organization) => cannotDeleteOrganization(organization),
        onClick: (organization) => deleteOrganizations([organization]),
        isDanger: true,
      },
    ];
  }, [deleteOrganizations, pageNavigate, t]);

  return rowActions;
}
