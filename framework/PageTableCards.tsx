import { PageSection } from '@patternfly/react-core'
import { useMemo } from 'react'
import { Grid } from './components/Grid'
import { PageTableProps } from './PageTable'
import { PageTableCard, useColumnsToTableCardFn } from './PageTableCard'

export type PageTableCardsProps<T extends object> = PageTableProps<T>

export function PageTableCards<T extends object>(props: PageTableCardsProps<T>) {
  const {
    keyFn,
    pageItems: items,
    tableColumns,
    isSelected,
    selectItem,
    unselectItem,
    rowActions,
    showSelect,
    defaultCardSubtitle,
  } = props

  const itemToCardFn = useColumnsToTableCardFn(tableColumns, keyFn)

  const catalogCards = useMemo(() => {
    return (
      <Grid size={400}>
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
      </Grid>
    )
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
  ])

  return <PageSection style={{ flexGrow: 1 }}>{catalogCards}</PageSection>
}
