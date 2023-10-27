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
import { ExecutionEnvironment } from '../../interfaces/ExecutionEnvironment';
import { useAwxView } from '../../useAwxView';

import { useAwxConfig } from '../../common/useAwxConfig';
import getDocsBaseUrl from '../../common/util/getDocsBaseUrl';
import { useDeleteExecutionEnvironments } from './hooks/useDeleteExecutionEnvironments';
import { AwxRoute } from '../../AwxRoutes';

export function ExecutionEnvironments() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const config = useAwxConfig();
  const toolbarFilters = useExecutionEnvironmentsFilters();
  const tableColumns = useExecutionEnvironmentsColumns();
  const view = useAwxView<ExecutionEnvironment>({
    url: '/api/v2/execution_environments/',
    toolbarFilters,
    tableColumns,
  });
  const deleteExecutionEnvironments = useDeleteExecutionEnvironments(view.unselectItemsAndRefresh);

  const toolbarActions = useMemo<IPageAction<ExecutionEnvironment>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.None,
        variant: ButtonVariant.primary,
        isPinned: true,
        icon: PlusIcon,
        label: t('Create execution environment'),
        onClick: () => navigate(RouteObj.CreateExecutionEnvironment),
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: TrashIcon,
        label: t('Delete selected execution environments'),
        onClick: deleteExecutionEnvironments,
        isDanger: true,
      },
    ],
    [navigate, deleteExecutionEnvironments, t]
  );

  const rowActions = useMemo<IPageAction<ExecutionEnvironment>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: EditIcon,
        isPinned: true,
        label: t('Edit execution environment'),
        onClick: (executionEnvironment) =>
          navigate(
            RouteObj.EditExecutionEnvironment.replace(':id', executionEnvironment.id.toString())
          ),
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Delete execution environment'),
        onClick: (executionEnvironment) => deleteExecutionEnvironments([executionEnvironment]),
        isDanger: true,
      },
    ],
    [navigate, deleteExecutionEnvironments, t]
  );

  return (
    <PageLayout>
      <PageHeader
        title={t('Execution Environments')}
        description={t(
          'An execution environment allows you to have a customized image to run jobs.'
        )}
        titleHelpTitle={t('Execution Environments')}
        titleHelp={t(
          'Execution environments are container images that make it possible to incorporate system-level dependencies and collection-based content. Each execution environment allows you to have a customized image to run jobs, and each of them contain only what you need when running the job, nothing more.'
        )}
        titleDocLink={`${getDocsBaseUrl(config)}/html/userguide/execution_environments.html`}
      />
      <PageTable<ExecutionEnvironment>
        id="awx-execution-environments-table"
        toolbarFilters={toolbarFilters}
        toolbarActions={toolbarActions}
        tableColumns={tableColumns}
        rowActions={rowActions}
        errorStateTitle={t('Error loading execution environments')}
        emptyStateTitle={t('No execution environments yet')}
        emptyStateDescription={t('To get started, create an execution environment.')}
        emptyStateButtonText={t('Create execution environment')}
        emptyStateButtonClick={() => navigate(RouteObj.CreateExecutionEnvironment)}
        {...view}
        defaultSubtitle={t('Execution environment')}
      />
    </PageLayout>
  );
}

export function useExecutionEnvironmentsFilters() {
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

export function useExecutionEnvironmentsColumns(options?: {
  disableSort?: boolean;
  disableLinks?: boolean;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const nameClick = useCallback(
    (executionEnvironment: ExecutionEnvironment) =>
      navigate(
        RouteObj.ExecutionEnvironmentDetails.replace(':id', executionEnvironment.id.toString())
      ),
    [navigate]
  );
  const nameColumn = useNameColumn({
    ...options,
    onClick: nameClick,
  });
  const idColumn = useIdColumn<ExecutionEnvironment>();
  const descriptionColumn = useDescriptionColumn();
  const organizationColumn = useOrganizationNameColumn(AwxRoute.OrganizationDetails, options);
  const createdColumn = useCreatedColumn(options);
  const modifiedColumn = useModifiedColumn(options);
  const tableColumns = useMemo<ITableColumn<ExecutionEnvironment>[]>(
    () => [
      idColumn,
      nameColumn,
      descriptionColumn,
      {
        header: t('Image'),
        cell: (executionEnvironment) => executionEnvironment.image,
      },
      organizationColumn,
      createdColumn,
      modifiedColumn,
    ],
    [idColumn, nameColumn, descriptionColumn, t, organizationColumn, createdColumn, modifiedColumn]
  );
  return tableColumns;
}
