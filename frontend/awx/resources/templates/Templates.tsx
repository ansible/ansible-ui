import { ButtonVariant } from '@patternfly/react-core';
import { EditIcon, PlusCircleIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  PageHeader,
  PageLayout,
  PageTable,
} from '../../../../framework';
import { RouteObj } from '../../../Routes';
import { usePersistentFilters } from '../../../common/PersistentFilters';
import { JobTemplate } from '../../interfaces/JobTemplate';
import { WorkflowJobTemplate } from '../../interfaces/WorkflowJobTemplate';
import { useAwxView } from '../../useAwxView';
import { useDeleteTemplates } from './hooks/useDeleteTemplates';
import getDocsBaseUrl from '../../common/util/getDocsBaseUrl';
import { useAwxConfig } from '../../common/useAwxConfig';
import { useTemplateFilters } from './hooks/useTemplateFilters';
import { useTemplateColumns } from './hooks/useTemplateColumns';

export function Templates() {
  const { t } = useTranslation();
  const navigate = useNavigate();
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
            onClick: () => navigate(RouteObj.CreateJobTemplate),
          },
          {
            type: PageActionType.Button,
            selection: PageActionSelection.None,
            label: t('Create workflow job template'),
            onClick: () => navigate(RouteObj.CreateWorkflowJobTemplate),
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
    [deleteTemplates, navigate, t]
  );

  const rowActions = useMemo<IPageAction<JobTemplate | WorkflowJobTemplate>[]>(
    () => [
      {
        type: PageActionType.Link,
        selection: PageActionSelection.Single,
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
        toolbarFilters={toolbarFilters}
        toolbarActions={toolbarActions}
        tableColumns={tableColumns}
        rowActions={rowActions}
        errorStateTitle={t('Error loading templates')}
        emptyStateTitle={t('No templates yet')}
        emptyStateDescription={t('To get started, create a template.')}
        emptyStateButtonText={t('Create template')}
        emptyStateButtonClick={() => navigate(RouteObj.CreateJobTemplate)}
        {...view}
        defaultSubtitle={t('Template')}
      />
    </PageLayout>
  );
}
