import { ButtonVariant } from '@patternfly/react-core';
import { EditIcon, PlusCircleIcon, TrashIcon } from '@patternfly/react-icons';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IPageAction,
  ITableColumn,
  IToolbarFilter,
  PageActionSelection,
  PageActionType,
  PageHeader,
  PageLayout,
  PageTable,
  usePageNavigate,
} from '../../../../framework';
import {
  useCreatedColumn,
  useDescriptionColumn,
  useIdColumn,
  useModifiedColumn,
  useNameColumn,
  useOrganizationNameColumn,
} from '../../../common/columns';
import {
  useCreatedByToolbarFilter,
  useDescriptionToolbarFilter,
  useModifiedByToolbarFilter,
  useNameToolbarFilter,
  useOrganizationToolbarFilter,
} from '../../common/awx-toolbar-filters';
import { useAwxView } from '../../useAwxView';

import { useAwxConfig } from '../../common/useAwxConfig';
import getDocsBaseUrl from '../../common/util/getDocsBaseUrl';
import { useDeleteApplications } from './hooks/useDeleteApplications';
import { AwxRoute } from '../../AwxRoutes';
import { awxAPI } from '../../api/awx-utils';
import { Application } from '../../interfaces/Application';
import { cannotDeleteResource, cannotEditResource } from '../../../common/utils/RBAChelpers';
import { useOptions } from '../../../common/crud/useOptions';
import { OptionsResponse, ActionsResponse } from '../../interfaces/OptionsResponse';

export function Applications() {
  const { t } = useTranslation();
  const config = useAwxConfig();
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
        label: t('Create application'),
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
        label: t('Delete selected applications'),
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
        icon: EditIcon,
        isPinned: true,
        label: t('Edit application'),
        isDisabled: (application) => cannotEditResource(application, t),
        onClick: (application) =>
          pageNavigate(AwxRoute.EditApplication, { params: { id: application.id } }),
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Delete application'),
        isDisabled: (application) => cannotDeleteResource(application, t),
        onClick: (application) => deleteApplications([application]),
        isDanger: true,
      },
    ],
    [t, pageNavigate, deleteApplications]
  );

  return (
    <PageLayout>
      <PageHeader
        title={t('OAuth Applications')}
        description={t(
          'Create and configure token-based authentication for external applications.'
        )}
        titleHelpTitle={t('Applications')}
        titleHelp={t('Create and configure token-based authentication for external applications.')}
        titleDocLink={`${getDocsBaseUrl(config)}/html/userguide/applications_auth.html`}
      />
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
        emptyStateButtonText={canCreateApplication ? t('Create application') : undefined}
        emptyStateButtonClick={
          canCreateApplication ? () => pageNavigate(AwxRoute.CreateApplication) : undefined
        }
        {...view}
        defaultSubtitle={t('Application')}
      />
    </PageLayout>
  );
}

export function useApplicationsFilters() {
  const nameToolbarFilter = useNameToolbarFilter();
  const descriptionToolbarFilter = useDescriptionToolbarFilter();
  const organizationToolbarFilter = useOrganizationToolbarFilter();
  const createdByToolbarFilter = useCreatedByToolbarFilter();
  const modifiedByToolbarFilter = useModifiedByToolbarFilter();
  const toolbarFilters = useMemo<IToolbarFilter[]>(
    () => [
      nameToolbarFilter,
      descriptionToolbarFilter,
      organizationToolbarFilter,
      createdByToolbarFilter,
      modifiedByToolbarFilter,
    ],
    [
      nameToolbarFilter,
      descriptionToolbarFilter,
      organizationToolbarFilter,
      createdByToolbarFilter,
      modifiedByToolbarFilter,
    ]
  );
  return toolbarFilters;
}

export function useApplicationsColumns(options?: {
  disableSort?: boolean;
  disableLinks?: boolean;
}) {
  const pageNavigate = usePageNavigate();

  const nameClick = useCallback(
    (application: Application) =>
      pageNavigate(AwxRoute.ApplicationDetails, { params: { id: application.id } }),
    [pageNavigate]
  );
  const nameColumn = useNameColumn({
    ...options,
    onClick: nameClick,
  });
  const descriptionColumn = useDescriptionColumn();
  const organizationColumn = useOrganizationNameColumn(AwxRoute.OrganizationDetails, options);
  const createdColumn = useCreatedColumn(options);
  const modifiedColumn = useModifiedColumn(options);
  const tableColumns = useMemo<ITableColumn<Application>[]>(
    () => [nameColumn, descriptionColumn, organizationColumn, createdColumn, modifiedColumn],
    [nameColumn, descriptionColumn, organizationColumn, createdColumn, modifiedColumn]
  );
  return tableColumns;
}
