import {
  PageActionType,
  PageHeader,
  PageLayout,
  PageTab,
  PageTable,
  PageTabs,
  useGetPageUrl,
} from '@ansible/ansible-ui-framework';
import { EmptyStateUnauthorized } from '@ansible/ansible-ui-framework/components/EmptyStateUnauthorized';
import { PageTableEmptyState } from '@ansible/ansible-ui-framework/PageTable/PageTableEmptyState';
import { ButtonLink } from '@ansible/ansible-ui-framework/components/ButtonLink';
import { useGet } from '@ansible/common-ui/crud/useGet';
import { idKeyFn } from '@ansible/common-ui/utils/nameKeyFn';
import { ButtonVariant } from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { hubAPI } from '../common/api/formatPath';
import { filterInsightsBulkActions, isInsightsMode } from '../common/isInsights';
import { HubItemsResponse, useHubView } from '../common/useHubView';
import { isAccessDeniedError } from '../common/utils/errorUtils';
import { HubRoute } from '../main/HubRoutes';
import { HubNamespace } from './HubNamespace';
import { useHubNamespaceActions } from './hooks/useHubNamespaceActions';
import { useHubNamespaceFilters } from './hooks/useHubNamespaceFilters';
import { useHubNamespaceToolbarActions } from './hooks/useHubNamespaceToolbarActions';
import { useHubNamespacesColumns } from './hooks/useHubNamespacesColumns';

export function Namespaces() {
  const { t } = useTranslation();
  const insights = isInsightsMode();
  return (
    <PageLayout>
      <PageHeader
        title={insights ? t('Partners') : t('Namespaces')}
        description={
          insights
            ? undefined
            : t(
                'Namespaces group related content together, making it easier for users to find and differentiate collections of Ansible roles and other components.'
              )
        }
        titleHelpTitle={insights ? undefined : t('Namespaces')}
        titleHelp={
          insights
            ? undefined
            : [
                t(
                  'Namespaces group related content together, making it easier for users to find and differentiate collections of Ansible roles and other components.'
                ),
                t(
                  'They provide organization, prevent naming conflicts, and simplify the process of discovering and sharing Ansible automation content.'
                ),
              ]
        }
        titleDocLink={
          insights
            ? undefined
            : 'https://docs.redhat.com/en/documentation/red_hat_ansible_automation_platform/2.5/html/managing_automation_content/managing-collections-hub#assembly-working-with-namespaces'
        }
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
  return <CommonNamespaces url={hubAPI`/_ui/v1/namespaces/`} isMyNamespaces={false} />;
}

export function MyNamespaces() {
  return <CommonNamespaces url={hubAPI`/_ui/v1/my-namespaces/`} isMyNamespaces={true} />;
}

export function CommonNamespaces({
  url,
  isMyNamespaces,
}: {
  url: string;
  isMyNamespaces: boolean;
}) {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const toolbarFilters = useHubNamespaceFilters();
  const tableColumns = useHubNamespacesColumns();
  const view = useHubView<HubNamespace>({ url, keyFn: idKeyFn, toolbarFilters, tableColumns });
  const allToolbarActions = useHubNamespaceToolbarActions(view);
  const toolbarActions = useMemo(
    () => filterInsightsBulkActions(allToolbarActions),
    [allToolbarActions]
  );

  // In Insights mode on "All Namespaces" tab, fetch owned namespaces to check ownership
  // This allows us to hide actions for namespaces the user doesn't own
  const { data: myNamespacesData } = useGet<HubItemsResponse<HubNamespace>>(
    isInsightsMode() && !isMyNamespaces ? hubAPI`/_ui/v1/my-namespaces/?limit=1000` : ''
  );

  // Create a Set of owned namespace names for quick lookup
  const ownedNamespaceNames = useMemo(() => {
    if (!myNamespacesData?.data) return new Set<string>();
    return new Set(myNamespacesData.data.map((ns) => ns.name));
  }, [myNamespacesData?.data]);

  // In Insights mode, hide row actions for namespaces the user doesn't own
  // On "My Namespaces" tab, all actions are shown (user owns all displayed namespaces)
  const allRowActions = useHubNamespaceActions({
    onHubNamespacesDeleted: view.unselectItemsAndRefresh,
  });

  const rowActions = useMemo(() => {
    // In platform mode or on "My Namespaces" tab, show all actions
    if (!isInsightsMode() || isMyNamespaces) {
      return allRowActions;
    }
    // In Insights mode on "All Namespaces" tab, add isHidden to check ownership
    // Compose with the action's existing isHidden so permission checks are preserved
    return allRowActions.map((action) => {
      if (action.type === PageActionType.Seperator) return action;
      const originalIsHidden =
        'isHidden' in action
          ? (action.isHidden as ((ns: HubNamespace) => boolean) | undefined)
          : undefined;
      return {
        ...action,
        isHidden: (namespace: HubNamespace) =>
          !ownedNamespaceNames.has(namespace.name) ||
          (typeof originalIsHidden === 'function' && originalIsHidden(namespace)),
      };
    }) as typeof allRowActions; // NOSONAR - assertion needed: .map() widens the union type
  }, [allRowActions, isMyNamespaces, ownedNamespaceNames]);

  // Check if the error is a 403 access denied error
  const isUnauthorized = isAccessDeniedError(view.error);

  // Show unauthorized state for 403 errors
  if (isUnauthorized) {
    return (
      <EmptyStateUnauthorized
        title={t('You do not have access to Namespaces')}
        adminMessage={t('Contact your organization administrator for more information.')}
      />
    );
  }

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
