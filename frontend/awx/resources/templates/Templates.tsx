import { ButtonVariant } from '@patternfly/react-core';
import { EditIcon, PlusCircleIcon, TrashIcon } from '@patternfly/react-icons';
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
import { RouteObj } from '../../../common/Routes';
import { AwxRoute } from '../../AwxRoutes';
import { useAwxConfig } from '../../common/useAwxConfig';
import getDocsBaseUrl from '../../common/util/getDocsBaseUrl';
import { JobTemplate } from '../../interfaces/JobTemplate';
import { WorkflowJobTemplate } from '../../interfaces/WorkflowJobTemplate';
import { useAwxView } from '../../useAwxView';
import { useDeleteTemplates } from './hooks/useDeleteTemplates';
import { useTemplateColumns } from './hooks/useTemplateColumns';
import { useTemplateFilters } from './hooks/useTemplateFilters';

export function Templates() {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const toolbarFilters = useTemplateFilters();
  const tableColumns = useTemplateColumns();
  const view = useAwxView<JobTemplate | WorkflowJobTemplate>({
    url: '/api/v2/unified_job_templates/',
    toolbarFilters,
    tableColumns,
    queryParams: {
      type: 'job_template,workflow_job_template',
    },
  });
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

  const rowActions = useMemo<IPageAction<JobTemplate | WorkflowJobTemplate>[]>(
    () => [
      // TODO: Launch template
      // {
      //   type: PageActionType.Button,
      //   selection: PageActionSelection.Single,
      //   icon: RocketIcon,
      //   isPinned: true,
      //   label: t('Launch template'),
      //   onClick: async (template) => {
      //     // try {
      //     //   const job = await handleLaunch(template?.type as string, template?.id);
      //     //   if (job) {
      //     //     navigate(getJobOutputUrl(job));
      //     //   }
      //     // } catch {
      //     //   // handle error
      //     // }
      //   },
      //   ouiaId: 'job-template-detail-launch-button',
      //   isDanger: false,
      // },
      {
        type: PageActionType.Link,
        selection: PageActionSelection.Single,
        isPinned: true,
        icon: EditIcon,
        label: t(`Edit template`),
        href: (template) => RouteObj.EditJobTemplate.replace(':id', template.id.toString()),
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t(`Delete template`),
        onClick: (template) => deleteTemplates([template]),
        isDanger: true,
      },
    ],
    [deleteTemplates, t]
  );
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
        emptyStateTitle={t('No templates yet')}
        emptyStateDescription={t('To get started, create a template.')}
        emptyStateButtonText={t('Create template')}
        emptyStateButtonClick={() => pageNavigate(AwxRoute.CreateJobTemplate)}
        {...view}
        defaultSubtitle={t('Template')}
      />
    </PageLayout>
  );
}
