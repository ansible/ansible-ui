import { useTranslation } from 'react-i18next';
import { PageDashboardCarousel } from '../../../framework/PageDashboard/PageDashboardCarousel';
import { CategorizedCollections, CollectionCategory } from './CollectionCategory';
import { useCategoryName } from './hooks/useCategoryName';
import { CollectionCard } from './CollectionCard';
import { CollectionVersionSearch } from '../collections/CollectionVersionSearch';
import { useMemo } from 'react';

/**
 * Carousel view representing a category of collections
 */
export function CollectionCategoryCarousel(props: {
  collectionCategories: CollectionCategory[];
  category: string;
  collections: CollectionVersionSearch[];
}) {
  const { collectionCategories, category, collections } = props;
  const { t } = useTranslation();
  const categoryName = useCategoryName(category, t);
  const collectionCategory = useMemo(() => {
    return collectionCategories.find((collectionCategory) => collectionCategory.id === category);
  }, [category, collectionCategories]);

  return collectionCategory?.showInDashboard ? (
    <PageDashboardCarousel title={categoryName} linkText={t('Go to Collections')} width="xxl">
      {collections.map((collection: CollectionVersionSearch) => (
        <CollectionCard
          key={collection.collection_version.name}
          collection={collection}
        ></CollectionCard>
      ))}
    </PageDashboardCarousel>
  ) : null;
}

/**
 * Component to display multiple categories of collections
 * with each category of collections represented in a carousel
 */
export function CollectionCategories(props: {
  collectionCategories: CollectionCategory[];
  categorizedCollections: CategorizedCollections;
}) {
  const { collectionCategories, categorizedCollections } = props;
  return (
    <>
      {Object.keys(categorizedCollections).map((category) => (
        <CollectionCategoryCarousel
          key={category}
          collectionCategories={collectionCategories}
          category={category}
          collections={categorizedCollections[category]}
        />
      ))}
    </>
  );
}
