import { CollectionVersionSearch } from '../Collection';
import { usePageDialog } from './../../../../framework';
import { Button, Modal, ModalVariant } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { useState, useEffect, useCallback } from 'react';
import {
  useRepositoryColumns,
  useRepositoryFilters,
} from './../../repositories/hooks/useRepositorySelector';
import { PageTable } from './../../../../framework/PageTable/PageTable';
import { usePulpView } from '../../usePulpView';
import { AnsibleAnsibleRepositoryResponse } from './../../api-schemas/generated/AnsibleAnsibleRepositoryResponse';
import { pulpAPI, hubAPI, hubAPIPost } from '../../api/utils';
import { useGetRequest } from './../../../common/crud/useGet';
import { HubItemsResponse } from '../../useHubView';
import { PulpItemsResponse } from '../../usePulpView';
import { parsePulpIDFromURL } from '../../api/utils';
import { useHubContext, HubContext } from './../../useHubContext';
import { SigningServiceResponse } from '../../api-schemas/generated/SigningServiceResponse';

export function useCopyToRepository() {
  const [_, setDialog] = usePageDialog();

  const context = useHubContext();
  const onClose = useCallback(() => setDialog(undefined), [setDialog]);

  return (collection: CollectionVersionSearch) => {
    setDialog(
      <CopyToRepositoryModal collection={collection} context={context} onClose={onClose} />
    );
  };
}

function CopyToRepositoryModal(props: {
  collection: CollectionVersionSearch;
  context: HubContext;
  onClose: () => void;
}) {
  const toolbarFilters = useRepositoryFilters();
  const tableColumns = useRepositoryColumns();
  const { t } = useTranslation();
  const { collection } = props;
  const request = useGetRequest<HubItemsResponse<CollectionVersionSearch>>();
  const pulpRequest = useGetRequest<PulpItemsResponse<SigningServiceResponse>>();
  const [selectedRepositories, setSelectedRepositories] = useState<Repository[]>([]);

  const [fixedRepositories, setFixedRepositories] = useState<Repository[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const copyToRepositories = () => {
    setIsLoading(true);
    try {
      void (async () => {
        const { repository } = props.collection;
        if (!repository) {
          return;
        }

        const pulpId = parsePulpIDFromURL(repository?.pulp_href);

        const signingServiceName = props.context.settings.GALAXY_COLLECTION_SIGNING_SERVICE;

        const url = pulpAPI`/signing-services/?name=${signingServiceName}`;
        const signingServiceList = await pulpRequest(url);

        const signingService = signingServiceList?.results?.[0].pulp_href;

        const repoHrefs: string[] = [];

        for (const repo of selectedRepositories) {
          if (!fixedRepositories.find((item) => item.name == repo.name)) {
            repoHrefs.push(repo.pulp_href);
          }
        }

        const params: {
          collection_versions: string[];
          destination_repositories: string[];
          signing_service?: string;
        } = {
          collection_versions: collection.collection_version?.pulp_href
            ? [collection.collection_version?.pulp_href]
            : [],
          destination_repositories: repoHrefs,
        };

        if (signingService) {
          params.signing_service = signingService;
        }

        await hubAPIPost(
          pulpAPI`/repositories/ansible/ansible/${pulpId || ''}/copy_collection_version/`,
          params
        );

        setIsLoading(false);
        props.onClose();
      })();
    } catch (error) {
      // TODO
      setIsLoading(false);
    }
  };

  useEffect(() => {
    async function getSelected() {
      const repos = await request(
        hubAPI`/v3/plugin/ansible/search/collection-versions?limit=100000&name=${
          collection.collection_version?.name || ''
        } &&version=${collection.collection_version?.version || ''}`
      );

      if (repos.data?.length > 0) {
        const reposMapped = repos.data.map((item) => item.repository || ({} as Repository));
        setFixedRepositories(reposMapped);
      }
    }

    void (async () => {
      try {
        await getSelected();
      } catch (error) {
        // TODO - error handling
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const view = usePulpView({
    url: pulpAPI`/repositories/ansible/ansible/`,
    toolbarFilters,
    tableColumns,
    disableQueryString: true,
    keyFn: (item) => item.name,
  });

  return (
    <Modal
      title={t(`Select repositories`)}
      aria-label={t(`Select repositories`)}
      isOpen
      onClose={() => {
        props.onClose();
      }}
      variant={ModalVariant.large}
      tabIndex={0}
      actions={[
        <Button
          key="select"
          variant="primary"
          id="select"
          onClick={() => {
            copyToRepositories();
          }}
          isDisabled={selectedRepositories.length == 0}
          isLoading={isLoading}
        >
          {t('Select')}
        </Button>,
        <Button
          key="cancel"
          variant="link"
          onClick={() => {
            props.onClose();
          }}
        >
          {t('Cancel')}
        </Button>,
      ]}
      hasNoBodyWrapper
    >
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
        selectedItems={selectedRepositories as AnsibleAnsibleRepositoryResponse[]}
        isSelectMultiple={true}
        isSelected={(item) =>
          selectedRepositories.find((i) => i.name == item.name) ||
          fixedRepositories.find((i) => i.name == item.name)
            ? true
            : false
        }
        selectItem={(item) => {
          const newItems = [...selectedRepositories, item];
          setSelectedRepositories(newItems);
        }}
        selectItems={(items) => {
          const newItems = [...selectedRepositories];
          for (const item of items) {
            if (!selectedRepositories.find((item2) => item.name == item2.name)) {
              newItems.push(item);
            }
          }

          setSelectedRepositories(newItems);
        }}
        unselectItem={(item) => {
          setSelectedRepositories(selectedRepositories.filter((item2) => item2.name != item.name));
        }}
        unselectAll={() => {
          setSelectedRepositories([]);
        }}
      />
    </Modal>
  );
}

interface Repository {
  name: string;
  pulp_href: string;
}
