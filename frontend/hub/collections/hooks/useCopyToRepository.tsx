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
import { useHubView } from '../../useHubView';
import { AnsibleAnsibleRepositoryResponse } from './../../api-schemas/generated/AnsibleAnsibleRepositoryResponse';
import { hubAPIPost } from '../../api/utils';
import { useGetRequest } from './../../../common/crud/useGet';
import { HubItemsResponse } from '../../useHubView';
import { PulpItemsResponse } from '../../useHubView';
import { parsePulpIDFromURL } from '../../api/utils';
import { useHubContext, HubContext } from './../../useHubContext';
import { SigningServiceResponse } from '../../api-schemas/generated/SigningServiceResponse';
import { HubError } from '../../common/HubError';
import { hubAPI, pulpAPI } from '../../api/formatPath';

export function useCopyToRepository() {
  const [_, setDialog] = usePageDialog();
  const onClose = useCallback(() => setDialog(undefined), [setDialog]);
  const context = useHubContext();

  return (collection: CollectionVersionSearch, operation: 'approve' | 'copy') => {
    setDialog(
      <CopyToRepositoryModal
        collection={collection}
        onClose={onClose}
        context={context}
        operation={operation}
      />
    );
  };
}

function CopyToRepositoryModal(props: {
  collection: CollectionVersionSearch;
  onClose: () => void;
  context: HubContext;
  operation: 'approve' | 'copy';
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
  const [error, setError] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  const operation = props.operation;

  const copyToRepositories = async () => {
    try {
      setIsLoading(true);

      await copyToRepositoryAction(
        collection,
        operation,
        selectedRepositories,
        props.context,
        pulpRequest
      );

      setIsLoading(false);
      props.onClose();
    } catch (error) {
      setError(
        operation === 'approve' ? t('Can not approve collection.') : t('Can not copy collection')
      );
      setIsLoading(false);
    }
  };

  useEffect(() => {
    async function getSelected() {
      const repos = await request(
        hubAPI`/v3/plugin/ansible/search/collection-versions?limit=100&name=${
          collection.collection_version?.name || ''
        }&version=${collection.collection_version?.version || ''}`
      );

      if (repos.data?.length > 0) {
        const reposMapped = repos.data.map((item) => item.repository || ({} as Repository));
        setFixedRepositories(reposMapped);
      }

      if (repos.meta.count > 100) {
        setMessage(
          t(
            'Warning - the collection is already in more than 100 repositories, not all repositories will be preselected.'
          )
        );
      }
    }

    void (async () => {
      await getSelected();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  let queryParams = undefined;
  if (operation === 'approve') {
    queryParams = { pulp_label_select: 'pipeline=approved' };
  }

  const view = useHubView({
    url: pulpAPI`/repositories/ansible/ansible/`,
    toolbarFilters,
    tableColumns,
    disableQueryString: true,
    keyFn: (item) => item.name,
    queryParams,
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
            void copyToRepositories();
          }}
          isDisabled={selectedRepositories.length === 0}
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
      {message}
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
          selectedRepositories.find((i) => i.name === item.name) ||
          fixedRepositories.find((i) => i.name === item.name)
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
            if (
              !selectedRepositories.find((item2) => item.name === item2.name) &&
              !fixedRepositories.find((item2) => item2.name === item.name)
            ) {
              newItems.push(item);
            }
          }
          setSelectedRepositories(newItems);
        }}
        unselectItem={(item) => {
          setSelectedRepositories(selectedRepositories.filter((item2) => item2.name !== item.name));
        }}
        unselectAll={() => {
          setSelectedRepositories([]);
        }}
      />
      {error && <HubError error={{ name: t('Error'), message: error }}></HubError>}
    </Modal>
  );
}

interface Repository {
  name: string;
  pulp_href: string;
}

export async function copyToRepositoryAction(
  collection: CollectionVersionSearch,
  operation: 'approve' | 'copy',
  selectedRepositories: Repository[],
  context: HubContext,
  pulpRequest: ReturnType<typeof useGetRequest<PulpItemsResponse<SigningServiceResponse>>>
) {
  const { repository } = collection;
  if (!repository) {
    return;
  }

  const pulpId = parsePulpIDFromURL(repository?.pulp_href);

  const { collection_auto_sign, require_upload_signatures } = context.featureFlags;
  const autoSign = collection_auto_sign && !require_upload_signatures;

  let signingService = '';

  const signingServiceName = context?.settings?.GALAXY_COLLECTION_SIGNING_SERVICE;
  if (((operation === 'approve' && autoSign) || operation === 'copy') && signingServiceName) {
    const url = pulpAPI`/signing-services/?name=${signingServiceName}`;
    const signingServiceList = await pulpRequest(url);
    signingService = signingServiceList?.results?.[0].pulp_href;
  }

  const repoHrefs: string[] = [];

  for (const repo of selectedRepositories) {
    repoHrefs.push(repo.pulp_href);
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

  const api_op = {
    approve: 'move_collection_version',
    copy: 'copy_collection_version',
  }[operation];

  await hubAPIPost(pulpAPI`/repositories/ansible/ansible/${pulpId || ''}/${api_op}/`, params);
}
