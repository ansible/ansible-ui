/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-empty-function */
import { PageSection } from '@patternfly/react-core'
import { ReactNode, useMemo } from 'react'
import { Grid } from './components/Grid'
import { ITableColumn } from './PageTable'
import { PageTableCard, useColumnsToTableCardFn } from './PageTableCard'
import { ITypedAction } from './TypedActions'

export function PageTableCards<T extends object>(props: {
  keyFn: (item: T) => string | number
  pageItems: T[] | undefined
  // itemToCardFn: (item: T) => IPageTableCard
  tableColumns: ITableColumn<T>[]
  onBack?: () => void
  cardWidth?: number
  selectItem?: (item: T) => void
  unselectItem: (item: T) => void
  isSelected: (item: T) => boolean
  itemActions?: ITypedAction<T>[]
  showSelect: boolean
  defaultCardSubtitle?: ReactNode
}) {
  const {
    keyFn,
    pageItems: items,
    tableColumns,
    isSelected,
    selectItem,
    unselectItem,
    itemActions,
    showSelect,
    cardWidth,
    defaultCardSubtitle,
  } = props

  const itemToCardFn = useColumnsToTableCardFn(tableColumns, keyFn)

  const catalogCards = useMemo(() => {
    return (
      <Grid size={cardWidth ?? 470}>
        {items?.map((item) => (
          <PageTableCard<T>
            key={keyFn(item)}
            item={item}
            itemToCardFn={itemToCardFn}
            isSelected={isSelected}
            selectItem={selectItem}
            unselectItem={unselectItem}
            itemActions={itemActions}
            showSelect={showSelect}
            defaultCardSubtitle={defaultCardSubtitle}
          />
        ))}
      </Grid>
    )
  }, [
    cardWidth,
    items,
    keyFn,
    itemToCardFn,
    isSelected,
    selectItem,
    unselectItem,
    itemActions,
    showSelect,
  ])

  return (
    <PageSection style={{ flexGrow: 1 }}>
      {/* <Flex style={{ paddingBottom: 16 }}>
                <FlexItem>
                    <span style={{ paddingRight: 8 }}>
                        <b>Cards</b>
                    </span>
                    <Chip isReadOnly>{items.length}</Chip>
                </FlexItem>
                <FlexItem grow={{ default: 'grow' }} alignSelf={{ default: 'alignSelfCenter' }}>
                    <Divider />
                </FlexItem>
            </Flex> */}
      <div>{catalogCards}</div>
    </PageSection>
  )
}
