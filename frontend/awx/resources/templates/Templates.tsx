import { ButtonVariant } from '@patternfly/react-core';
import { EditIcon, PlusCircleIcon, TrashIcon } from '@patternfly/react-icons';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  IPageAction,
  ITableColumn,
  IToolbarFilter,
  PageActionType,
  PageHeader,
  PageLayout,
  PageTable,
} from '../../../../framework';
import {
  useCreatedColumn,
  useModifiedColumn,
  useNameColumn,
  useTypeColumn,
} from '../../../common/columns';
import { ItemDescriptionExpandedRow } from '../../../common/ItemDescriptionExpandedRow';
import { RouteObj } from '../../../Routes';
import {
  useCreatedByToolbarFilter,
  useDescriptionToolbarFilter,
  useModifiedByToolbarFilter,
  useNameToolbarFilter,
} from '../../common/awx-toolbar-filters';
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

  const deleteTemplates = useDeleteTemplates(view.unselectItemsAndRefresh);

  const toolbarActions = useMemo<IPageAction<JobTemplate | WorkflowJobTemplate>[]>(
    () => [
      {
        type: PageActionType.dropdown,
        variant: ButtonVariant.primary,
        label: t('Create template'),
        icon: PlusCircleIcon,
        options: [
          {
            type: PageActionType.button,
            label: t('Create Job Template'),
            onClick: () => navigate(RouteObj.CreateJobTemplate),
          },
          {
            type: PageActionType.button,
            label: t('Create Workflow Job Template'),
            onClick: () => navigate(RouteObj.CreateWorkflowJobTemplate),
          },
        ],
      },
      {
        type: PageActionType.bulk,
        icon: TrashIcon,
        label: 'Delete selected templates',
        onClick: deleteTemplates,
      },
    ],
    [deleteTemplates, navigate, t]
  );

  const rowActions = useMemo<IPageAction<JobTemplate | WorkflowJobTemplate>[]>(
    () => [
      {
        type: PageActionType.single,
        icon: EditIcon,
        label: t(`Edit Template`),
        onClick: (template) =>
          navigate(RouteObj.JobTemplateEdit.replace(':id', template.id.toString())),
      },
      {
        type: PageActionType.single,
        icon: TrashIcon,
        label: t(`Delete Template`),
        onClick: (template) => deleteTemplates([template]),
      },
    ],
    [navigate, deleteTemplates, t]
  );
  return (
    <PageLayout>
      <PageHeader
        title={t('Job templates')}
        titleHelpTitle={t('Job templates')}
        titleHelp={t(
          'A job template is a definition and set of parameters for running an Ansible job. Job templates are useful to execute the same job many times. Job templates also encourage the reuse of Ansible playbook content and collaboration between teams.'
        )}
        titleDocLink="https://docs.ansible.com/ansible-tower/latest/html/userguide/job_templates.html"
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
        emptyStateTitle={t('No Templates yet')}
        emptyStateDescription={t('To get started, create a template.')}
        emptyStateButtonText={t('Create template')}
        emptyStateButtonClick={() => navigate(RouteObj.CreateJobTemplate)}
        expandedRow={ItemDescriptionExpandedRow<JobTemplate | WorkflowJobTemplate>}
        {...view}
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
  const makeReadable: (type: string) => string = (type) => {
    if (type === 'workflow_job_template') {
      return t('Workflow Job Template');
    }
    return t('Job Template');
  };
  const createdColumn = useCreatedColumn(options);
  const modifiedColumn = useModifiedColumn(options);
  const typeOfTemplate = useTypeColumn({ makeReadable });
  const tableColumns = useMemo<ITableColumn<JobTemplate | WorkflowJobTemplate>[]>(
    () => [nameColumn, typeOfTemplate, createdColumn, modifiedColumn],
    [nameColumn, typeOfTemplate, createdColumn, modifiedColumn]
  );
  return tableColumns;
}
