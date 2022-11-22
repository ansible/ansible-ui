import { useTranslation } from 'react-i18next'
import { PageHeader, PageLayout, PageTable } from '../../../../framework'
import { idKeyFn, useHubView } from '../../useHubView'
import { Collection } from './Collection'
import { useCollectionActions } from './hooks/useCollectionActions'
import { useCollectionsColumns } from './hooks/useCollectionColumns'
import { useCollectionFilters } from './hooks/useCollectionFilters'

export function Collections() {
  const { t } = useTranslation()
  const toolbarFilters = useCollectionFilters()
  const tableColumns = useCollectionsColumns()
  const view = useHubView<Collection>(
    '/api/automation-hub/_ui/v1/repo/published/',
    idKeyFn,
    toolbarFilters
  )
  const rowActions = useCollectionActions()
  return (
    <PageLayout>
      <PageHeader
        title={t('Collections')}
        description={t(
          'Collections are a distribution format for Ansible content that can include playbooks, roles, modules, and plugins.'
        )}
        titleHelpTitle={t('Collections')}
        titleHelp={t(
          'Collections are a distribution format for Ansible content that can include playbooks, roles, modules, and plugins.'
        )}
        titleDocLink="https://docs.ansible.com/ansible/latest/user_guide/collections_using.html"
      />

      <PageTable<Collection>
        toolbarFilters={toolbarFilters}
        tableColumns={tableColumns}
        rowActions={rowActions}
        errorStateTitle={t('Error loading collections')}
        emptyStateTitle={t('No collections yet')}
        {...view}
        defaultTableView="list"
        defaultCardSubtitle={t('Collection')}
      />
    </PageLayout>
  )
}
