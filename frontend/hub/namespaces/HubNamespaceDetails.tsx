/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Stack, PageSection, Card, Text, ClipboardCopy } from '@patternfly/react-core';
import {
  PageActions,
  PageHeader,
  PageTable,
  PageLayout,
  PageTab,
  PageTabs,
} from '../../../framework';
import { PageDetailsFromColumns } from '../../../framework';
import { RouteObj } from '../../Routes';
import { useGet } from '../../common/crud/useGet';
import { HubNamespaceResponse } from '../useHubView';
import { HubNamespace } from './HubNamespace';
import { useHubView } from '../useHubView';
import { useHubNamespaceActions } from './hooks/useHubNamespaceActions';
import { useHubNamespacesColumns } from './hooks/useHubNamespacesColumns';
import { useCollectionFilters } from '../collections/hooks/useCollectionFilters';
import { useCollectionVersionColumns } from '../collections/hooks/useCollectionVersionColumns';
import { CollectionVersionSearch } from '../collections/CollectionVersionSearch';
import { hubAPI, getRepoURL } from '../api';
import { DropdownPosition } from '@patternfly/react-core';

export function NamespaceDetails() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const { data } = useGet<HubNamespaceResponse<HubNamespace>>(
    `/api/automation-hub/pulp/api/v3/pulp_ansible/namespaces/?limit=1&name=${params.id ?? ''}`
  );
  let namespace: HubNamespace | undefined = undefined;
  if (data && data.results && data.count > 0) {
    namespace = data.results[0];
  }

  const pageActions = useHubNamespaceActions();
  return (
    <PageLayout>
      <PageHeader
        title={namespace?.name}
        breadcrumbs={[{ label: t('Namespaces'), to: RouteObj.Namespaces }, { label: params.id }]}
        headerActions={
          <PageActions<HubNamespace>
            actions={pageActions}
            position={DropdownPosition.right}
            selectedItem={namespace}
          />
        }
      />
      <PageTabs>
        <PageTab label={t('Collections')}>
          <CollectionsTab namespace={namespace} />
        </PageTab>
        <PageTab label={t('CLI Configuration')}>
          <CLIConfigTab />
        </PageTab>
        <PageTab label={t('Namespace Details')}>
          <NamespaceDetailsTab />
        </PageTab>
      </PageTabs>
    </PageLayout>
  );
}

function NamespaceDetailsTab(props: { namespace?: HubNamespace }) {
  const { namespace } = props;
  // eslint-disable-next-line no-console
  const tableColumns = useHubNamespacesColumns();
  return <PageDetailsFromColumns item={namespace} columns={tableColumns} />;
}

function CLIConfigTab() {
  const { t } = useTranslation();
  return (
    <PageLayout>
      <PageSection style={{ gap: '16px' }}>
        <Card
          isFlat
          isLarge
          isRounded
          style={{
            transition: 'box-shadow 0.25s',
            cursor: 'default',
            maxWidth: '100%',
            padding: '24px',
          }}
        >
          <Stack>
            <ClipboardCopy hoverTip="Copy" clickTip="Copied" style={{ borderRadius: 4 }}>
              {getRepoURL()}
            </ClipboardCopy>
          </Stack>
          <Stack hasGutter style={{ paddingTop: '16px' }}>
            <Text>
              {t(
                'Note: Use this URL to configure ansible-galaxy to upload collections to this namespace. More information on ansible-galaxy configurations can be found '
              )}
              <Link
                to="https://docs.ansible.com/ansible/latest/galaxy/user_guide.html#configuring-the-ansible-galaxy-client"
                target="_blank"
              >
                {t('here')}
              </Link>
              {t('.')}
            </Text>
          </Stack>
        </Card>
      </PageSection>
    </PageLayout>
  );
}

function CollectionsTab(props: { namespace?: HubNamespace }) {
  const { t } = useTranslation();
  const toolbarFilters = useCollectionFilters();
  const tableColumns = useCollectionVersionColumns();
  const view = useHubView<CollectionVersionSearch>({
    url: hubAPI`/v3/plugin/ansible/search/collection-versions/`,
    keyFn: (item) => item.collection_version.pulp_href + ':' + item.repository.name,
    tableColumns,
    queryParams: { namespace: props?.namespace?.name },
  });
  const navigate = useNavigate();

  return (
    <PageLayout>
      <PageTable<CollectionVersionSearch>
        toolbarFilters={toolbarFilters}
        tableColumns={tableColumns}
        errorStateTitle={t('Error loading collections')}
        emptyStateTitle={t('No collections yet')}
        emptyStateDescription={t('To get started, upload a collection.')}
        emptyStateButtonText={t('Upload collection')}
        emptyStateButtonClick={() => navigate(RouteObj.UploadCollection)}
        {...view}
        defaultTableView="list"
        defaultSubtitle={t('Collection')}
      />
    </PageLayout>
  );
}
