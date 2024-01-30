import { CogIcon } from '@patternfly/react-icons';
import { ReactNode, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { errorToAlertProps, useGetPageUrl, usePageAlertToaster } from '../../../framework';
import { PageDashboardCarousel } from '../../../framework/PageDashboard/PageDashboardCarousel';
import { CollectionVersionSearch } from '../collections/Collection';
import { useSelectCollectionsDialog } from '../collections/hooks/useSelectCollections';
import { hubAPI } from '../common/api/formatPath';
import { parsePulpIDFromURL } from '../common/api/hub-api-utils';
import { postHubRequest } from '../common/api/request';
import { useHubContext } from '../common/useHubContext';
import { getAddedAndRemovedCollections } from '../common/utils/getAddedAndRemovedCollections';
import { HubRoute } from '../main/HubRoutes';
import { CollectionCard } from './CollectionCard';
import { useCategoryName } from './hooks/useCategoryName';

type FooterAction = {
  icon?: ReactNode;
  title: string;
  onClick: () => void;
};

/**
 * Carousel view representing a category of collections
 */
export function CollectionCategoryCarousel(props: {
  category: string;
  collections: CollectionVersionSearch[];
  searchKey: string;
  searchValue: string;
}) {
  const { category, collections, searchKey, searchValue } = props;
  const { t } = useTranslation();
  const categoryName = useCategoryName(category, t);
  const selectCollections = useSelectCollectionsDialog(collections);
  const alertToaster = usePageAlertToaster();
  const context = useHubContext();
  const getPageUrl = useGetPageUrl();

  const footerActionButton = useMemo<FooterAction | undefined>(() => {
    /**
     * TODO: The category in the condition below needs to be changed to "featured".
     * Since we don't have the API to retrieve "featured" collections yet,
     * this is set to "eda" temporarily to be able to view the UI.
     */
    if (context?.user?.is_superuser && props.category === 'eda') {
      return {
        icon: <CogIcon />,
        title: t('Manage content'),
        onClick: () => {
          selectCollections(
            t('Select featured collections content'),
            t(
              'Please select content below to be shown on the dashboard. Note: The max amount of selections is 12.'
            ),
            async (selectedCollections: CollectionVersionSearch[]) => {
              try {
                await saveFeaturedCollections(selectedCollections, collections);
              } catch (error) {
                alertToaster.addAlert(errorToAlertProps(error));
              }
            },
            {
              maxSelections: 12,
              allowZeroSelections: true,
            }
          );
        },
      };
    }
  }, [
    alertToaster,
    collections,
    context?.user?.is_superuser,
    props.category,
    selectCollections,
    t,
  ]);

  return (
    <PageDashboardCarousel
      title={categoryName}
      linkText={t('Go to collections')}
      to={getPageUrl(HubRoute.Collections, { query: { [searchKey]: searchValue } })}
      width="xxl"
      footerActionButton={footerActionButton}
    >
      {collections.map((collection: CollectionVersionSearch) => (
        <CollectionCard
          key={collection.collection_version?.name}
          collection={collection}
        ></CollectionCard>
      ))}
    </PageDashboardCarousel>
  );
}

// Object mapping repo pulp_ids to an array of collection pulp_hrefs
function getRepoToCollectionPulpHrefsMap(collections: CollectionVersionSearch[]) {
  const repoToCollectionPulpHrefsMap: { [key: string]: string[] } = {};

  collections.forEach((collection) => {
    const repoPulpId = parsePulpIDFromURL(collection.repository?.pulp_href);
    if (repoPulpId) {
      if (!repoToCollectionPulpHrefsMap[repoPulpId]) {
        repoToCollectionPulpHrefsMap[repoPulpId] = [collection.collection_version?.pulp_href || ''];
      } else {
        repoToCollectionPulpHrefsMap[repoPulpId].push(
          collection.collection_version?.pulp_href || ''
        );
      }
    }
  });

  return repoToCollectionPulpHrefsMap;
}

// If multiple collections are part of the same repository we can group them to make fewer API requests
function getPromisesToMarkAndUnmarkCollections(
  collections: CollectionVersionSearch[],
  option: 'mark' | 'unmark',
  markValue: string
) {
  const repoToCollectionPulpHrefsMap = getRepoToCollectionPulpHrefsMap(collections);

  const promises: unknown[] = [];

  Object.keys(repoToCollectionPulpHrefsMap).forEach((repoPulpId) => {
    promises.push(
      postHubRequest(hubAPI`/pulp/api/v3/repositories/ansible/ansible/${repoPulpId}/${option}/`, {
        content_units: repoToCollectionPulpHrefsMap[repoPulpId],
        value: markValue,
      })
    );
  });

  return promises;
}

// Make API requests to mark/unmark collections as "featured" based on the selections in the Manage Content modal
async function saveFeaturedCollections(
  currentFeaturedCollections: CollectionVersionSearch[],
  originalFeaturedCollections: CollectionVersionSearch[]
) {
  const { added, removed } = getAddedAndRemovedCollections(
    originalFeaturedCollections ?? ([] as CollectionVersionSearch[]),
    currentFeaturedCollections ?? ([] as CollectionVersionSearch[])
  );

  if (added.length === 0 && removed.length === 0) {
    return;
  }

  const promisesToUnmarkFeaturedCollections = getPromisesToMarkAndUnmarkCollections(
    removed,
    'unmark',
    'featured'
  );

  const promisesToMarkFeaturedCollections = getPromisesToMarkAndUnmarkCollections(
    added,
    'mark',
    'featured'
  );

  const results = await Promise.all([
    ...promisesToUnmarkFeaturedCollections,
    ...promisesToMarkFeaturedCollections,
  ]);
  return results;
}
