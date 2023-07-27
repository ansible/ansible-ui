import { useTranslation } from 'react-i18next';
import { PageDashboardCarousel } from '../../../framework/PageDashboard/PageDashboardCarousel';
import { CategorizedCollections, CollectionCategory } from './CollectionCategory';
import { useCategoryName } from './hooks/useCategoryName';
import { CollectionCard } from './CollectionCard';
import { CollectionVersionSearch } from '../collections/CollectionVersionSearch';
import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { CardSpan } from '../../../framework/PageCarousel/PageCarousel';

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
  const [collectionCardWidth, setCollectionCardWidth] = useState<number>(CardSpan);
  const collectionCardRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (collectionCardRef.current) {
      const divWidth = window.getComputedStyle((collectionCardRef as HTMLDivElement).current).width;
      console.log('🚀 ~ file: CollectionCategories.tsx:29 ~ useLayoutEffect ~ divWidth:', divWidth);
    }

    setCollectionCardWidth(Math.floor(collectionCardRef.current?.clientWidth ?? 0));
  }, []);

  return collectionCategory?.showInDashboard ? (
    <PageDashboardCarousel
      title={categoryName}
      linkText={t('Go to Collections')}
      width="xxl"
      childCardWidth={collectionCardWidth}
    >
      {collections.map((collection: CollectionVersionSearch) => (
        <CollectionCard
          ref={collectionCardRef}
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
