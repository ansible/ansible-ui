import { CollectionVersionSearch } from '../Collection';
import { ITableColumn, IToolbarFilter, usePageDialog, ISelected } from './../../../../framework';
import { Button, Modal, ModalVariant } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { useState, useEffect, Dispatch, SetStateAction } from 'react';
import {
  useRepositoryColumns,
  useRepositoryFilters,
} from './../../repositories/hooks/useRepositorySelector';
import { PageTable } from './../../../../framework/PageTable/PageTable';
import { usePulpView } from '../../usePulpView';
import { RepositoryResponse } from './../../api-schemas/generated/RepositoryResponse';
import { AnsibleAnsibleRepositoryResponse } from './../../api-schemas/generated/AnsibleAnsibleRepositoryResponse';
import { pulpAPI, hubAPI } from '../../api/utils';
import { useGetRequest } from './../../../common/crud/useGet';
import { HubItemsResponse } from '../../useHubView';

export function useCopyToRepository() {
  const [_, setDialog] = usePageDialog();
  const { t } = useTranslation();

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
        <CopyToRepositoryTable collection={collection} />
      </Modal>
    );
  };
}

function CopyToRepositoryTable(props: { collection: CollectionVersionSearch }) {
  const toolbarFilters = useRepositoryFilters();
  const tableColumns = useRepositoryColumns();
  const { t } = useTranslation();
  const { collection } = props;
  const request = useGetRequest<HubItemsResponse<CollectionVersionSearch>>();

  const [selectedRepositories, setSelectedRepositories] = useState<RepositoryResponse[]>([]);

  const [fixedRepositories, setFixedRepositories] = useState<RepositoryResponse[]>([]);

  async function getSelected() {
    const repos = await request(
      hubAPI`/v3/plugin/ansible/search/collection-versions?name=${
        collection.collection_version?.name || ''
      } &&version=${collection.collection_version?.version || ''}`
    );

    if (repos.data?.length > 0) {
      const reposMapped = repos.data.map((item) => item.repository || ({} as RepositoryResponse));
      setSelectedRepositories(reposMapped);
      setFixedRepositories(reposMapped);
    }
  }

  useEffect(() => {
    getSelected();
  }, []);

  const view = usePulpView({
    url: pulpAPI`/repositories/ansible/ansible/`,
    toolbarFilters,
    tableColumns,
    disableQueryString: true,
    keyFn: (item) => item.name,
  });

  return (
    <PageTable<AnsibleAnsibleRepositoryResponse>
      id="hub-copy-to-repository-table"
      toolbarFilters={toolbarFilters}
      tableColumns={tableColumns}
      errorStateTitle={t('Error loading collections')}
      emptyStateTitle={t('No collections yet')}
      emptyStateDescription={t('To get started, upload a collection.')}
      emptyStateButtonText={t('Upload collection')}
      {...view}
      defaultTableView="list"
      defaultSubtitle={t('Repository')}
      showSelect={true}
      compact={true}
      isSelectMultiple={true}
      isSelected={(item) => (selectedRepositories.find((i) => i.name == item.name) ? true : false)}
    />
  );
}
