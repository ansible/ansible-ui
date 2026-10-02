import { PageHeader, PageLayout, PageTable, useGetPageUrl } from '@ansible/ansible-ui-framework';
import { ButtonLink } from '@ansible/ansible-ui-framework/components/ButtonLink';
import { PageLoadingTable } from '@ansible/ansible-ui-framework/PageTable/PageLoadingTable';
import { PageTableEmptyState } from '@ansible/ansible-ui-framework/PageTable/PageTableEmptyState';
import { useOptions } from '@ansible/common-ui/crud/useOptions';
import { useGetDocsUrl } from '@ansible/common-ui/utils/useGetDocsUrl';
import { ButtonVariant } from '@patternfly/react-core';
import { CubesIcon, PlusCircleIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { ActivityStreamIcon } from '../../common/ActivityStreamIcon';
import { awxAPI } from '../../common/api/awx-utils';
import { useAwxConfig } from '../../common/useAwxConfig';
import { useAwxView } from '../../common/useAwxView';
import { AwxHost } from '../../interfaces/AwxHost';
import { ActionsResponse, OptionsResponse } from '../../interfaces/OptionsResponse';
import { AwxRoute } from '../../main/AwxRoutes';
import { useHostsActions } from './hooks/useHostsActions';
import { useHostsColumns } from './hooks/useHostsColumns';
import { useHostsFilters } from './hooks/useHostsFilters';
import { useHostsToolbarActions } from './hooks/useHostsToolbarActions';

export function Hosts() {
  const { t } = useTranslation();
  const product: string = process.env.PRODUCT ?? t('Automation controller');
  const getPageUrl = useGetPageUrl();
  const toolbarFilters = useHostsFilters();
  const tableColumns = useHostsColumns();
  const view = useAwxView<AwxHost>({ url: awxAPI`/hosts/`, toolbarFilters, tableColumns });
  const config = useAwxConfig();

  const toolbarActions = useHostsToolbarActions(view);

  const rowActions = useHostsActions(view.unselectItemsAndRefresh, view.updateItem);

  const { data, isLoading: isLoadingHostOptions } = useOptions<OptionsResponse<ActionsResponse>>(
    awxAPI`/hosts/`
  );
  const canCreateHost = Boolean(data?.actions?.['POST']);

  return (
    <PageLayout>
      <PageHeader
        title={t('Hosts')}
        description={t(
          `A system managed by {{product}} that may include a physical, virtual, or cloud-based server, or another device.`,
          { product }
        )}
        titleHelpTitle={t('Hosts')}
        titleHelp={[
          t(
            `A system managed by {{product}} that may include a physical, virtual, or cloud-based server, or another device. Typically an operating system instance. Hosts are contained in Inventory. Sometimes referred to as a “node”.`,
            { product }
          ),
          t(
            'Ansible works against multiple managed nodes or “hosts” in your infrastructure at the same time, using a list or group of lists known as inventory. Once your inventory is defined, you use patterns to select the hosts or groups you want Ansible to run against.'
          ),
        ]}
        titleDocLink={useGetDocsUrl(config, 'hosts')}
        headerActions={<ActivityStreamIcon type={'host'} />}
      />
      {isLoadingHostOptions ? (
        <PageLoadingTable />
      ) : (
        <PageTable<AwxHost>
          id="awx-hosts-table"
          toolbarFilters={toolbarFilters}
          toolbarActions={toolbarActions}
          tableColumns={tableColumns}
          rowActions={rowActions}
          errorStateTitle={t('Error loading hosts')}
          emptyState={
            canCreateHost ? (
              <PageTableEmptyState
                title={t('There are currently no hosts.')}
                description={t('Create a host to populate this list.')}
              >
                <ButtonLink
                  icon={<PlusCircleIcon />}
                  variant={ButtonVariant.primary}
                  href={getPageUrl(AwxRoute.CreateHost)}
                  data-cy="create-host"
                  data-testid="create-host"
                >
                  {t('Create host')}
                </ButtonLink>
              </PageTableEmptyState>
            ) : (
              <PageTableEmptyState
                icon={CubesIcon}
                title={t('You do not have permission to create a host.')}
                description={t(
                  'Please contact your organization administrator if there is an issue with your access.'
                )}
              />
            )
          }
          {...view}
          defaultSubtitle={t('Host')}
        />
      )}
    </PageLayout>
  );
}
