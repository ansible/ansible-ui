import { useTranslation } from 'react-i18next';
import { PageDashboardCarousel } from '../../../framework/PageDashboard/PageDashboardCarousel';
import { useCategoryName } from './hooks/useCategoryName';
import { CollectionCard } from './CollectionCard';
import { CollectionVersionSearch } from '../collections/CollectionVersionSearch';
import { ReactNode, useMemo } from 'react';
import { CogIcon } from '@patternfly/react-icons';
import { useSelectCollectionsDialog } from '../collections/hooks/useSelectCollections';
import { collectionKeyFn } from '../api/utils';

type FooterAction = {
  icon?: ReactNode;
  title: string;
  onClick: () => unknown;
};

/**
 * Carousel view representing a category of collections
 */
export function CollectionCategoryCarousel(props: {
  category: string;
  collections: CollectionVersionSearch[];
}) {
  const { category, collections } = props;
  const { t } = useTranslation();
  const categoryName = useCategoryName(category, t);
  const selectCollections = useSelectCollectionsDialog();

  const footerActionButton = useMemo<FooterAction | undefined>(() => {
    if (props.category === 'eda') {
      return {
        icon: <CogIcon />,
        title: t('Manage content'),
        onClick: () => {
          selectCollections(
            t('Select featured collections content'),
            t(
              'Please select content below to be shown on the dashboard. Note: The max amount of selections is 12.'
            ),
            (collections: CollectionVersionSearch[]) => {
              console.log('Collections', collections);
              // Create post requests to Marks API to mark featured collections
            }
          );
        },
      };
    }
  }, [props.category, selectCollections, t]);

  return (
    <PageDashboardCarousel
      title={categoryName}
      linkText={t('Go to Collections')}
      width="xxl"
      footerActionButton={footerActionButton}
    >
      {collections.map((collection: CollectionVersionSearch) => (
        <CollectionCard
          key={collection.collection_version.name}
          collection={collection}
        ></CollectionCard>
      ))}
    </PageDashboardCarousel>
  );
}

// async function saveFeaturedCollections(
//   currentFeaturedCollections: CollectionVersionSearch[],
//   originalFeaturedCollections: CollectionVersionSearch[]
// ) {
//   // TODO: move getAddedAndRemoved to common folder outside awx folder
//   const { added, removed } = getAddedAndRemoved(
//     originalFeaturedCollections ?? ([] as CollectionVersionSearch[]),
//     currentFeaturedCollections ?? ([] as CollectionVersionSearch[])
//   );

//   if (added.length === 0 && removed.length === 0) {
//     return;
//   }

//   const promisesToUnmarkFeaturedCollections = removed.map((collection: CollectionVersionSearch) =>
//     postRequest(`/api/v2/inventories/${inventory.id.toString()}/instance_groups/`, {
//       id: instanceGroup.id,
//       disassociate: true,
//     })
//   );
//   const promisesToMarkFeaturedCollections = added.map((collection: CollectionVersionSearch) =>
//     postRequest(`/api/v2/inventories/${inventory.id.toString()}/instance_groups/`, {
//       id: instanceGroup.id,
//     })
//   );

//   const results = await Promise.all([...disassociationPromises, ...associationPromises]);
//   return results;
// }
