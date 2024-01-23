import { ButtonVariant } from '@patternfly/react-core';
import { PlusCircleIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  PageHeader,
  PageLayout,
  PageTable,
  usePageNavigate,
} from '../../../../framework';
import { usePersistentFilters } from '../../../common/PersistentFilters';
import { AwxRoute } from '../../main/AwxRoutes';
import { useAwxConfig } from '../../common/useAwxConfig';
import { getDocsBaseUrl } from '../../common/util/getDocsBaseUrl';
import { JobTemplate } from '../../interfaces/JobTemplate';
import { WorkflowJobTemplate } from '../../interfaces/WorkflowJobTemplate';
import { useAwxView } from '../../common/useAwxView';
import { awxAPI } from '../../common/api/awx-utils';
import { useDeleteTemplates } from './hooks/useDeleteTemplates';
import { useTemplateColumns } from './hooks/useTemplateColumns';
import { useTemplateFilters } from './hooks/useTemplateFilters';
import { useTemplateActions } from './hooks/useTemplateActions';
import { useOptions } from '../../../common/crud/useOptions';
import { ActionsResponse, OptionsResponse } from '../../interfaces/OptionsResponse';

export function Templates() {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const toolbarFilters = useTemplateFilters();
  const tableColumns = useTemplateColumns();

  const view = useAwxView<JobTemplate | WorkflowJobTemplate>({
    url: awxAPI`/unified_job_templates/`,
    toolbarFilters,
    tableColumns,
    queryParams: {
      type: 'job_template,workflow_job_template',
    },
  });
  const { data } = useOptions<OptionsResponse<ActionsResponse>>(awxAPI`/templates/`);
  const canCreateTemplate = Boolean(data && data.actions && data.actions['POST']);
  usePersistentFilters('templates');
  const config = useAwxConfig();

  const deleteTemplates = useDeleteTemplates(view.unselectItemsAndRefresh);

  const toolbarActions = useMemo<IPageAction<JobTemplate | WorkflowJobTemplate>[]>(
    () => [
      {
        type: PageActionType.Dropdown,
        variant: ButtonVariant.primary,
        isPinned: true,
        label: t('Create template'),
        selection: PageActionSelection.None,
        icon: PlusCircleIcon,
        actions: [
          {
            type: PageActionType.Button,
            selection: PageActionSelection.None,
            label: t('Create job template'),
            onClick: () => pageNavigate(AwxRoute.CreateJobTemplate),
          },
          {
            type: PageActionType.Button,
            selection: PageActionSelection.None,
            label: t('Create workflow job template'),
            onClick: () => pageNavigate(AwxRoute.CreateWorkflowJobTemplate),
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
    [deleteTemplates, pageNavigate, t]
  );

  const rowActions = useTemplateActions({ onTemplatesDeleted: view.unselectItemsAndRefresh });

  return (
    <PageLayout>
      <PageHeader
        title={t('Templates')}
        titleHelpTitle={t('Template')}
        titleHelp={t(
          'A job template is a definition and set of parameters for running an Ansible job. Job templates are useful to execute the same job many times. Job templates also encourage the reuse of Ansible playbook content and collaboration between teams.'
        )}
        titleDocLink={`${getDocsBaseUrl(config)}/html/userguide/job_templates.html`}
        description={t(
          'A job template is a definition and set of parameters for running an Ansible job.'
        )}
      />
      <PageTable<JobTemplate | WorkflowJobTemplate>
        id="awx-job-templates-table"
        toolbarFilters={toolbarFilters}
        toolbarActions={toolbarActions}
        tableColumns={tableColumns}
        rowActions={rowActions}
        errorStateTitle={t('Error loading templates')}
        emptyStateTitle={
          canCreateTemplate
            ? t('No templates yet')
            : t('You do not have permission to create a template')
        }
        emptyStateDescription={
          canCreateTemplate
            ? t('Please create a template by using the button below.')
            : t(
                'Please contact your organization administrator if there is an issue with your access.'
              )
        }
        emptyStateButtonText={canCreateTemplate ? t('Create template') : undefined}
        emptyStateButtonClick={
          canCreateTemplate ? () => pageNavigate(AwxRoute.CreateJobTemplate) : undefined
        }
        {...view}
        defaultSubtitle={t('Template')}
      />
    </PageLayout>
  );
}
