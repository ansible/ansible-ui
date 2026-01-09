import {
  IPageAction,
  LoadingPage,
  PageActions,
  PageHeader,
  PageLayout,
  PFColorE,
  TextCell,
  useGetPageUrl,
  usePageAlertToaster,
  usePageNavigate,
} from '@ansible/ansible-ui-framework';
import {
  PageAsyncSelectQueryOptions,
  PageAsyncSelectQueryResult,
} from '@ansible/ansible-ui-framework/PageInputs/PageAsyncSelectOptions';
import { PageAsyncSingleSelect } from '@ansible/ansible-ui-framework/PageInputs/PageAsyncSingleSelect';
import { PageSingleSelectContext } from '@ansible/ansible-ui-framework/PageInputs/PageSingleSelect';
import { singleSelectBrowseAdapter } from '@ansible/ansible-ui-framework/PageToolbar/PageToolbarFilters/ToolbarAsyncSingleSelectFilter';
import { PageRoutedTabs } from '@ansible/common-ui/PageRoutedTabs';
import { requestGet } from '@ansible/common-ui/crud/Data';
import { useGet, useGetRequest } from '@ansible/common-ui/crud/useGet';
import { Button } from '@patternfly/react-core';
import { CheckCircleIcon, ExclamationTriangleIcon } from '@patternfly/react-icons';
import { DateTime } from 'luxon';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useSearchParams } from 'react-router-dom';
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
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { name, namespace, repository } = useParams();
  const context = useHubContext();
  const [collection, setCollection] = useState<null | Partial<CollectionVersionSearch>>(null);
  const [versionsCount, setVersionsCount] = useState<undefined | number>(undefined);
  const getPageUrl = useGetPageUrl();
  const alertToaster = usePageAlertToaster();
  const pageNavigate = usePageNavigate();

  const { display_signatures } = context.featureFlags;

  const singleSelector = useSelectCollectionVersionSingle({
    collection: name || '',
    namespace: namespace || '',
    repository: repository || '',
  });

  const getRequest = useGetRequest<HubItemsResponse<CollectionVersionSearch>>();

  const singleSelectorBrowser = singleSelectBrowseAdapter<CollectionVersionSearch>(
    singleSelector.openBrowse,
    (item) => {
      return item?.collection_version?.version || '';
    },
    async (name) => {
      const collectionRequest = await getRequest(
        hubAPI`/v3/plugin/ansible/search/collection-versions/?name=${name}&namespace=${namespace}&repository_name=${repository}&version=${name}`
      );
      return collectionRequest.data;
    }
  );

  useEffect(() => {
    async function getCollectionData() {
      try {
        const version = searchParams.get('version');
        let queryFilter;
        if (version) {
          queryFilter = '&version=' + version;
        } else if (collection) {
          queryFilter = '&version=' + collection?.collection_version?.version;
        } else {
          queryFilter = '&is_highest=true';
        }

        const collectionRequest = await getRequest(
          hubAPI`/v3/plugin/ansible/search/collection-versions/?name=${name}&namespace=${namespace}&repository_name=${repository}` +
            queryFilter
        );

        const collectionData: null | CollectionVersionSearch =
          collectionRequest?.data && collectionRequest?.data?.length > 0
            ? collectionRequest.data[0]
            : null;

        // only set collection when collection has updated this avoids infinite loop
        if (
          !collection ||
          collection?.collection_version?.version !== collectionData?.collection_version?.version
        ) {
          setCollection(collectionData);
        }
      } catch (error) {
        // Error will be handled by useGet hook's error state
        setCollection(null);
      } finally {
        setIsLoading(false);
      }
    }

    void getCollectionData();
  }, [collection, getRequest, name, namespace, repository, searchParams]);

  let queryFilter;
  const version = searchParams.get('version');
  if (version) {
    queryFilter = '&version=' + version;
  } else if (collection) {
    queryFilter = '&version=' + collection?.collection_version?.version;
  } else {
    queryFilter = '&is_highest=true';
  }
  const collectionRequest = useGet<HubItemsResponse<CollectionVersionSearch>>(
    hubAPI`/v3/plugin/ansible/search/collection-versions/?name=${name}&namespace=${namespace}&repository_name=${repository}${queryFilter}`
  );

  const itemActions = useCollectionActions((collections) => {
    async function getCollectionData() {
      const collectionRequest = await getRequest(
        hubAPI`/v3/plugin/ansible/search/collection-versions/?name=${name}&namespace=${namespace}&repository_name=${repository}&version=${collections[0]?.collection_version?.version}`
      );
      setCollection(collectionRequest?.data[0]);
    }
    void getCollectionData();
  }, true);

  function setVersionParams(collection: Partial<CollectionVersionSearch> | null) {
    if (!collection) {
      return;
    }

    setTimeout(() => {
      setSearchParams((params) => {
        params.set('version', collection?.collection_version?.version ?? '');
        return params;
      });
    }, 0);
  }

  const { data: versions } = useGet<HubItemsResponse<CollectionVersionSearch>>(
    hubAPI`/v3/plugin/ansible/search/collection-versions/?name=${name}&namespace=${namespace}&repository_name=${repository}`,
    undefined,
    { refreshInterval: 1000 }
  );

  useEffect(() => {
    if (!versionsCount && versions?.meta.count) {
      setVersionsCount(versions?.meta.count);
    } else if (
      collection &&
      versions?.meta.count &&
      versionsCount &&
      versions?.meta.count > versionsCount
    ) {
      const sortedversion: CollectionVersionSearch[] = versions.data.sort((a, b) => {
        const dateA = new Date(String(a.collection_version?.pulp_created));
        const dateB = new Date(String(b.collection_version?.pulp_created));
        return dateA < dateB ? 1 : -1;
      });
      setVersionsCount(versions?.meta.count);
      alertToaster.addAlert({
        variant: 'success',
        title: (
          <span>
            {t(`A new version of this collection has been uploaded. Click `)}
            <Button
              style={{ padding: 0 }}
              variant="link"
              onClick={() => {
                pageNavigate(HubRoute.CollectionDetails, {
                  params: {
                    name: collection?.collection_version?.name,
                    namespace: collection.collection_version?.namespace,
                    repository: collection.repository?.name,
                  },
                  query: {
                    version: sortedversion[0].collection_version?.version,
                  },
                });
                alertToaster.removeAlerts();
              }}
            >
              {t(`here`)}
            </Button>
            {t(` to switch to it.`)}
          </span>
        ),
        timeout: true,
      });
    }
  }, [collection, alertToaster, t, versions, versionsCount, pageNavigate]);

  // load collection versions
  const queryOptions = useCallback(
    (
      options: PageAsyncSelectQueryOptions
    ): Promise<PageAsyncSelectQueryResult<CollectionVersionSearch>> => {
      const pageSize = 10;
      const page = options.next ? Number(options.next) : 1;

      async function load() {
        const data = await requestGet<HubItemsResponse<CollectionVersionSearch>>(
          hubAPI`/v3/plugin/ansible/search/collection-versions/?name=${name}&namespace=${namespace}&repository_name=${repository}&order_by=-version&offset=${
            pageSize * (page - 1)
          }&limit=${pageSize}`
        );

        return {
          remaining: data.meta.count - pageSize * page < 0 ? 0 : data.meta.count - pageSize * page,
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
              value: item,
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

  if (isLoading) {
    return <LoadingPage />;
  }

  if (collectionRequest.error) {
    return <HubError error={collectionRequest.error} handleRefresh={collectionRequest.refresh} />;
  }

  if (!collection || !collection.collection_version) {
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
            <PageActions<Partial<CollectionVersionSearch>>
              actions={itemActions as IPageAction<Partial<CollectionVersionSearch>>[]}
              position={'right'}
              selectedItem={collection}
            />
          )
        }
        description={t('Repository: ') + collection?.repository?.name}
        footer={
          <div
            data-cy="browse-collection-version"
            data-testid="browse-collection-version"
            style={{ display: 'flex', alignItems: 'center', gridGap: '8px' }}
          >
            {t('Version')}
            <PageAsyncSingleSelect<Partial<CollectionVersionSearch>>
              id="version-selector"
              isRequired
              queryOptions={queryOptions}
              onSelect={(value) => {
                setCollection(value);
                setVersionParams(value);
              }}
              placeholder={t('Select version')}
              value={collection}
              footer={
                <PageSingleSelectContext.Consumer>
                  {(context) => (
                    <Button
                      data-testid="browse-collection-version-button"
                      variant="link"
                      onClick={() => {
                        context.setOpen(false);
                        singleSelectorBrowser?.((selection) => {
                          setCollection({
                            collection_version: { version: selection },
                          } as Partial<CollectionVersionSearch>);
                          setVersionParams({
                            collection_version: { version: selection },
                          } as Partial<CollectionVersionSearch>);
                        }, collection.collection_version?.version);
                      }}
                    >
                      {t`Browse`}
                    </Button>
                  )}
                </PageSingleSelectContext.Consumer>
              }
              queryLabel={(value) => `${value.collection_version?.version}`}
              disableMaxDropdownWidth
            />
            {collection?.collection_version &&
              t('Last updated') +
                ' ' +
                DateTime.fromISO(collection.collection_version?.pulp_created).toRelative()}
            {collection &&
              display_signatures &&
              (collection.is_signed ? (
                <TextCell text={t('Signed')} color={PFColorE.Success} icon={<CheckCircleIcon />} />
              ) : (
                <TextCell
                  text={t('Unsigned')}
                  color={PFColorE.Warning}
                  icon={<ExclamationTriangleIcon />}
                />
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
          {
            label: t('Details'),
            dataCy: 'collection-detail-tab',
            page: HubRoute.CollectionDetails,
          },
          {
            label: t('Install'),
            dataCy: 'collection-install-tab',
            page: HubRoute.CollectionInstall,
          },
          {
            label: t('Documentation'),
            dataCy: 'collection-documentation-tab',
            page: HubRoute.CollectionDocumentation,
          },
          {
            label: t('Contents'),
            dataCy: 'collection-contents-tab',
            page: HubRoute.CollectionContents,
          },
          {
            label: t('Import Log'),
            dataCy: 'collection-import-log-tab',
            page: HubRoute.CollectionImportLog,
          },
          {
            label: t('Dependencies'),
            dataCy: 'collection-dependencies-tab',
            page: HubRoute.CollectionDependencies,
          },
          {
            label: t('Distributions'),
            page: HubRoute.CollectionDistributions,
            dataCy: 'collection-distribution-tab',
          },
        ]}
        params={{
          name: collection?.collection_version?.name || '',
          namespace: collection?.collection_version?.namespace || '',
          content_name: '',
          version: collection?.collection_version?.version || '',
          repository: collection?.repository?.name || '',
        }}
        componentParams={{ collection: collection }}
        sharedQueryKeys={['version']}
      />
    </PageLayout>
  );
}
