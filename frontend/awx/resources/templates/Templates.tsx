import { ButtonVariant } from '@patternfly/react-core';
import { EditIcon, PlusCircleIcon, TrashIcon } from '@patternfly/react-icons';
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
import { RouteObj } from '../../../Routes';
import { usePersistentFilters } from '../../../common/PersistentFilters';
import {
  useCreatedColumn,
  useDescriptionColumn,
  useModifiedColumn,
  useNameColumn,
  useTypeColumn,
} from '../../../common/columns';
import {
  useCreatedByToolbarFilter,
  useDescriptionToolbarFilter,
  useModifiedByToolbarFilter,
  useNameToolbarFilter,
} from '../../common/awx-toolbar-filters';
import { useAwxConfig } from '../../common/useAwxConfig';
import getDocsBaseUrl from '../../common/util/getDocsBaseUrl';
import { JobTemplate } from '../../interfaces/JobTemplate';
import { WorkflowJobTemplate } from '../../interfaces/WorkflowJobTemplate';
import { useAwxView } from '../../useAwxView';
import { useDeleteTemplates } from './hooks/useDeleteTemplates';

export function Templates() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const toolbarFilters = useTemplateFilters();
  const tableColumns = useTemplatesColumns();
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

export function useTemplateFilters() {
  const nameToolbarFilter = useNameToolbarFilter();
  const descriptionToolbarFilter = useDescriptionToolbarFilter();
  const createdByToolbarFilter = useCreatedByToolbarFilter();
  const modifiedByToolbarFilter = useModifiedByToolbarFilter();
  const toolbarFilters = useMemo<IToolbarFilter[]>(
    () => [
      nameToolbarFilter,
      descriptionToolbarFilter,
      createdByToolbarFilter,
      modifiedByToolbarFilter,
    ],
    [nameToolbarFilter, descriptionToolbarFilter, createdByToolbarFilter, modifiedByToolbarFilter]
  );
  return toolbarFilters;
}

export function useTemplatesColumns(options?: { disableSort?: boolean; disableLinks?: boolean }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  // TODO: URL should be dependant on template type
  const nameClick = useCallback(
    (template: JobTemplate | WorkflowJobTemplate) => {
      if (template.type === 'job_template') {
        navigate(RouteObj.JobTemplateDetails.replace(':id', template.id.toString()));
        return;
      }
      navigate(RouteObj.WorkflowJobTemplateDetails.replace(':id', template.id.toString()));
    },
    [navigate]
  );
  const nameColumn = useNameColumn({
    ...options,
    onClick: nameClick,
  });
  const makeReadable: (template: JobTemplate | WorkflowJobTemplate) => string = (template) => {
    if (template.type === 'workflow_job_template') {
      return t('Workflow job template');
    }
    return t('Job template');
  };
  const createdColumn = useCreatedColumn(options);
  const descriptionColumn = useDescriptionColumn();
  const modifiedColumn = useModifiedColumn(options);
  const typeOfTemplate = useTypeColumn<JobTemplate | WorkflowJobTemplate>({
    ...options,
    makeReadable,
  });
  const tableColumns = useMemo<ITableColumn<JobTemplate | WorkflowJobTemplate>[]>(
    () => [nameColumn, descriptionColumn, typeOfTemplate, createdColumn, modifiedColumn],
    [nameColumn, descriptionColumn, typeOfTemplate, createdColumn, modifiedColumn]
  );
  return tableColumns;
}
