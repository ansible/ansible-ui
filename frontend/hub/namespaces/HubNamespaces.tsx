import { ButtonVariant } from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import {
  PageHeader,
  PageLayout,
  PageTab,
  PageTable,
  PageTabs,
  useGetPageUrl,
} from '../../../framework';
import { PageTableEmptyState } from '../../../framework/PageTable/PageTableEmptyState';
import { ButtonLink } from '../../../framework/components/ButtonLink';
import { idKeyFn } from '../../common/utils/nameKeyFn';
import { hubAPI } from '../common/api/formatPath';
import { useHubView } from '../common/useHubView';
import { HubRoute } from '../main/HubRoutes';
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
        titleHelpTitle={t('Namespaces')}
        titleHelp={[
          t(
            'Namespaces group related content together, making it easier for users to find and differentiate collections of Ansible roles and other components.'
          ),
          t(
            'They provide organization, prevent naming conflicts, and simplify the process of discovering and sharing Ansible automation content.'
          ),
        ]}
        titleDocLink="https://docs.redhat.com/en/documentation/red_hat_ansible_automation_platform/2.5/html/managing_automation_content/managing-collections-hub#assembly-working-with-namespaces"
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
  const getPageUrl = useGetPageUrl();
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
      emptyState={
        <PageTableEmptyState
          title={t('No namespaces yet')}
          description={t('To get started, create an namespace.')}
        >
          <ButtonLink
            icon={<PlusCircleIcon />}
            variant={ButtonVariant.primary}
            href={getPageUrl(HubRoute.CreateNamespace)}
          >
            {t('Create namespace')}
          </ButtonLink>
        </PageTableEmptyState>
      }
      defaultSubtitle={t('Namespace')}
      defaultTableView="cards"
      {...view}
    />
  );
}
