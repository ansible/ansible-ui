import { ButtonVariant } from '@patternfly/react-core'
import { EditIcon, PlusIcon, TrashIcon } from '@patternfly/react-icons'
import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import {
  ITableColumn,
  IToolbarFilter,
  ITypedAction,
  TablePage,
  TypedActionType,
} from '../../../../framework'
import {
  useCreatedColumn,
  useDescriptionColumn,
  useModifiedColumn,
  useNameColumn,
} from '../../../common/columns'
import { RouteE } from '../../../Routes'
import {
  useCreatedByToolbarFilter,
  useDescriptionToolbarFilter,
  useModifiedByToolbarFilter,
  useNameToolbarFilter,
} from '../../common/controller-toolbar-filters'
import { useControllerView } from '../../useControllerView'
import { Template } from './Template'
import { useDeleteTemplates } from './useDeleteTemplates'

export function Templates() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const toolbarFilters = useTemplateFilters()
  const tableColumns = useTemplatesColumns()
  const view = useControllerView<Template>({
    url: '/api/v2/unified_job_templates/',
    toolbarFilters,
    tableColumns,
  })

  const deleteTemplates = useDeleteTemplates(view.unselectItemsAndRefresh)

  const toolbarActions = useMemo<ITypedAction<Template>[]>(
    () => [
      {
        type: TypedActionType.dropdown,
        variant: ButtonVariant.primary,
        label: t('Create template'),
        options: [
          {
            type: TypedActionType.button,
            icon: PlusIcon,
            label: t('Create Job Template'),
            onClick: () => navigate(RouteE.CreateJobTemplate),
          },
          {
            type: TypedActionType.button,
            icon: PlusIcon,
            label: t('Create Workflow Job Template'),
            onClick: () => navigate(RouteE.CreateWorkflowJobTemplate),
          },
        ],
      },
      {
        type: TypedActionType.bulk,
        icon: TrashIcon,
        label: 'Delete selected templates',
        onClick: deleteTemplates,
      },
    ],
    [deleteTemplates, navigate, t]
  )

  const rowActions = useMemo<ITypedAction<Template>[]>(
    () => [
      {
        type: TypedActionType.single,
        icon: EditIcon,
        label: t(`Edit Template`),
        onClick: (template) =>
          navigate(RouteE.JobTemplateEdit.replace(':id', template.id.toString())),
      },
      {
        type: TypedActionType.single,
        icon: TrashIcon,
        label: t(`Delete Template`),
        onClick: (template) => deleteTemplates([template]),
      },
    ],
    [navigate, deleteTemplates, t]
  )
  return (
    <TablePage<Template>
      title={t('Templates')}
      titleHelpTitle={t('Templates')}
      titleHelp={t(
        'An template defines the hosts and groups of hosts upon which commands, modules, and tasks in a playbook operate.'
      )}
      titleDocLink="https://docs.ansible.com/ansible-tower/latest/html/userguide/templates.html"
      description={t(
        'An template defines the hosts and groups of hosts upon which commands, modules, and tasks in a playbook operate.'
      )}
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
  )
}

export function useTemplateFilters() {
  const nameToolbarFilter = useNameToolbarFilter()
  const descriptionToolbarFilter = useDescriptionToolbarFilter()
  const createdByToolbarFilter = useCreatedByToolbarFilter()
  const modifiedByToolbarFilter = useModifiedByToolbarFilter()
  const toolbarFilters = useMemo<IToolbarFilter[]>(
    () => [
      nameToolbarFilter,
      descriptionToolbarFilter,
      createdByToolbarFilter,
      modifiedByToolbarFilter,
    ],
    [nameToolbarFilter, descriptionToolbarFilter, createdByToolbarFilter, modifiedByToolbarFilter]
  )
  return toolbarFilters
}

export function useTemplatesColumns(options?: { disableSort?: boolean; disableLinks?: boolean }) {
  const navigate = useNavigate()
  const nameClick = useCallback(
    (template: Template) =>
      navigate(RouteE.InventoryDetails.replace(':id', template.id.toString())),
    [navigate]
  )
  const nameColumn = useNameColumn({
    ...options,
    onClick: nameClick,
  })
  const descriptionColumn = useDescriptionColumn()
  const createdColumn = useCreatedColumn(options)
  const modifiedColumn = useModifiedColumn(options)
  const tableColumns = useMemo<ITableColumn<Template>[]>(
    () => [nameColumn, descriptionColumn, createdColumn, modifiedColumn],
    [nameColumn, descriptionColumn, createdColumn, modifiedColumn]
  )
  return tableColumns
}
