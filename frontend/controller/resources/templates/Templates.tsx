import { ButtonVariant } from '@patternfly/react-core';
import { EditIcon, PlusIcon, TrashIcon } from '@patternfly/react-icons';
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
  useDescriptionColumn,
  useModifiedColumn,
  useNameColumn,
} from '../../../common/columns';
import { RouteE } from '../../../Routes';
import {
  useCreatedByToolbarFilter,
  useDescriptionToolbarFilter,
  useModifiedByToolbarFilter,
  useNameToolbarFilter,
} from '../../common/controller-toolbar-filters';
import { Template } from '../../interfaces/Template';
import { useControllerView } from '../../useControllerView';
import { useDeleteTemplates } from './useDeleteTemplates';

export function Templates() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const toolbarFilters = useTemplateFilters();
  const tableColumns = useTemplatesColumns();
  const view = useControllerView<Template>({
    url: '/api/v2/unified_job_templates/',
    toolbarFilters,
    tableColumns,
    queryParams: {
      type: 'job_template,workflow_job_template',
    },
  });

  const deleteTemplates = useDeleteTemplates(view.unselectItemsAndRefresh);

  const toolbarActions = useMemo<IPageAction<Template>[]>(
    () => [
      {
        type: PageActionType.dropdown,
        variant: ButtonVariant.primary,
        label: t('Create template'),
        icon: PlusIcon,
        options: [
          {
            type: PageActionType.button,
            icon: PlusIcon,
            label: t('Create Job Template'),
            onClick: () => navigate(RouteE.CreateJobTemplate),
          },
          {
            type: PageActionType.button,
            icon: PlusIcon,
            label: t('Create Workflow Job Template'),
            onClick: () => navigate(RouteE.CreateWorkflowJobTemplate),
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

  const rowActions = useMemo<IPageAction<Template>[]>(
    () => [
      {
        type: PageActionType.single,
        icon: EditIcon,
        label: t(`Edit Template`),
        onClick: (template) =>
          navigate(RouteE.JobTemplateEdit.replace(':id', template.id.toString())),
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
      <PageTable<Template>
        toolbarFilters={toolbarFilters}
        toolbarActions={toolbarActions}
        tableColumns={tableColumns}
        rowActions={rowActions}
        errorStateTitle={t('Error loading templates')}
        emptyStateTitle={t('No Templates yet')}
        emptyStateDescription={t('To get started, create a template.')}
        emptyStateButtonText={t('Create template')}
        emptyStateButtonClick={() => navigate(RouteE.CreateJobTemplate)}
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
  // TODO: URL should be dependant on template type
  const nameClick = useCallback(
    (template: Template) =>
      navigate(RouteE.JobTemplateDetails.replace(':id', template.id.toString())),
    [navigate]
  );
  const nameColumn = useNameColumn({
    ...options,
    onClick: nameClick,
  });
  const descriptionColumn = useDescriptionColumn();
  const createdColumn = useCreatedColumn(options);
  const modifiedColumn = useModifiedColumn(options);
  const tableColumns = useMemo<ITableColumn<Template>[]>(
    () => [nameColumn, descriptionColumn, createdColumn, modifiedColumn],
    [nameColumn, descriptionColumn, createdColumn, modifiedColumn]
  );
  return tableColumns;
}
