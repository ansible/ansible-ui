import { ButtonVariant } from '@patternfly/react-core';
import { EditIcon, PlusIcon, SyncIcon, TrashIcon } from '@patternfly/react-icons';
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
  useOrganizationNameColumn,
  useTypeColumn,
} from '../../../common/columns';
import { ItemDescriptionExpandedRow } from '../../../common/ItemDescriptionExpandedRow';
import { StatusCell } from '../../../common/StatusCell';
import { RouteObj } from '../../../Routes';
import { useOptions } from '../../../common/crud/useOptions';
import {
  useCreatedByToolbarFilter,
  useDescriptionToolbarFilter,
  useModifiedByToolbarFilter,
  useNameToolbarFilter,
} from '../../common/awx-toolbar-filters';
import { ActionsResponse, OptionsResponse } from '../../interfaces/OptionsResponse';
import { Project } from '../../interfaces/Project';
import { useAwxView } from '../../useAwxView';
import { useDeleteProjects } from './hooks/useDeleteProjects';

export function Projects() {
  const { t } = useTranslation();
  const product: string = process.env.PRODUCT ?? t('AWX');
  const navigate = useNavigate();
  const toolbarFilters = useProjectsFilters();
  const tableColumns = useProjectsColumns();
  const view = useAwxView<Project>({
    url: '/api/v2/projects/',
    toolbarFilters,
    tableColumns,
  });
  const deleteProjects = useDeleteProjects(view.unselectItemsAndRefresh);

  const toolbarActions = useMemo<IPageAction<Project>[]>(
    () => [
      {
        type: PageActionType.button,
        variant: ButtonVariant.primary,
        icon: PlusIcon,
        label: t('Create project'),
        onClick: () => navigate(RouteObj.CreateProject),
      },
      {
        type: PageActionType.bulk,
        icon: TrashIcon,
        label: t('Delete selected projects'),
        onClick: deleteProjects,
        isDanger: true,
      },
    ],
    [navigate, deleteProjects, t]
  );

  const rowActions = useMemo<IPageAction<Project>[]>(
    () => [
      {
        type: PageActionType.single,
        variant: ButtonVariant.secondary,
        icon: SyncIcon,
        label: t('Sync'),
        onClick: (_project) => alert('TODO'),
      },
      {
        type: PageActionType.single,
        icon: EditIcon,
        label: t('Edit project'),
        onClick: (project) => navigate(RouteObj.EditProject.replace(':id', project.id.toString())),
      },
      {
        type: PageActionType.single,
        icon: TrashIcon,
        label: t('Delete project'),
        onClick: (project) => deleteProjects([project]),
        isDanger: true,
      },
    ],
    [navigate, deleteProjects, t]
  );

  return (
    <PageLayout>
      <PageHeader
        title={t('Projects')}
        titleHelpTitle={t('Projects')}
        titleHelp={t(
          `A Project is a logical collection of Ansible playbooks, represented in ${product}. You can manage playbooks and playbook directories by either placing them manually under the Project Base Path on your ${product} server, or by placing your playbooks into a source code management (SCM) system supported by ${product}, including Git, Subversion, Mercurial, and Red Hat Insights.`
        )}
        titleDocLink="https://docs.ansible.com/ansible-tower/latest/html/userguide/projects.html"
        description={t(
          `A Project is a logical collection of Ansible playbooks, represented in ${product}.`
        )}
      />
      <PageTable<Project>
        toolbarFilters={toolbarFilters}
        toolbarActions={toolbarActions}
        tableColumns={tableColumns}
        rowActions={rowActions}
        errorStateTitle={t('Error loading projects')}
        emptyStateTitle={t('No projects yet')}
        emptyStateDescription={t('To get started, create an project.')}
        emptyStateButtonText={t('Create project')}
        emptyStateButtonClick={() => navigate(RouteObj.CreateProject)}
        expandedRow={ItemDescriptionExpandedRow<Project>}
        {...view}
      />
    </PageLayout>
  );
}

export function useProjectsFilters() {
  const { t } = useTranslation();
  const nameToolbarFilter = useNameToolbarFilter();
  const descriptionToolbarFilter = useDescriptionToolbarFilter();
  const createdByToolbarFilter = useCreatedByToolbarFilter();
  const modifiedByToolbarFilter = useModifiedByToolbarFilter();
  const toolbarFilters = useMemo<IToolbarFilter[]>(
    () => [
      nameToolbarFilter,
      descriptionToolbarFilter,
      {
        key: 'type',
        label: t('Type'),
        type: 'select',
        query: 'scm_type',
        options: [
          { label: t('Manual'), value: 'manual' },
          { label: t('Git'), value: 'git' },
          { label: t('Subversion'), value: 'subversion' },
          { label: t('Remote archive'), value: 'remote' },
          { label: t('Red Hat insights'), value: 'insights' },
        ],
        placeholder: t('Select types'),
      },
      createdByToolbarFilter,
      modifiedByToolbarFilter,
    ],
    [
      nameToolbarFilter,
      descriptionToolbarFilter,
      t,
      createdByToolbarFilter,
      modifiedByToolbarFilter,
    ]
  );
  return toolbarFilters;
}

export function useProjectsColumns(options?: { disableSort?: boolean; disableLinks?: boolean }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const nameClick = useCallback(
    (project: Project) => navigate(RouteObj.ProjectDetails.replace(':id', project.id.toString())),
    [navigate]
  );
  const {
    data,
  }: { data?: { actions?: { POST?: { scm_type?: { choices?: [[string, string]] } } } } } =
    useOptions<OptionsResponse<ActionsResponse>>('/api/v2/projects/');

  const makeReadable: (project: Project) => string = useCallback(
    (project) => {
      let string = '';
      const choices = data?.actions?.POST?.scm_type?.choices;
      choices?.forEach(([value, label]) => {
        if (value === project.scm_type) {
          string = label;
          return;
        }
        return;
      });
      return string;
    },
    [data?.actions?.POST?.scm_type?.choices]
  );
  const nameColumn = useNameColumn({ ...options, onClick: nameClick });
  const organizationColumn = useOrganizationNameColumn(options);
  const projectType = useTypeColumn({
    ...options,
    makeReadable,
  });
  const createdColumn = useCreatedColumn(options);
  const modifiedColumn = useModifiedColumn(options);
  const tableColumns = useMemo<ITableColumn<Project>[]>(
    () => [
      nameColumn,
      {
        header: t('Status'),
        cell: (project) => <StatusCell status={project.status} />,
        showOnModal: true,
      },
      projectType,
      {
        header: t('Revision'),
        cell: (project) => project.scm_revision,
        showOnMondal: true,
      },
      { ...organizationColumn, showOnModal: false },
      createdColumn,
      modifiedColumn,
    ],
    [nameColumn, projectType, t, organizationColumn, createdColumn, modifiedColumn]
  );
  return tableColumns;
}
