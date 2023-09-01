import { useTranslation } from 'react-i18next';
import { PageDashboardCarousel } from '../../../framework/PageDashboard/PageDashboardCarousel';
import { useCategoryName } from './hooks/useCategoryName';
import { CollectionCard } from './CollectionCard';
import { CollectionVersionSearch } from '../collections/CollectionVersionSearch';
import { ReactNode, useMemo } from 'react';
import { CogIcon } from '@patternfly/react-icons';
import { useSelectCollectionsDialog } from '../collections/hooks/useSelectCollections';

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
          console.log('Clicked Manage content');
          selectCollections(
            t('Select featured collections content'),
            t(
              'Please select content below to be shown on the dashboard. Note: The max amount of selections is 12.'
            ),
            (collections: CollectionVersionSearch[]) => {
              console.log('Collections', collections);
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
