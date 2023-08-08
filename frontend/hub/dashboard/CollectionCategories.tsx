import { useTranslation } from 'react-i18next';
import { PageDashboardCarousel } from '../../../framework/PageDashboard/PageDashboardCarousel';
import { useCategoryName } from './hooks/useCategoryName';
import { CollectionCard } from './CollectionCard';
import { CollectionVersionSearch } from '../collections/CollectionVersionSearch';

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

  return (
    <PageDashboardCarousel title={categoryName} linkText={t('Go to Collections')} width="xxl">
      {collections.map((collection: CollectionVersionSearch) => (
        <CollectionCard
          key={collection.collection_version.name}
          collection={collection}
        ></CollectionCard>
      ))}
    </PageDashboardCarousel>
  );
}
