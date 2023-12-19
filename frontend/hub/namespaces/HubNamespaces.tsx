import { useTranslation } from 'react-i18next';
import {
  PageHeader,
  PageLayout,
  PageTab,
  PageTable,
  PageTabs,
  usePageNavigate,
} from '../../../framework';
import { idKeyFn } from '../../common/utils/nameKeyFn';
import { HubRoute } from '../HubRoutes';
import { hubAPI } from '../api/formatPath';
import { useHubView } from '../useHubView';
import { HubNamespace } from './HubNamespace';
import { useHubNamespaceActions } from './hooks/useHubNamespaceActions';
import { useHubNamespaceFilters } from './hooks/useHubNamespaceFilters';
import { useHubNamespaceToolbarActions } from './hooks/useHubNamespaceToolbarActions';
import { useHubNamespacesColumns } from './hooks/useHubNamespacesColumns';

export function Namespaces() {
  const { t } = useTranslation();
  return (
    <PageLayout>
      <PageHeader
        title={t('Namespaces')}
        description={t(
          'Namespaces group related content together, making it easier for users to find and differentiate collections of Ansible roles and other components.'
        )}
        titleHelpTitle={t('Namespace')}
        titleHelp={[
          t(
            'Namespaces group related content together, making it easier for users to find and differentiate collections of Ansible roles and other components.'
          ),
          t(
            'They provide organization, prevent naming conflicts, and simplify the process of discovering and sharing Ansible automation content.'
          ),
        ]}
        titleDocLink="https://access.redhat.com/documentation/en-us/red_hat_ansible_automation_platform/2.2/html/curating_collections_using_namespaces_in_automation_hub/index"
      />
      <PageTabs>
        <PageTab label={t('All')}>
          <AllNamespaces />
        </PageTab>
        <PageTab label={t('My namespaces')}>
          <MyNamespaces />
        </PageTab>
      </PageTabs>
    </PageLayout>
  );
}

export function AllNamespaces() {
  return <CommonNamespaces url={hubAPI`/_ui/v1/namespaces/`} />;
}

export function MyNamespaces() {
  return <CommonNamespaces url={hubAPI`/_ui/v1/my-namespaces/`} />;
}

export function CommonNamespaces({ url }: { url: string }) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const toolbarFilters = useHubNamespaceFilters();
  const tableColumns = useHubNamespacesColumns();
  const view = useHubView<HubNamespace>({ url, keyFn: idKeyFn, toolbarFilters, tableColumns });
  const toolbarActions = useHubNamespaceToolbarActions(view);
  const rowActions = useHubNamespaceActions({
    onHubNamespacesDeleted: view.unselectItemsAndRefresh,
  });
  return (
    <PageTable<HubNamespace>
      id="hub-namespaces-table"
      toolbarFilters={toolbarFilters}
      tableColumns={tableColumns}
      toolbarActions={toolbarActions}
      rowActions={rowActions}
      errorStateTitle={t('Error loading namespaces')}
      emptyStateTitle={t('No namespaces yet')}
      emptyStateDescription={t('To get started, create an namespace.')}
      emptyStateButtonText={t('Add namespace')}
      emptyStateButtonClick={() => pageNavigate(HubRoute.CreateNamespace)}
      {...view}
      defaultSubtitle={t('Namespace')}
      defaultTableView="cards"
    />
  );
}
