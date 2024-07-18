import { useTranslation } from 'react-i18next';
import { ButtonVariant } from '@patternfly/react-core';
import { PencilAltIcon, PlusCircleIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  PageTable,
  usePageNavigate,
} from '../../../../framework';
import { useOptions } from '../../../common/crud/useOptions';
import {
  cannotDeleteResource,
  cannotDeleteResources,
  cannotEditResource,
} from '../../../common/utils/RBAChelpers';
import { awxAPI } from '../../common/api/awx-utils';
import { useAwxView } from '../../common/useAwxView';
import { Application } from '../../interfaces/Application';
import { ActionsResponse, OptionsResponse } from '../../interfaces/OptionsResponse';
import { AwxRoute } from '../../main/AwxRoutes';
import { useApplicationsColumns } from './hooks/useApplicationsColumns';
import { useApplicationsFilters } from './hooks/useApplicationsFilters';
import { useDeleteApplications } from './hooks/useDeleteApplications';

export function ApplicationsTable() {
  const { t } = useTranslation();
  const toolbarFilters = useApplicationsFilters();
  const tableColumns = useApplicationsColumns();
  const view = useAwxView<Application>({
    url: awxAPI`/applications/`,
    toolbarFilters,
    tableColumns,
  });
  const deleteApplications = useDeleteApplications(view.unselectItemsAndRefresh);
  const pageNavigate = usePageNavigate();

  const { data } = useOptions<OptionsResponse<ActionsResponse>>(awxAPI`/applications/`);
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
        isDisabled: canCreateApplication
          ? undefined
          : t(
              'You do not have permission to create an application. Please contact your system administrator if there is an issue with your access.'
            ),
        onClick: () => pageNavigate(AwxRoute.CreateApplication),
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: TrashIcon,
        label: t('Delete OAuth applications'),
        isDisabled: (applications: Application[]) => cannotDeleteResources(applications, t),
        onClick: deleteApplications,
        isDanger: true,
      },
    ],
    [t, canCreateApplication, deleteApplications, pageNavigate]
  );

  const rowActions = useMemo<IPageAction<Application>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: PencilAltIcon,
        isPinned: true,
        label: t('Edit OAuth application'),
        isDisabled: (application) => cannotEditResource(application, t),
        onClick: (application) =>
          pageNavigate(AwxRoute.EditApplication, { params: { id: application.id } }),
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Delete OAuth application'),
        isDisabled: (application) => cannotDeleteResource(application, t),
        onClick: (application) => deleteApplications([application]),
        isDanger: true,
      },
    ],
    [t, pageNavigate, deleteApplications]
  );

  return (
    <PageTable<Application>
      id="awx-applications-table"
      toolbarFilters={toolbarFilters}
      toolbarActions={toolbarActions}
      tableColumns={tableColumns}
      rowActions={rowActions}
      errorStateTitle={t('Error loading applications')}
      emptyStateTitle={
        canCreateApplication
          ? t('There are currently no applications added')
          : t('You do not have permission to create an application.')
      }
      emptyStateDescription={
        canCreateApplication
          ? t('Please create an application by using the button below.')
          : t(
              'Please contact your organization administrator if there is an issue with your access.'
            )
      }
      emptyStateButtonIcon={<PlusCircleIcon />}
      emptyStateButtonText={canCreateApplication ? t('Create application') : undefined}
      emptyStateButtonClick={
        canCreateApplication ? () => pageNavigate(AwxRoute.CreateApplication) : undefined
      }
      {...view}
      defaultSubtitle={t('Application')}
    />
  );
}
