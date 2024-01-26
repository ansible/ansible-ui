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

export function TemplatesList(props: { url?: string; projectId?: string }) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const getPageUrl = useGetPageUrl();
  const toolbarFilters = useTemplateFilters();
  const tableColumns = useTemplateColumns();
  const view = useAwxView<JobTemplate | WorkflowJobTemplate>({
    url: props.url ? props.url : awxAPI`/unified_job_templates/`,
    queryParams: {
      project__id: props.projectId ? props.projectId : '',
      type: 'job_template,workflow_job_template',
    },
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

  const createTemplateActions = useMemo(() => {
    const createTemplateActions: IPageAction<JobTemplate | WorkflowJobTemplate>[] = [];

    if (canCreateJobTemplate) {
      createTemplateActions.push({
        type: PageActionType.Link,
        selection: PageActionSelection.None,
        label: t('Create job template'),
        href: getPageUrl(AwxRoute.CreateJobTemplate),
      });
    }

    if (canCreateWFJobTemplate) {
      createTemplateActions.push({
        type: PageActionType.Link,
        selection: PageActionSelection.None,
        label: t('Create workflow template'),
        href: getPageUrl(AwxRoute.CreateWorkflowJobTemplate),
      });
    }
    return createTemplateActions;
  }, [canCreateJobTemplate, canCreateWFJobTemplate, getPageUrl, t]);

  const placeholderAction = useMemo(
    () =>
      ({
        type: PageActionType.Button,
        selection: PageActionSelection.None,
      }) as IPageAction<JobTemplate | WorkflowJobTemplate>,
    []
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
        actions: createTemplateActions.length > 0 ? createTemplateActions : [placeholderAction],
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
    [
      canCreateJobTemplate,
      canCreateWFJobTemplate,
      createTemplateActions,
      deleteTemplates,
      placeholderAction,
      t,
    ]
  );

  const rowActions = useTemplateActions({ onTemplatesDeleted: view.unselectItemsAndRefresh });

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
