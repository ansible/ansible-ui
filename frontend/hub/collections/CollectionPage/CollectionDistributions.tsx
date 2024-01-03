import { useTranslation } from 'react-i18next';
import { useOutletContext } from 'react-router-dom';
import { CollectionVersionSearch } from '../Collection';
import { usePulpView } from '../../usePulpView';
import { pulpAPI } from '../../api/formatPath';
import { useMemo } from 'react';
import { ITableColumn } from '../../../../framework';
import { PageTable } from '../../../../framework';
import { CopyCell } from '../../../../framework';
import { getRepoURL } from '../../api/utils';

export function CollectionDistributions() {
  const { t } = useTranslation();
  const { collection } = useOutletContext<{ collection: CollectionVersionSearch }>();

  const tableColumns = useDistributionsColumns();

  const view = usePulpView<Distribution>({
    url: pulpAPI`/distributions/ansible/ansible/`,
    keyFn: (item) => item.base_path,
    tableColumns,
    queryParams: { repository: collection.repository?.pulp_href || '' },
  });

  return (
    <>
      <PageTable<Distribution>
        id="hub-collection-version-search-table"
        tableColumns={tableColumns}
        errorStateTitle={t('Error loading distributions')}
        emptyStateTitle={t('No distributions yet')}
        {...view}
        defaultTableView="list"
        defaultSubtitle={t('Distributions')}
      />
    </>
  );
}

interface Distribution {
  name: string;
  pulp_href: string;
  base_path: string;
  pulp_created: string;
}

function useDistributionsColumns(_options?: { disableSort?: boolean; disableLinks?: boolean }) {
  const { t } = useTranslation();

  return useMemo<ITableColumn<Distribution>[]>(
    () => [
      {
        header: t('Name'),
        type: 'text',
        value: (item) => item.name,
        sort: 'name',
      },
      {
        header: t('Base path'),
        type: 'text',
        value: (item) => item.base_path,
        sort: 'base_path',
      },
      {
        header: t('Created'),
        type: 'datetime',
        value: (item) => item.pulp_created,
        sort: 'pulp_created',
      },
      {
        header: t('CLI configuration'),
        cell: (item) => {
          const copyText = [
            '[galaxy]',
            `server_list = ${item.base_path}`,
            '',
            `[galaxy_server.${item.base_path}]`,
            `url=${getRepoURL(item.base_path)}`,
            'token=<put your token here>',
          ].join('\n');
          return <CopyCell text={copyText} />;
        },
      },
    ],
    [t]
  );
}
