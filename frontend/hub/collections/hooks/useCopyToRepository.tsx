import { CollectionVersionSearch } from '../Collection';
import { ITableColumn, IToolbarFilter, usePageDialog, ISelected } from './../../../../framework';
import { Button, Modal, ModalVariant } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import {
  useRepositoryColumns,
  useRepositoryFilters,
} from './../../repositories/hooks/useRepositorySelector';
import { PageTable } from './../../../../framework/PageTable/PageTable';
import { usePulpView } from '../../usePulpView';
import { AnsibleAnsibleRepositoryResponse as Repository } from './../../api-schemas/generated/AnsibleAnsibleRepositoryResponse';
import { pulpAPI, hubAPI } from '../../api/utils';
import { useGet } from './../../../common/crud/useGet';
import { HubItemsResponse } from '../../useHubView';

export function useCopyToRepository() {
  const [_, setDialog] = usePageDialog();
  const { t } = useTranslation();
  const [repositories, setRepositories] = useState<Repository[]>([]);

  return (collection: CollectionVersionSearch) => {
    setDialog(
      <Modal
        title={t(`Select repositories`)}
        aria-label={t(`Select repositories`)}
        isOpen
        onClose={() => {}}
        variant={ModalVariant.large}
        tabIndex={0}
        actions={[
          <Button key="select" variant="primary" id="select" onClick={() => {}}>
            {t('Select')}
          </Button>,
          <Button key="cancel" variant="link" onClick={() => {}}></Button>,
        ]}
        hasNoBodyWrapper
      >
        <CopyToRepositoryTable
          collection={collection}
          selectedItems={(items) => {
            setRepositories(items);
          }}
        />
      </Modal>
    );
  };
}

function CopyToRepositoryTable(props: {
  collection: CollectionVersionSearch;
  selectedItems: (repositories: Repository[]) => void;
}) {
  const toolbarFilters = useRepositoryFilters();
  const tableColumns = useRepositoryColumns();
  const { t } = useTranslation();
  const { collection } = props;

  const view = usePulpView({
    url: pulpAPI`/repositories/ansible/ansible/`,
    toolbarFilters,
    tableColumns,
    disableQueryString: true,
    keyFn: (item) => item.name,
  });

  const collectionVersions = useGet<
    HubItemsResponse<CollectionVersionSearch>
  >(hubAPI`/v3/plugin/ansible/search/collection-versions?name=${
    collection.collection_version?.name || ''
  }
    &&version=${collection.collection_version?.version || ''}`);

  return (
    <PageTable<Repository>
      id="hub-collection-version-search-table"
      toolbarFilters={toolbarFilters}
      tableColumns={tableColumns}
      errorStateTitle={t('Error loading collections')}
      emptyStateTitle={t('No collections yet')}
      emptyStateDescription={t('To get started, upload a collection.')}
      emptyStateButtonText={t('Upload collection')}
      {...view}
      defaultTableView="list"
      defaultSubtitle={t('Repository')}
    />
  );
}
