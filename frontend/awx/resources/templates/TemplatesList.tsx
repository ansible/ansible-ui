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
} from '../../../../framework';
import { PageActionsPinned } from '../../../../framework/PageActions/PageActionsPinned';
import { PageLoadingTable } from '../../../../framework/PageTable/PageLoadingTable';
import { PageTableEmptyState } from '../../../../framework/PageTable/PageTableEmptyState';
import { useOptions } from '../../../common/crud/useOptions';
import { usePersistentFilters } from '../../../common/PersistentFilters';
import { awxAPI } from '../../common/api/awx-utils';
import { useDomainsStore } from '../../common/domains/useDomains';
import { useAwxView } from '../../common/useAwxView';
import { JobTemplate } from '../../interfaces/JobTemplate';
import { ActionsResponse, OptionsResponse } from '../../interfaces/OptionsResponse';
import { WorkflowJobTemplate } from '../../interfaces/WorkflowJobTemplate';
import { AwxRoute } from '../../main/AwxRoutes';
import { useDeleteTemplates } from './hooks/useDeleteTemplates';
import { useTemplateActions } from './hooks/useTemplateActions';
import { useTemplateColumns } from './hooks/useTemplateColumns';
import { useTemplateFilters } from './hooks/useTemplateFilters';

export type TemplatesListProps = {
  url?: string;
  projectId?: string;
  inventoryId?: string;
  credentialsId?: string;
  executionEnvironmentId?: string;
};

export function TemplatesList(props: Readonly<TemplatesListProps>) {
  const { t } = useTranslation();
  const activeDomains = useDomainsStore((state) => state.activeDomains);
  const focusLabels = activeDomains.map((fa) => fa.labels.map((l) => l.name)).flat();
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
    queryParams: {
      ...getQueryParams(
        props.projectId,
        props.inventoryId,
        props.credentialsId,
        props.executionEnvironmentId
      ),
      or__labels__name: focusLabels,
    },

    toolbarFilters,
    tableColumns,
  });

  const { data: jobTemplateActions, isLoading: isLoadingJobTemplateActions } = useOptions<
    OptionsResponse<ActionsResponse>
  >(awxAPI`/job_templates/`);

  const { data: wfJobTemplateActions, isLoading: isLoadingWfJobTemplateActions } = useOptions<
    OptionsResponse<ActionsResponse>
  >(awxAPI`/workflow_job_templates/`);

  const canCreateJobTemplate = Boolean(jobTemplateActions?.actions?.['POST']);

  const canCreateWFJobTemplate = Boolean(wfJobTemplateActions?.actions?.['POST']);

  const isLoadingPermissions = isLoadingJobTemplateActions || isLoadingWfJobTemplateActions;

  usePersistentFilters('templates');
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
                'Job template creation requires project access. You are not currently assigned to any projects. Additionally, you do not have permissions to create a workflow job template. Please contact your organization administrator if there is an issue with your access.'
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
              : 'Job template creation requires project access. You are not currently assigned to any projects.',
            href: (() => {
              if (props.projectId) {
                return getPageUrl(AwxRoute.CreateJobTemplate, {
                  query: { project_id: props.projectId },
                });
              }
              if (props.inventoryId) {
                return getPageUrl(AwxRoute.CreateJobTemplate, {
                  query: { inventory_id: props.inventoryId },
                });
              }
              return getPageUrl(AwxRoute.CreateJobTemplate);
            })(),
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
        label: t('Delete templates'),
        onClick: deleteTemplates,
        isDanger: true,
      },
    ],
    [
      canCreateJobTemplate,
      canCreateWFJobTemplate,
      deleteTemplates,
      getPageUrl,
      props.inventoryId,
      props.projectId,
      t,
    ]
  );

  const rowActions = useTemplateActions({
    onTemplatesDeleted: view.unselectItemsAndRefresh,
    onTemplateCopied: view.refresh,
  });

  if (isLoadingPermissions) return <PageLoadingTable />;

  return (
    <PageTable<JobTemplate | WorkflowJobTemplate>
      id="awx-job-templates-table"
      toolbarFilters={toolbarFilters}
      toolbarActions={toolbarActions}
      tableColumns={tableColumns}
      rowActions={rowActions}
      errorStateTitle={t('Error loading templates')}
      emptyState={
        activeDomains.length > 0 ? (
          <PageTableEmptyState
            title={t('No templates match the selected domains')}
            description={t('Please select a different domain or clear the current selection.')}
          />
        ) : canCreateJobTemplate || canCreateWFJobTemplate ? (
          <PageTableEmptyState
            title={t('No templates yet')}
            description={t('Create a template to populate this list.')}
          >
            <PageActionsPinned actions={toolbarActions.slice(0, 1)} />
          </PageTableEmptyState>
        ) : (
          <PageTableEmptyState
            title={t('No templates yet')}
            description={t(
              'Job template creation requires project access. You are not currently assigned to any projects. Additionally, you do not have permissions to create a workflow job template. Please contact your organization administrator if there is an issue with your access.'
            )}
          />
        )
      }
      {...view}
      defaultSubtitle={t('Template')}
    />
  );
}
