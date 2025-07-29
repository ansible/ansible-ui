import {
  IPageAction,
  IToolbarFilter,
  PageActionSelection,
  PageActionType,
  PageTable,
  useGetPageUrl,
  usePageNavigate,
} from '@ansible/ansible-ui-framework';
import { ButtonLink } from '@ansible/ansible-ui-framework/components/ButtonLink';
import { PageTableEmptyState } from '@ansible/ansible-ui-framework/PageTable/PageTableEmptyState';
import { PageLoadingTable } from '@ansible/ansible-ui-framework/PageTable/PageLoadingTable';
import {
  useNameToolbarFilter,
  useOrganizationToolbarFilter,
} from '@ansible/awx-ui/common/awx-toolbar-filters';
import { Application } from '@ansible/awx-ui/interfaces/Application';
import { ActionsResponse, OptionsResponse } from '@ansible/awx-ui/interfaces/OptionsResponse';
import { useOptions } from '@ansible/common-ui/crud/useOptions';
import { usePersistentFilters } from '@ansible/common-ui/PersistentFilters';
import { ButtonVariant } from '@patternfly/react-core';
import { CubesIcon, PencilAltIcon, PlusCircleIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { usePlatformView } from '../../hooks/usePlatformView';
import { usePlatformActiveUser } from '../../main/PlatformActiveUserProvider';
import { PlatformRoute } from '../../main/PlatformRoutes';
import { gatewayAPI } from '../../utils/gateway-api-utils';
import { useApplicationsColumns } from './hooks/useApplicationsColumns';
import { useDeleteApplications } from './hooks/useDeleteApplications';

export function PlatformApplicationsTable() {
  const { t } = useTranslation();
  const { activePlatformUser } = usePlatformActiveUser();
  const getPageUrl = useGetPageUrl();
  const nameFilter = useNameToolbarFilter();
  const orgFilter = useOrganizationToolbarFilter();
  const toolbarFilters: IToolbarFilter[] = [nameFilter, orgFilter];
  const tableColumns = useApplicationsColumns();
  usePersistentFilters('applications');

  const view = usePlatformView<Application>({
    url: gatewayAPI`/applications/`,
    toolbarFilters,
    tableColumns,
  });
  const deleteApplications = useDeleteApplications(view.unselectItemsAndRefresh);
  const pageNavigate = usePageNavigate();

  const { data, isLoading: isLoadingOptions } = useOptions<OptionsResponse<ActionsResponse>>(
    gatewayAPI`/applications/`
  );
  const canCreateApplication = Boolean(data && data.actions && data.actions['POST']);

  const toolbarActions = useMemo<IPageAction<Application>[]>(
    () => [
      {
        type: PageActionType.Link,
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
        href: getPageUrl(PlatformRoute.CreateApplication),
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
    [t, activePlatformUser?.is_superuser, canCreateApplication, deleteApplications, getPageUrl]
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

  const canCreateApplicationAndIsSuperUser =
    canCreateApplication && activePlatformUser?.is_superuser;

  if (isLoadingOptions) return <PageLoadingTable />;

  return (
    <PageTable<Application>
      id="platform-applications-table"
      toolbarFilters={toolbarFilters}
      toolbarActions={toolbarActions}
      tableColumns={tableColumns}
      rowActions={rowActions}
      errorStateTitle={t('Error loading OAuth applications')}
      emptyState={
        canCreateApplicationAndIsSuperUser ? (
          <PageTableEmptyState
            title={t('No OAuth applications found')}
            description={t('No OAuth applications match the filter criteria')}
          >
            <ButtonLink
              icon={<PlusCircleIcon />}
              variant={ButtonVariant.primary}
              href={getPageUrl(PlatformRoute.CreateApplication)}
            >
              {t('Create OAuth application')}
            </ButtonLink>
          </PageTableEmptyState>
        ) : (
          <PageTableEmptyState
            icon={CubesIcon}
            title={t('No OAuth applications found')}
            description={t(
              'Please contact your organization administrator if there is an issue with your access.'
            )}
          />
        )
      }
      defaultSubtitle={t('Application')}
      {...view}
    />
  );
}
