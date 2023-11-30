import { ButtonVariant } from '@patternfly/react-core';
import { EditIcon, PlusIcon, TrashIcon } from '@patternfly/react-icons';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  IPageAction,
  ITableColumn,
  IToolbarFilter,
  PageActionSelection,
  PageActionType,
  PageHeader,
  PageLayout,
  PageTable,
  useGetPageUrl,
} from '../../../../framework';
import { RouteObj } from '../../../common/Routes';
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

export function Applications() {
  const { t } = useTranslation();
  // const navigate = useNavigate();
  const config = useAwxConfig();
  const toolbarFilters = useApplicationsFilters();
  const tableColumns = useApplicationsColumns();
  const view = useAwxView<Application>({
    url: awxAPI`/applications/`,
    toolbarFilters,
    tableColumns,
  });
  const deleteApplications = useDeleteApplications(view.unselectItemsAndRefresh);
  const history = useNavigate();
  const getPageUrl = useGetPageUrl();

  const toolbarActions = useMemo<IPageAction<Application>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.None,
        variant: ButtonVariant.primary,
        isPinned: true,
        icon: PlusIcon,
        label: t('Create application'),
        onClick: () => history(getPageUrl(AwxRoute.CreateApplication)),
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
    [t, deleteApplications, history, getPageUrl]
  );

  const rowActions = useMemo<IPageAction<Application>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: EditIcon,
        isPinned: true,
        label: t('Edit application'),
        onClick: (application) =>
          history(
            getPageUrl(AwxRoute.EditApplication, {
              params: { id: (application?.id ?? 0).toString() },
            })
          ),
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Delete application'),
        onClick: (application) => deleteApplications([application]),
        isDanger: true,
      },
    ],
    [t, history, getPageUrl, deleteApplications]
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
        emptyStateTitle={t('No applications yet')}
        emptyStateDescription={t('To get started, create an application.')}
        emptyStateButtonText={t('Create application')}
        emptyStateButtonClick={() => history(getPageUrl(AwxRoute.CreateApplication))}
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
  const navigate = useNavigate();
  const nameClick = useCallback(
    (application: Application) =>
      navigate(RouteObj.ApplicationDetails.replace(':id', application.id.toString())),
    [navigate]
  );
  const nameColumn = useNameColumn({
    ...options,
    onClick: nameClick,
  });
  const idColumn = useIdColumn<Application>();
  const descriptionColumn = useDescriptionColumn();
  const organizationColumn = useOrganizationNameColumn(AwxRoute.OrganizationDetails, options);
  const createdColumn = useCreatedColumn(options);
  const modifiedColumn = useModifiedColumn(options);
  const tableColumns = useMemo<ITableColumn<Application>[]>(
    () => [
      idColumn,
      nameColumn,
      descriptionColumn,
      organizationColumn,
      createdColumn,
      modifiedColumn,
    ],
    [idColumn, nameColumn, descriptionColumn, organizationColumn, createdColumn, modifiedColumn]
  );
  return tableColumns;
}
