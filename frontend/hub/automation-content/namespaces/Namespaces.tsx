import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { PageHeader, PageLayout, PageTab, PageTable, PageTabs } from '../../../../framework'
import { RouteE } from '../../../Routes'
import { idKeyFn, useHubView } from '../../useHubView'
import { useNamespaceFilters } from './hooks/useNamespaceFilters'
import { useNamespacesColumns } from './hooks/useNamespacesColumns'
import { Namespace } from './Namespace'

export function Namespaces() {
  const { t } = useTranslation()
  return (
    <PageLayout>
      <PageHeader
        title={t('Namespaces')}
        description={t(
          'Use namespaces to organize the collections created by automation developers in your organization.'
        )}
        titleHelpTitle={t('Namespaces')}
        titleHelp={t(
          'Use namespaces to organize the collections created by automation developers in your organization. Create namespaces, upload collections and add additional information and resources that help your end users in their automation tasks.'
        )}
        titleDocLink="https://access.redhat.com/documentation/en-us/red_hat_ansible_automation_platform/2.2/html/curating_collections_using_namespaces_in_automation_hub/index"
      />
      <PageTabs>
        <PageTab title={t('All')}>
          <AllNamespaces />
        </PageTab>
        <PageTab title={t('My namespaces')}>
          <MyNamespaces />
        </PageTab>
      </PageTabs>
    </PageLayout>
  )
}

export function AllNamespaces() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const toolbarFilters = useNamespaceFilters()
  const tableColumns = useNamespacesColumns()
  const view = useHubView<Namespace>(
    '/api/automation-hub/_ui/v1/namespaces/',
    idKeyFn,
    toolbarFilters,
    tableColumns
  )
  return (
    <PageTable<Namespace>
      toolbarFilters={toolbarFilters}
      tableColumns={tableColumns}
      errorStateTitle={t('Error loading namespaces')}
      emptyStateTitle={t('No namespaces yet')}
      emptyStateDescription={t('To get started, create an namespace.')}
      emptyStateButtonText={t('Add namespace')}
      emptyStateButtonClick={() => navigate(RouteE.CreateNamespace)}
      {...view}
      defaultSubtitle={t('Namespace')}
      defaultTableView="cards"
    />
  )
}

export function MyNamespaces() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const toolbarFilters = useNamespaceFilters()
  const tableColumns = useNamespacesColumns()
  const view = useHubView<Namespace>(
    '/api/automation-hub/_ui/v1/my-namespaces/',
    idKeyFn,
    toolbarFilters,
    tableColumns
  )
  return (
    <PageTable<Namespace>
      toolbarFilters={toolbarFilters}
      tableColumns={tableColumns}
      errorStateTitle={t('Error loading namespaces')}
      emptyStateTitle={t('No namespaces yet')}
      emptyStateDescription={t('To get started, create an namespace.')}
      emptyStateButtonText={t('Add namespace')}
      emptyStateButtonClick={() => navigate(RouteE.CreateNamespace)}
      {...view}
      defaultSubtitle={t('Namespace')}
    />
  )
}
