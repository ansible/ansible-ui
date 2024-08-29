import { ButtonVariant } from '@patternfly/react-core';
import { PencilAltIcon, PlusCircleIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IPageAction,
  IToolbarFilter,
  PageActionSelection,
  PageActionType,
  PageTable,
  usePageNavigate,
} from '../../../framework';
import { useApplicationsColumns } from './hooks/useApplicationsColumns';
import { Application } from '../../../frontend/awx/interfaces/Application';
import { OptionsResponse, ActionsResponse } from '../../../frontend/awx/interfaces/OptionsResponse';
import { useOptions } from '../../../frontend/common/crud/useOptions';
import { gatewayV1API } from '../../api/gateway-api-utils';
import { PlatformRoute } from '../../main/PlatformRoutes';
import { useDeleteApplications } from './hooks/useDeleteApplications';
import { usePlatformActiveUser } from '../../main/PlatformActiveUserProvider';
import { usePlatformView } from '../../hooks/usePlatformView';
import { usePersistentFilters } from '../../../frontend/common/PersistentFilters';
import {
  useNameToolbarFilter,
  useOrganizationToolbarFilter,
} from '../../../frontend/awx/common/awx-toolbar-filters';

export function PlatformApplicationsTable() {
  const { t } = useTranslation();
  const { activePlatformUser } = usePlatformActiveUser();
  const nameFilter = useNameToolbarFilter();
  const orgFilter = useOrganizationToolbarFilter();
  const toolbarFilters: IToolbarFilter[] = [nameFilter, orgFilter];
  const tableColumns = useApplicationsColumns();
  usePersistentFilters('applications');

  const view = usePlatformView<Application>({
    url: gatewayV1API`/applications/`,
    toolbarFilters,
    tableColumns,
  });
  const deleteApplications = useDeleteApplications(view.unselectItemsAndRefresh);
  const pageNavigate = usePageNavigate();

  const { data } = useOptions<OptionsResponse<ActionsResponse>>(gatewayV1API`/applications/`);
  const canCreateApplication = Boolean(data && data.actions && data.actions['POST']);

  const toolbarActions = useMemo<IPageAction<Application>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.None,
        variant: ButtonVariant.primary,
        isPinned: true,
        icon: PlusCircleIcon,
        label: t('Create OAuth application'),
        isDisabled:
          activePlatformUser?.is_superuser && canCreateApplication
            ? undefined
            : t(
                'You do not have permission to create an OAuth application. Please contact your system administrator if there is an issue with your access.'
              ),
        onClick: () => pageNavigate(PlatformRoute.CreateApplication),
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: TrashIcon,
        label: t('Delete OAuth applications'),
        isDisabled: activePlatformUser?.is_superuser
          ? undefined
          : t(
              'You do not have permission to delete an OAuth application. Please contact your system administrator if there is an issue with your access.'
            ),
        onClick: deleteApplications,
        isDanger: true,
      },
    ],
    [t, activePlatformUser?.is_superuser, canCreateApplication, deleteApplications, pageNavigate]
  );

  const rowActions = useMemo<IPageAction<Application>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: PencilAltIcon,
        isPinned: true,
        label: t('Edit OAuth application'),
        isDisabled: activePlatformUser?.is_superuser
          ? undefined
          : t(
              'You do not have permission to edit an OAuth application. Please contact your system administrator if there is an issue with your access.'
            ),
        onClick: (application) =>
          pageNavigate(PlatformRoute.EditApplication, { params: { id: application.id } }),
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Delete OAuth application'),
        isDisabled: activePlatformUser?.is_superuser
          ? undefined
          : t(
              'You do not have permission to delete an OAuth application. Please contact your system administrator if there is an issue with your access.'
            ),
        onClick: (application) => deleteApplications([application]),
        isDanger: true,
      },
    ],
    [t, activePlatformUser, pageNavigate, deleteApplications]
  );

  return (
    <PageTable<Application>
      id="platform-applications-table"
      toolbarFilters={toolbarFilters}
      toolbarActions={toolbarActions}
      tableColumns={tableColumns}
      rowActions={rowActions}
      errorStateTitle={t('Error loading OAuth applications')}
      emptyStateTitle={
        canCreateApplication && activePlatformUser?.is_superuser
          ? t('There are currently no OAuth applications added')
          : t('You do not have permission to create an OAuth application.')
      }
      emptyStateDescription={
        canCreateApplication && activePlatformUser?.is_superuser
          ? t('Please create an OAuth application by using the button below.')
          : t(
              'Please contact your organization administrator if there is an issue with your access.'
            )
      }
      emptyStateButtonIcon={<PlusCircleIcon />}
      emptyStateButtonText={
        canCreateApplication && activePlatformUser?.is_superuser
          ? t('Create OAuth application')
          : undefined
      }
      emptyStateButtonClick={
        canCreateApplication && activePlatformUser?.is_superuser
          ? () => pageNavigate(PlatformRoute.CreateApplication)
          : undefined
      }
      {...view}
      defaultSubtitle={t('Application')}
    />
  );
}
