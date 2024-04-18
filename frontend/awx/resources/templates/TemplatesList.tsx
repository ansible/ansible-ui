import { ButtonVariant } from '@patternfly/react-core';
import { PlusCircleIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  PageTable,
  useGetPageUrl,
  usePageNavigate,
} from '../../../../framework';
import { usePersistentFilters } from '../../../common/PersistentFilters';
import { useAwxView } from '../../common/useAwxView';
import { JobTemplate } from '../../interfaces/JobTemplate';
import { WorkflowJobTemplate } from '../../interfaces/WorkflowJobTemplate';
import { AwxRoute } from '../../main/AwxRoutes';
import { useDeleteTemplates } from './hooks/useDeleteTemplates';
import { useTemplateActions } from './hooks/useTemplateActions';
import { useTemplateColumns } from './hooks/useTemplateColumns';
import { useTemplateFilters } from './hooks/useTemplateFilters';
import { useOptions } from '../../../common/crud/useOptions';
import { ActionsResponse, OptionsResponse } from '../../interfaces/OptionsResponse';
import { awxAPI } from '../../common/api/awx-utils';

export function TemplatesList(props: {
  url?: string;
  projectId?: string;
  inventoryId?: string;
  credentialsId?: string;
  executionEnvironmentId?: string;
}) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const getPageUrl = useGetPageUrl();
  const toolbarFilters = useTemplateFilters({
    url: props.url,
    projectId: props.projectId,
    inventoryId: props.inventoryId,
    credentialsId: props.credentialsId,
    executionEnvironmentId: props.executionEnvironmentId,
  });
  const tableColumns = useTemplateColumns();
  const getQueryParams = (
    projectId?: string,
    inventoryId?: string,
    credentialsId?: string,
    executionEnvironmentId?: string
  ) => {
    const templateQueryParams: { [key: string]: string } = {
      type: 'job_template,workflow_job_template',
      // order_by: '-last_job_run',
    };
    if (projectId) {
      templateQueryParams.project__id = projectId;
    }
    if (inventoryId) {
      templateQueryParams.inventory__id = inventoryId;
    }
    if (credentialsId) {
      templateQueryParams.credentials__id = credentialsId;
    }
    if (executionEnvironmentId) {
      templateQueryParams.execution_environment__id = executionEnvironmentId;
    }
    return templateQueryParams;
  };
  const view = useAwxView<JobTemplate | WorkflowJobTemplate>({
    url: props.url ? props.url : awxAPI`/unified_job_templates/`,
    queryParams: getQueryParams(
      props.projectId,
      props.inventoryId,
      props.credentialsId,
      props.executionEnvironmentId
    ),
    toolbarFilters,
    tableColumns,
  });

  const { data: jobTemplateActions } = useOptions<OptionsResponse<ActionsResponse>>(
    awxAPI`/job_templates/`
  );

  const { data: wfJobTemplateActions } = useOptions<OptionsResponse<ActionsResponse>>(
    awxAPI`/workflow_job_templates/`
  );

  const canCreateJobTemplate = Boolean(
    jobTemplateActions && jobTemplateActions.actions && jobTemplateActions.actions['POST']
  );

  const canCreateWFJobTemplate = Boolean(
    wfJobTemplateActions && wfJobTemplateActions.actions && wfJobTemplateActions.actions['POST']
  );

  usePersistentFilters('templatesList');
  const deleteTemplates = useDeleteTemplates(view.unselectItemsAndRefresh);

  const toolbarActions = useMemo<IPageAction<JobTemplate | WorkflowJobTemplate>[]>(
    () => [
      {
        type: PageActionType.Dropdown,
        variant: ButtonVariant.primary,
        isPinned: true,
        label: t('Create template'),
        isDisabled:
          canCreateJobTemplate || canCreateWFJobTemplate
            ? undefined
            : t(
                'You do not have permission to create a template. Please contact your organization administrator if there is an issue with your access.'
              ),
        selection: PageActionSelection.None,
        icon: PlusCircleIcon,
        actions: [
          {
            type: PageActionType.Link,
            selection: PageActionSelection.None,
            label: t('Create job template'),
            isDisabled: canCreateJobTemplate
              ? undefined
              : 'You do not have permission to create a job template. Please contact your organization administrator if there is an issue with your access.',
            href: getPageUrl(AwxRoute.CreateJobTemplate),
          },
          {
            type: PageActionType.Link,
            selection: PageActionSelection.None,
            label: t('Create workflow job template'),
            isDisabled: canCreateWFJobTemplate
              ? undefined
              : 'You do not have permission to create a workflow job template. Please contact your organization administrator if there is an issue with your access.',
            href: getPageUrl(AwxRoute.CreateWorkflowJobTemplate),
          },
        ],
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: TrashIcon,
        label: 'Delete selected templates',
        onClick: deleteTemplates,
        isDanger: true,
      },
    ],
    [canCreateJobTemplate, canCreateWFJobTemplate, deleteTemplates, getPageUrl, t]
  );

  const rowActions = useTemplateActions({
    onTemplatesDeleted: view.unselectItemsAndRefresh,
    onTemplateCopied: view.refresh,
  });

  return (
    <PageTable<JobTemplate | WorkflowJobTemplate>
      id="awx-job-templates-table"
      toolbarFilters={toolbarFilters}
      toolbarActions={toolbarActions}
      tableColumns={tableColumns}
      rowActions={rowActions}
      errorStateTitle={t('Error loading templates')}
      emptyStateTitle={
        canCreateJobTemplate || canCreateWFJobTemplate
          ? t('No templates yet')
          : t('You do not have permission to create a template')
      }
      emptyStateDescription={
        canCreateJobTemplate || canCreateWFJobTemplate
          ? t('Please create a template by using the button below.')
          : t(
              'Please contact your organization administrator if there is an issue with your access.'
            )
      }
      emptyStateButtonIcon={<PlusCircleIcon />}
      emptyStateButtonText={
        canCreateJobTemplate || canCreateWFJobTemplate ? t('Create template') : undefined
      }
      emptyStateButtonClick={
        canCreateJobTemplate ? () => pageNavigate(AwxRoute.CreateJobTemplate) : undefined
      }
      {...view}
      defaultSubtitle={t('Template')}
    />
  );
}
