import { Label } from '@patternfly/react-core';
import { LoadingPage } from '../../../../framework';
import React from 'react';
import { DropdownPosition } from '@patternfly/react-core/dist/esm/deprecated';
import { CheckCircleIcon, ExclamationTriangleIcon } from '@patternfly/react-icons';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { PageActions, PageHeader, PageLayout, useGetPageUrl } from '../../../../framework';
import { HubError } from '../../common/HubError';
import { useGet } from '../../../common/crud/useGet';
import { HubRoute } from '../../HubRoutes';
import { hubAPI } from '../../api/formatPath';
import { HubItemsResponse } from '../../useHubView';
import { PageSingleSelect } from '../../../../framework/PageInputs/PageSingleSelect';
import { CollectionVersionSearch } from '../Collection';
import { useCollectionActions } from '../hooks/useCollectionActions';
import { usePageNavigate } from '../../../../framework';
import { PageRoutedTabs } from '../../../../framework/PageTabs/PageRoutedTabs';
import { useParams } from 'react-router-dom';

export function CollectionPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { name, namespace, repository, version } = useParams();

  const redirectIfEmpty = searchParams.get('redirectIfEmpty') || '';

  const collectionsRequest = useGet<HubItemsResponse<CollectionVersionSearch>>(
    hubAPI`/v3/plugin/ansible/search/collection-versions/?name=${name || ''}&namespace=${
      namespace || ''
    }&repository_name=${repository || ''}&order_by=-version`
  );

  const collections = collectionsRequest.data?.data;

  let queryFilter = '';

  if (!version) {
    // for unspecified version, load highest
    queryFilter = '&is_highest=true';
  } else {
    queryFilter = '&version=' + version;
  }

  const collectionRequest = useGet<HubItemsResponse<CollectionVersionSearch>>(
    hubAPI`/v3/plugin/ansible/search/collection-versions/?name=${name || ''}&namespace=${
      namespace || ''
    }&repository_name=${repository || ''}` + queryFilter
  );

  const collection =
    collectionRequest?.data?.data && collectionRequest?.data?.data?.length > 0
      ? collectionRequest.data?.data[0]
      : undefined;

  const itemActions = useCollectionActions(() => void collectionRequest.refresh(), true);
  const navigate = usePageNavigate();

  function setVersionParams(version: string) {
    setSearchParams((params) => {
      params.set('version', version);
      return params;
    });
  }

  const getPageUrl = useGetPageUrl();

  if (redirectIfEmpty) {
    const newParams = new URLSearchParams(searchParams.toString());

    // Set a new query parameter or update existing ones
    newParams.set('redirectIfEmpty', '');

    if (collections && collections?.length === 0) {
      navigate(HubRoute.Collections);
    } else {
      navigate(HubRoute.CollectionPage, { query: { name, namespace, repository } });
    }
  }

  if (collectionsRequest.error || collections?.length === 0) {
    return <HubError error={collectionsRequest.error} handleRefresh={collectionsRequest.refresh} />;
  }

  if (collectionsRequest.error || collectionRequest.data?.data?.length === 0) {
    return <HubError error={collectionRequest.error} handleRefresh={collectionRequest.refresh} />;
  }

  if (!collectionsRequest.data || !collectionRequest.data) {
    return <LoadingPage breadcrumbs tabs />;
  }

  return (
    <PageLayout>
      <PageHeader
        title={collection?.collection_version?.name}
        breadcrumbs={[
          { label: t('Collections'), to: getPageUrl(HubRoute.Collections) },
          { label: collection?.collection_version?.name },
        ]}
        headerActions={
          collection && (
            <PageActions<CollectionVersionSearch>
              actions={itemActions}
              position={DropdownPosition.right}
              selectedItem={collection}
            />
          )
        }
        description={t('Repository: ') + collection?.repository?.name}
        footer={
          <div style={{ display: 'flex', alignItems: 'center', gridGap: '8px' }}>
            {t('Version')}
            <PageSingleSelect<string>
              options={
                collections
                  ? collections.map((item) => {
                      let label =
                        item.collection_version?.version +
                        ' ' +
                        t('updated') +
                        ' ' +
                        `${DateTime.fromISO(
                          item.collection_version?.pulp_created || ''
                        ).toRelative()} (${item.is_signed ? t('signed') : t('unsigned')})`;
                      if (item.is_highest) {
                        label += ' (' + t('latest') + ')';
                      }
                      return {
                        value: item.collection_version?.version || '',
                        label,
                      };
                    })
                  : []
              }
              onSelect={(item: string) => {
                const found = collections?.find(
                  (item2) => item2.collection_version?.version === item
                );
                if (found && found.collection_version) {
                  setVersionParams(found.collection_version?.version);
                }
              }}
              placeholder={''}
              value={collection?.collection_version?.version || ''}
            />
            {collection?.collection_version &&
              t('Last updated') +
                ' ' +
                DateTime.fromISO(collection.collection_version?.pulp_created).toRelative()}
            {collection &&
              (collection.is_signed ? (
                <Label icon={<CheckCircleIcon />} variant="outline" color="green">
                  {' ' + t('Signed')}
                </Label>
              ) : (
                <Label icon={<ExclamationTriangleIcon />} variant="outline" color="orange">
                  {' ' + t('Unsigned')}
                </Label>
              ))}
          </div>
        }
      />

      <PageRoutedTabs
        backTab={{
          label: t('Back to Collections'),
          page: HubRoute.Collections,
          persistentFilterKey: 'name', // TODO add correct filters
        }}
        tabs={[
          { label: t('Details'), page: HubRoute.CollectionDetails },
          { label: t('Install'), page: HubRoute.CollectionInstall },
          { label: t('Documentation'), page: HubRoute.CollectionDocumentation },
          { label: t('Contents'), page: HubRoute.CollectionContents },
          { label: t('Import log'), page: HubRoute.CollectionImportLog },
          { label: t('Dependencies'), page: HubRoute.CollectionDependencies },
          { label: t('Distributions'), page: HubRoute.CollectionDistributions },
        ]}
        params={{
          name: collection?.collection_version?.name || '',
          namespace: collection?.collection_version?.namespace || '',
          version: collection?.collection_version?.version || '',
          repository: collection?.repository?.name || '',
        }}
        componentParams={{ collection: collection }}
      />
    </PageLayout>
  );
}
