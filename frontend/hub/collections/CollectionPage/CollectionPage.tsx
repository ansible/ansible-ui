import { Button, Label } from '@patternfly/react-core';
import { DropdownPosition } from '@patternfly/react-core/dist/esm/deprecated';
import { CheckCircleIcon, ExclamationTriangleIcon } from '@patternfly/react-icons';
import { DateTime } from 'luxon';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useSearchParams } from 'react-router-dom';
import {
  LoadingPage,
  PageActions,
  PageHeader,
  PageLayout,
  useGetPageUrl,
} from '../../../../framework';
import {
  PageAsyncSelectQueryOptions,
  PageAsyncSelectQueryResult,
} from '../../../../framework/PageInputs/PageAsyncSelectOptions';
import { PageAsyncSingleSelect } from '../../../../framework/PageInputs/PageAsyncSingleSelect';
import { PageSingleSelectContext } from '../../../../framework/PageInputs/PageSingleSelect';
import { singleSelectBrowseAdapter } from '../../../../framework/PageToolbar/PageToolbarFilters/ToolbarAsyncSingleSelectFilter';
import { PageRoutedTabs } from '../../../common/PageRoutedTabs';
import { requestGet } from '../../../common/crud/Data';
import { useGet } from '../../../common/crud/useGet';
import { HubError } from '../../common/HubError';
import { hubAPI } from '../../common/api/formatPath';
import { useHubContext } from '../../common/useHubContext';
import { HubItemsResponse } from '../../common/useHubView';
import { HubRoute } from '../../main/HubRoutes';
import { CollectionVersionSearch } from '../Collection';
import { useCollectionActions } from '../hooks/useCollectionActions';
import { useSelectCollectionVersionSingle } from '../hooks/useCollectionVersionSelector';

export function CollectionPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { name, namespace, repository } = useParams();
  const context = useHubContext();

  const { display_signatures } = context.featureFlags;
  // load collection by search params
  const version = searchParams.get('version');

  let queryFilter = '';

  if (!version) {
    // for unspecified version, load highest
    queryFilter = '&is_highest=true';
  } else {
    queryFilter = '&version=' + version;
  }

  const singleSelector = useSelectCollectionVersionSingle({
    collection: name || '',
    namespace: namespace || '',
    repository: repository || '',
  });

  const singleSelectorBrowser = singleSelectBrowseAdapter<CollectionVersionSearch>(
    singleSelector.openBrowse,
    (item) => {
      return item.collection_version?.version || '';
    },
    (name) => {
      return { collection_version: { version: name } };
    }
  );

  const collectionRequest = useGet<HubItemsResponse<CollectionVersionSearch>>(
    hubAPI`/v3/plugin/ansible/search/collection-versions/?name=${name}&namespace=${namespace}&repository_name=${repository}` +
      queryFilter
  );

  const collection =
    collectionRequest?.data?.data && collectionRequest?.data?.data?.length > 0
      ? collectionRequest.data?.data[0]
      : undefined;

  const itemActions = useCollectionActions(() => void collectionRequest.refresh(), true);

  function setVersionParams(version: string | null) {
    if (version === null) {
      return;
    }
    setTimeout(() => {
      setSearchParams((params) => {
        params.set('version', version);
        return params;
      });
    }, 0);
  }

  // load collection versions
  const queryOptions = useCallback(
    (options: PageAsyncSelectQueryOptions): Promise<PageAsyncSelectQueryResult<string>> => {
      const pageSize = 10;
      const page = options.next ? Number(options.next) : 1;

      async function load() {
        const data = await requestGet<HubItemsResponse<CollectionVersionSearch>>(
          hubAPI`/v3/plugin/ansible/search/collection-versions/?name=${name}&namespace=${namespace}&repository_name=${repository}&order_by=-version&offset=${
            pageSize * (page - 1)
          }&limit=${pageSize}`
        );

        return {
          remaining: data.meta.count - pageSize * page,
          options: data.data.map((item) => {
            let label =
              item.collection_version?.version +
              ' ' +
              t('updated') +
              ' ' +
              `${DateTime.fromISO(item.collection_version?.pulp_created || '').toRelative()} ${
                display_signatures ? (item.is_signed ? t('signed') : t('unsigned')) : ''
              }`;
            if (item.is_highest) {
              label += ' (' + t('latest') + ')';
            }
            return {
              value: item.collection_version?.version || '',
              label,
            };
          }),
          next: page + 1,
        };
      }

      return load();
    },
    [name, namespace, repository, t, display_signatures]
  );

  const getPageUrl = useGetPageUrl();

  if (collectionRequest.error) {
    return <HubError error={collectionRequest.error} handleRefresh={collectionRequest.refresh} />;
  }

  if (!collectionRequest.data && !collectionRequest.error) {
    return <LoadingPage />;
  }

  if (!collection) {
    return <HubError handleRefresh={collectionRequest.refresh} />;
  }

  return (
    <PageLayout>
      <PageHeader
        title={
          collection?.collection_version?.namespace + '.' + collection?.collection_version?.name
        }
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
            <PageAsyncSingleSelect<string>
              queryOptions={queryOptions}
              onSelect={setVersionParams}
              placeholder={t('Select version')}
              value={collection?.collection_version?.version || version || ''}
              footer={
                <PageSingleSelectContext.Consumer>
                  {(context) => (
                    <Button
                      variant="link"
                      onClick={() => {
                        context.setOpen(false);
                        singleSelectorBrowser?.(
                          (selection) => {
                            setVersionParams(selection);
                          },
                          collection?.collection_version?.version || version || ''
                        );
                      }}
                    >
                      {t`Browse`}
                    </Button>
                  )}
                </PageSingleSelectContext.Consumer>
              }
              queryLabel={(value) => value}
            />
            {collection?.collection_version &&
              t('Last updated') +
                ' ' +
                DateTime.fromISO(collection.collection_version?.pulp_created).toRelative()}
            {collection &&
              display_signatures &&
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
          { label: t('Import Log'), page: HubRoute.CollectionImportLog },
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
        sharedQueryKeys={['version']}
      />
    </PageLayout>
  );
}
