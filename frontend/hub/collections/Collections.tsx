import { useTranslation } from 'react-i18next'
import { PageHeader, PageLayout, PageTable } from '../../../framework'
import { idKeyFn, useHubView } from '../useHubView'
import { Collection } from './Collection'
import { useCollectionActions } from './hooks/useCollectionActions'
import { useCollectionColumns } from './hooks/useCollectionColumns'
import { useCollectionFilters } from './hooks/useCollectionFilters'
import { useCollectionsActions } from './hooks/useCollectionsActions'
import { useUploadCollection } from './hooks/useUploadCollection'

export function Collections() {
  const { t } = useTranslation()
  const toolbarFilters = useCollectionFilters()
  const tableColumns = useCollectionColumns()
  const view = useHubView<Collection>(
    '/api/automation-hub/_ui/v1/repo/published/',
    idKeyFn,
    toolbarFilters
  )
  const toolbarActions = useCollectionsActions()
  const rowActions = useCollectionActions()
  const uploadCollection = useUploadCollection()

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
        toolbarActions={toolbarActions}
        tableColumns={tableColumns}
        rowActions={rowActions}
        errorStateTitle={t('Error loading collections')}
        emptyStateTitle={t('No collections yet')}
        emptyStateDescription={t('To get started, upload a collection.')}
        emptyStateButtonText={t('Upload collection')}
        emptyStateButtonClick={() => uploadCollection({ title: t('Upload collection') })}
        {...view}
        defaultTableView="list"
        defaultSubtitle={t('Collection')}
      />
    </PageLayout>
  )
}
