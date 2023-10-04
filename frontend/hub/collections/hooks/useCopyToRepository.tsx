import { CollectionVersionSearch } from '../Collection';
import { usePageDialog } from './../../../../framework';
import { Button, Modal, ModalVariant } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { useState, useEffect, Dispatch, SetStateAction, useRef } from 'react';
import {
  useRepositoryColumns,
  useRepositoryFilters,
} from './../../repositories/hooks/useRepositorySelector';
import { PageTable } from './../../../../framework/PageTable/PageTable';
import { usePulpView } from '../../usePulpView';
import { AnsibleAnsibleRepositoryResponse } from './../../api-schemas/generated/AnsibleAnsibleRepositoryResponse';
import { pulpAPI, hubAPI } from '../../api/utils';
import { useGetRequest } from './../../../common/crud/useGet';
import { HubItemsResponse } from '../../useHubView';
import { PulpItemsResponse } from '../../usePulpView';
import { parsePulpIDFromURL } from '../../api/utils';
import { useHubContext } from './../../useHubContext';
import { SigningServiceResponse } from '../../api-schemas/generated/SigningServiceResponse';

export function useCopyToRepository() {
  const [_, setDialog] = usePageDialog();
  const { t } = useTranslation();
  const  onClick  = useRef<boolean>(false);


  if (onClick.current == true)
  {
    debugger;
    onClick.current = false;
  }

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
          <Button key="select" variant="primary" id="select" onClick={() => {debugger; onClick.current = true;}}>
            {t('Select')}
          </Button>,
          <Button key="cancel" variant="link" onClick={() => {}}></Button>,
        ]}
        hasNoBodyWrapper
      >
        <CopyToRepositoryTable
          collection={collection}
          onClick={onClick.current}
        />
      </Modal>
    );
  };
}

function CopyToRepositoryTable(props: {
  collection: CollectionVersionSearch;
  onClick : boolean;
}) {
  const toolbarFilters = useRepositoryFilters();
  const tableColumns = useRepositoryColumns();
  const { t } = useTranslation();
  const { collection } = props;
  const request = useGetRequest<HubItemsResponse<CollectionVersionSearch>>();
  const pulpRequest = useGetRequest<PulpItemsResponse<SigningServiceResponse>>();
  const context = useHubContext();

  const [selectedRepositories, setSelectedRepositories] = useState<Repository[]>([]);

  const [fixedRepositories, setFixedRepositories] = useState<Repository[]>([]);

  const copyToRepositories = () => {
    try{
      void (async () => {
        const { collection_version, repository } = props.collection;
        if (!repository) {
          return;
        }

        const pulpId = parsePulpIDFromURL(repository?.pulp_href);

        const signingServiceName = context.settings.GALAXY_COLLECTION_SIGNING_SERVICE;

        const signingService = await pulpRequest(pulpAPI`signing-services/?name=${signingServiceName}`);

        /* let signingService = null;
        try {
          const signingList = await SigningServiceAPI.list({
            name: signingServiceName,
          });
          signingService = signingList.data.results[0].pulp_href;
        } catch {
          setLoading(false);
          props.addAlert({
            title: t`Failed to copy collection version.`,
            variant: 'danger',
            description: t`Signing service ${signingServiceName} not found`,
          });
          return;
        }

        const repoHrefs = repositoryList
          .filter((repo) => selectedRepos.includes(repo.name))
          .map((repo) => repo.pulp_href);

        Repositories.copyCollectionVersion(
          pulpId,
          [collection_version.pulp_href],
          repoHrefs,
          signingService,
        )
          .then(({ data }) => {
            selectedRepos.map((repo) => {
              props.addAlert(
                taskAlert(
                  data.task,
                  t`Started adding ${collection_version.namespace}.${collection_version.name} v${collection_version.version} from "${repository.name}" to repository "${repo}".`,
                ),
              );
            });
          })
          .catch((e) => {
          
          });*/
      })();
    }catch(error)
    {
      
    }
    }


    useEffect(() => {
      debugger;
      if (props.onClick == true)
      {
        copyToRepositories();
      }

    }, [props.onClick]);

    useEffect(() => {
      async function getSelected() {
        const repos = await request(
          hubAPI`/v3/plugin/ansible/search/collection-versions?name=${
            collection.collection_version?.name || ''
          } &&version=${collection.collection_version?.version || ''}`
        );

        if (repos.data?.length > 0) {
          const reposMapped = repos.data.map((item) => item.repository || ({} as Repository));
          setSelectedRepositories(reposMapped);
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
      isSelectionDisabled={(item) =>
        fixedRepositories.find((i) => i.name == item.name) ? true : false
      }
      selectItem={(item) => {
        const newItems = [...selectedRepositories, item];
        setSelectedRepositories(newItems);
      }}
      selectItems={(items) => {
        let newItems = [...selectedRepositories];
        for (const item of items) {
          if (!selectedRepositories.find((item2) => item.name == item2.name)) {
            newItems.push(item);
          }
        }

        setSelectedRepositories(newItems);
      }}
      unselectItem={(item) => {
        if (!fixedRepositories.find((item2) => item.name == item2.name)) {
          setSelectedRepositories(selectedRepositories.filter((item2) => item2.name != item.name));
        }
      }}
      unselectAll={() => {
        setSelectedRepositories(fixedRepositories);
      }}
    />
  );
}

interface Repository {
  name: string;
  pulp_href: string;
}
