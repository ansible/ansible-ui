import { Button } from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { PageGrid } from '../components/PageGrid';
import { useFrameworkTranslations } from '../useFrameworkTranslations';
import { PageTableProps } from './PageTable';
import { PageTableCard, useColumnsToTableCardFn } from './PageTableCard';
import { PageTableEmptyState } from './PageTableEmptyState';

export type PageTableCardsProps<T extends object> = PageTableProps<T>;

export function PageTableCards<T extends object>(props: Readonly<PageTableCardsProps<T>>) {
  const {
    keyFn,
    pageItems: items,
    tableColumns,
    isSelected,
    selectItem,
    unselectItem,
    rowActions,
    showSelect,
    defaultSubtitle: defaultCardSubtitle,
    itemCount,
    clearAllFilters,
  } = props;

  const [translations] = useFrameworkTranslations();
  const itemToCardFn = useColumnsToTableCardFn(tableColumns, keyFn);

  const catalogCards = useMemo(() => {
    return (
      <PageGrid size={400}>
        {items?.map((item) => (
          <PageTableCard<T>
            key={keyFn(item)}
            item={item}
            itemToCardFn={itemToCardFn}
            isSelected={isSelected}
            selectItem={selectItem}
            unselectItem={unselectItem}
            itemActions={rowActions}
            showSelect={showSelect}
            defaultCardSubtitle={defaultCardSubtitle}
          />
        ))}
      </PageGrid>
    );
  }, [
    items,
    keyFn,
    itemToCardFn,
    isSelected,
    selectItem,
    unselectItem,
    rowActions,
    showSelect,
    defaultCardSubtitle,
  ]);

  return (
    <>
      {itemCount === 0 ? (
        <PageTableEmptyState
          icon={SearchIcon}
          title={translations.noResultsFound}
          description={translations.noResultsMatchCriteria}
        >
          <Button variant="primary" onClick={clearAllFilters}>
            {translations.clearAllFilters}
          </Button>
        </PageTableEmptyState>
      ) : (
        <>{catalogCards}</>
      )}
    </>
  );
}
