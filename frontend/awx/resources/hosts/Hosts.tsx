import { useTranslation } from 'react-i18next';
import { PageHeader, PageLayout, PageTable, usePageNavigate } from '../../../../framework';
import { AwxRoute } from '../../main/AwxRoutes';
import { awxAPI } from '../../common/api/awx-utils';
import { useHostsFilters } from './hooks/useHostsFilters';
import { useAwxConfig } from '../../common/useAwxConfig';
import { useAwxView } from '../../common/useAwxView';
import { useGetDocsUrl } from '../../common/util/useGetDocsUrl';
import { AwxHost } from '../../interfaces/AwxHost';
import { useHostsToolbarActions } from './hooks/useHostsToolbarActions';
import { useHostsColumns } from './hooks/useHostsColumns';
import { ActivityStreamIcon } from '../../common/ActivityStreamIcon';
import { useHostsActions } from './hooks/useHostsActions';
import { useOptions } from '../../../common/crud/useOptions';
import { OptionsResponse, ActionsResponse } from '../../interfaces/OptionsResponse';
import { PlusCircleIcon } from '@patternfly/react-icons';

export function Hosts() {
  const { t } = useTranslation();
  const product: string = process.env.PRODUCT ?? t('AWX');
  const pageNavigate = usePageNavigate();
  const toolbarFilters = useHostsFilters();
  const tableColumns = useHostsColumns();
  const view = useAwxView<AwxHost>({ url: awxAPI`/hosts/`, toolbarFilters, tableColumns });
  const config = useAwxConfig();

  const toolbarActions = useHostsToolbarActions(view);

  const rowActions = useHostsActions(view.unselectItemsAndRefresh, view.updateItem);

  const { data } = useOptions<OptionsResponse<ActionsResponse>>(awxAPI`/hosts/`);
  const canCreateHost = Boolean(data && data.actions && data.actions['POST']);

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
        titleDocLink={useGetDocsUrl(config, 'hosts')}
        headerActions={<ActivityStreamIcon type={'host'} />}
      />
      <PageTable<AwxHost>
        id="awx-hosts-table"
        toolbarFilters={toolbarFilters}
        toolbarActions={toolbarActions}
        tableColumns={tableColumns}
        rowActions={rowActions}
        errorStateTitle={t('Error loading hosts')}
        emptyStateTitle={
          canCreateHost
            ? t('There are currently no hosts added')
            : t('You do not have permission to create a host.')
        }
        emptyStateDescription={
          canCreateHost
            ? t('Please create a host by using the button below.')
            : t(
                'Please contact your organization administrator if there is an issue with your access.'
              )
        }
        emptyStateButtonIcon={<PlusCircleIcon />}
        emptyStateButtonText={canCreateHost ? t('Create host') : undefined}
        emptyStateButtonClick={canCreateHost ? () => pageNavigate(AwxRoute.CreateHost) : undefined}
        {...view}
        defaultSubtitle={t('Host')}
      />
    </PageLayout>
  );
}
