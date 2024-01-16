import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useOutletContext } from 'react-router-dom';
import { CopyCell, ITableColumn, PageTable } from '../../../../framework';
import { pulpAPI } from '../../common/api/formatPath';
import { getRepoURL } from '../../common/api/hub-api-utils';
import { useHubView } from '../../common/useHubView';
import { CollectionVersionSearch } from '../Collection';
import { PageSection } from '@patternfly/react-core';
import { Scrollable } from '../../../../framework';

export function CollectionDistributions() {
  const { t } = useTranslation();
  const { collection } = useOutletContext<{ collection: CollectionVersionSearch }>();

  const tableColumns = useDistributionsColumns();

  const view = useHubView<Distribution>({
    url: pulpAPI`/distributions/ansible/ansible/`,
    keyFn: (item) => item.base_path,
    tableColumns,
    queryParams: { repository: collection.repository?.pulp_href || '' },
  });

  return (
    <Scrollable>
      <PageSection variant="light">
        <PageTable<Distribution>
          id="hub-collection-version-search-table"
          tableColumns={tableColumns}
          errorStateTitle={t('Error loading distributions')}
          emptyStateTitle={t('No distributions yet')}
          {...view}
          defaultTableView="list"
          defaultSubtitle={t('Distributions')}
        />
      </PageSection>
    </Scrollable>
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
