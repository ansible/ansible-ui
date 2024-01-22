import { useTranslation } from 'react-i18next';
import { PageHeader, PageLayout, PageTable, usePageNavigate } from '../../../../framework';
import { AwxRoute } from '../../main/AwxRoutes';
import { awxAPI } from '../../common/api/awx-utils';
import { useHostsFilters } from './hooks/useHostsFilters';
import { useAwxConfig } from '../../common/useAwxConfig';
import { useAwxView } from '../../common/useAwxView';
import { getDocsBaseUrl } from '../../common/util/getDocsBaseUrl';
import { AwxHost } from '../../interfaces/AwxHost';
import { useHostsToolbarActions } from './hooks/useHostsToolbarActions';
import { useHostsActions } from './hooks/useHostsActions';
import { useHostsColumns } from './hooks/useHostsColumns';

export function Hosts() {
  const { t } = useTranslation();
  const product: string = process.env.PRODUCT ?? t('AWX');
  const pageNavigate = usePageNavigate();
  const toolbarFilters = useHostsFilters();
  const tableColumns = useHostsColumns();
  const view = useAwxView<AwxHost>({ url: awxAPI`/hosts/`, toolbarFilters, tableColumns });
  const config = useAwxConfig();

  const toolbarActions = useHostsToolbarActions(view);

  const rowActions = useHostsActions(view);

  return (
    <PageLayout>
      <PageHeader
        title={t('Hosts')}
        description={t(
          `A system managed by {{product}}, which may include a physical, virtual, cloud-based server, or other device.`,
          { product }
        )}
        titleHelpTitle={t('Host')}
        titleHelp={[
          t(
            `A system managed by {{product}}, which may include a physical, virtual, cloud-based server, or other device. Typically an operating system instance. Hosts are contained in Inventory. Sometimes referred to as a “node”.`,
            { product }
          ),
          t(
            'Ansible works against multiple managed nodes or “hosts” in your infrastructure at the same time, using a list or group of lists known as inventory. Once your inventory is defined, you use patterns to select the hosts or groups you want Ansible to run against.'
          ),
        ]}
        titleDocLink={`${getDocsBaseUrl(config)}/html/userguide/hosts.html`}
      />
      <PageTable<AwxHost>
        id="awx-hosts-table"
        toolbarFilters={toolbarFilters}
        toolbarActions={toolbarActions}
        tableColumns={tableColumns}
        rowActions={rowActions}
        errorStateTitle={t('Error loading hosts')}
        emptyStateTitle={t('No hosts yet')}
        emptyStateDescription={t('To get started, create an host.')}
        emptyStateButtonText={t('Create host')}
        emptyStateButtonClick={() => pageNavigate(AwxRoute.CreateHost)}
        {...view}
        defaultSubtitle={t('Host')}
      />
    </PageLayout>
  );
}
