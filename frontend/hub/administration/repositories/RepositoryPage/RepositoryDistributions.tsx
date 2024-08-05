import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useOutletContext } from 'react-router-dom';
import { CopyCell, ITableColumn, PageTable } from '../../../../../framework';
import { pulpAPI } from '../../../common/api/formatPath';
import { useHubView } from '../../../common/useHubView';
import { Repository } from '../Repository';
import { PlusCircleIcon } from '@patternfly/react-icons';
import { Distribution } from '../../../collections/UploadCollection';
import { useRepositoryDistributionFilters } from '../hooks/useRepositoryDistributionFilters';

export function RepositoryDistributions() {
  const { t } = useTranslation();
  const { repository } = useOutletContext<{ repository: Repository }>();
  const toolbarFilters = useRepositoryDistributionFilters();

  const view = useHubView<Distribution>({
    url: pulpAPI`/distributions/ansible/ansible/`,
    keyFn: (distro) => distro.name,
    defaultSort: 'name',
    toolbarFilters: toolbarFilters,
    queryParams: { repository: repository.pulp_href },
  });

  const tableColumns = useRepositoryDistributionColumns();

  return (
    <PageTable<Distribution>
      id="hub-repository-distributions-table"
      tableColumns={tableColumns}
      errorStateTitle={t('No distributions')}
      emptyStateTitle={t('No distributions yet')}
      emptyStateDescription={t('You can edit this repository to create a distribution.')}
      emptyStateButtonIcon={<PlusCircleIcon />}
      {...view}
      defaultTableView="table"
      defaultSubtitle={t('Distribution')}
      toolbarFilters={toolbarFilters}
    />
  );
}

export function useRepositoryDistributionColumns() {
  const { t } = useTranslation();

  return useMemo<ITableColumn<Distribution>[]>(
    () => [
      {
        header: t('Name'),
        type: 'text',
        value: (distribution: Distribution) => distribution.name,
        sort: 'name',
      },
      {
        header: t('Base path'),
        type: 'text',
        value: (distribution: Distribution) => distribution.base_path,
        sort: 'base_path',
      },
      {
        header: t('Created'),
        type: 'datetime',
        value: (distribution: Distribution) => distribution.pulp_created,
        sort: 'pulp_created',
      },
      {
        header: t('CLI configuration'),
        cell: (distribution: Distribution) => {
          const copyText = `[galaxy] \n server_list = ${distribution.base_path} \n [galaxy_server.${distribution.base_path}] \n url = ${distribution.client_url} \n token=<put your token here>`;
          return <CopyCell text={copyText} />;
        },
      },
    ],
    [t]
  );
}
