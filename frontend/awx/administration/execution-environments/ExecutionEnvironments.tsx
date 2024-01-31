import { ButtonVariant } from '@patternfly/react-core';
import { PencilAltIcon, PlusIcon, TrashIcon } from '@patternfly/react-icons';
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
  useImageToolbarFilter,
  useNameToolbarFilter,
  useOrganizationToolbarFilter,
} from '../../common/awx-toolbar-filters';
import { useAwxView } from '../../common/useAwxView';
import { ExecutionEnvironment } from '../../interfaces/ExecutionEnvironment';

import { awxAPI } from '../../common/api/awx-utils';
import { useAwxConfig } from '../../common/useAwxConfig';
import { getDocsBaseUrl } from '../../common/util/getDocsBaseUrl';
import { AwxRoute } from '../../main/AwxRoutes';
import { useDeleteExecutionEnvironments } from './hooks/useDeleteExecutionEnvironments';
import {
  cannotDeleteResource,
  cannotDeleteResources,
  cannotEditResource,
} from '../../../common/utils/RBAChelpers';
import { useOptions } from '../../../common/crud/useOptions';
import { OptionsResponse, ActionsResponse } from '../../interfaces/OptionsResponse';

export function ExecutionEnvironments() {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const config = useAwxConfig();
  const toolbarFilters = useExecutionEnvironmentsFilters();
  const tableColumns = useExecutionEnvironmentsColumns();
  const view = useAwxView<ExecutionEnvironment>({
    url: awxAPI`/execution_environments/`,
    toolbarFilters,
    tableColumns,
  });
  const deleteExecutionEnvironments = useDeleteExecutionEnvironments(view.unselectItemsAndRefresh);

  const { data } = useOptions<OptionsResponse<ActionsResponse>>(awxAPI`/execution_environments/`);
  const canCreateExecutionEnvironment = Boolean(data && data.actions && data.actions['POST']);

  const toolbarActions = useMemo<IPageAction<ExecutionEnvironment>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.None,
        variant: ButtonVariant.primary,
        isPinned: true,
        icon: PlusIcon,
        label: t('Create execution environment'),
        isDisabled: canCreateExecutionEnvironment
          ? undefined
          : t(
              'You do not have permission to create an execution environment. Please contact your organization administrator if there is an issue with your access.'
            ),
        onClick: () => pageNavigate(AwxRoute.CreateExecutionEnvironment),
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: TrashIcon,
        label: t('Delete selected execution environments'),
        isDisabled: (executionEnvironments) => cannotDeleteResources(executionEnvironments, t),
        onClick: deleteExecutionEnvironments,
        isDanger: true,
      },
    ],
    [t, canCreateExecutionEnvironment, deleteExecutionEnvironments, pageNavigate]
  );

  const rowActions = useMemo<IPageAction<ExecutionEnvironment>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: PencilAltIcon,
        isPinned: true,
        label: t('Edit execution environment'),
        isDisabled: (executionEnvironment) => cannotEditResource(executionEnvironment, t),
        onClick: (executionEnvironment) =>
          pageNavigate(AwxRoute.EditExecutionEnvironment, {
            params: { id: executionEnvironment.id },
          }),
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Delete execution environment'),
        isDisabled: (executionEnvironment) => cannotDeleteResource(executionEnvironment, t),
        onClick: (executionEnvironment) => deleteExecutionEnvironments([executionEnvironment]),
        isDanger: true,
      },
    ],
    [pageNavigate, deleteExecutionEnvironments, t]
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
        emptyStateButtonClick={() => pageNavigate(AwxRoute.CreateExecutionEnvironment)}
        {...view}
        defaultSubtitle={t('Execution environment')}
      />
    </PageLayout>
  );
}

export function useExecutionEnvironmentsFilters() {
  const nameToolbarFilter = useNameToolbarFilter();
  const organizationToolbarFilter = useOrganizationToolbarFilter();
  const imageToolbarFilter = useImageToolbarFilter();
  const toolbarFilters = useMemo<IToolbarFilter[]>(
    () => [nameToolbarFilter, organizationToolbarFilter, imageToolbarFilter],
    [nameToolbarFilter, organizationToolbarFilter, imageToolbarFilter]
  );
  return toolbarFilters;
}

export function useExecutionEnvironmentsColumns(options?: {
  disableSort?: boolean;
  disableLinks?: boolean;
}) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const nameClick = useCallback(
    (executionEnvironment: ExecutionEnvironment) =>
      pageNavigate(AwxRoute.ExecutionEnvironmentDetails, {
        params: { id: executionEnvironment.id },
      }),
    [pageNavigate]
  );
  const nameColumn = useNameColumn({
    ...options,
    onClick: nameClick,
  });
  const idColumn = useIdColumn<ExecutionEnvironment>();
  const descriptionColumn = useDescriptionColumn();
  const organizationColumn = useOrganizationNameColumn(
    AwxRoute.OrganizationDetails,
    options,
    'Globally available'
  );
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
        sort: 'image',
      },
      organizationColumn,
      createdColumn,
      modifiedColumn,
    ],
    [idColumn, nameColumn, descriptionColumn, t, organizationColumn, createdColumn, modifiedColumn]
  );
  return tableColumns;
}
