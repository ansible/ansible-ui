/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-empty-function */
import {
  Alert,
  Card,
  CardActions,
  CardBody,
  CardFooter,
  CardHeader,
  CardTitle,
  Checkbox,
  DescriptionList,
  DropdownPosition,
  Label,
  LabelGroup,
  Popover,
  Split,
  SplitItem,
  Stack,
  Text,
  Truncate,
} from '@patternfly/react-core'
import { ReactNode, useCallback, useMemo } from 'react'
import { Detail } from './components/Details'
import { IconWrapper } from './components/IconWrapper'
import { LabelColor } from './components/pfcolors'
import { ITableColumn } from './PageTable'
import { ITypedAction, TypedActions } from './TypedActions'

export interface IPageTableCard {
  id: string | number
  icon?: ReactNode
  title: ReactNode
  description?: ReactNode
  cardBody: ReactNode
  labels?: { label: string; color?: LabelColor }[] // TODO - disable/enable auto generated filters
  badge?: string
  badgeColor?: LabelColor
  badgeTooltip?: string
  badgeTooltipTitle?: string
  alertTitle?: string
  alertContent?: ReactNode
  alertVariant?: 'success' | 'danger' | 'warning' | 'info' | 'default'
}

export function PageTableCard<T extends object>(props: {
  item: T
  itemToCardFn: (item: T) => IPageTableCard
  isSelected?: (item: T) => boolean
  selectItem?: (item: T) => void
  unselectItem?: (item: T) => void
  itemActions?: ITypedAction<T>[]
  showSelect?: boolean
  defaultCardSubtitle?: ReactNode
}) {
  const {
    item,
    itemToCardFn,
    isSelected,
    selectItem,
    unselectItem,
    itemActions,
    showSelect,
    defaultCardSubtitle,
  } = props

  const card = useMemo(() => itemToCardFn(item), [item, itemToCardFn])

  const isItemSelected = !!isSelected?.(item)

  const onSelectClick = useCallback(() => {
    if (isSelected?.(item)) {
      unselectItem?.(item)
    } else {
      selectItem?.(item)
    }
  }, [isSelected, item, selectItem, unselectItem])

  const showDropdown = itemActions !== undefined && itemActions.length > 0
  const showActions = showSelect || showDropdown

  return (
    <Card
      id={card.id as string}
      key={card.id ?? card.title}
      isFlat
      isLarge
      isRounded
      isSelectable={isItemSelected}
      isSelected={isItemSelected}
      style={{
        transition: 'box-shadow 0.25s',
        cursor: 'default',
      }}
    >
      <CardHeader>
        <Split hasGutter style={{ width: '100%' }}>
          <SplitItem isFilled>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {card.icon && (
                <div
                  style={{
                    display: 'flex',
                    height: 40,
                    width: 40,
                    marginTop: -20,
                    marginBottom: -20,
                    marginRight: 12,
                    alignItems: 'center',
                    justifyItems: 'stretch',
                  }}
                >
                  <IconWrapper size="lg">{card.icon}</IconWrapper>
                </div>
              )}
              <Stack>
                <CardTitle>{card.title}</CardTitle>
                {card.description ? (
                  <Text component="small" style={{ opacity: 0.7 }}>
                    {card.description}
                  </Text>
                ) : (
                  defaultCardSubtitle && <Text component="small">{defaultCardSubtitle}</Text>
                )}
              </Stack>
            </div>
          </SplitItem>
          {card.badge && card.badgeTooltip && (
            <SplitItem>
              {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
              <div onClick={(e) => e.stopPropagation()}>
                <Popover
                  headerContent={card.badgeTooltipTitle}
                  bodyContent={card.badgeTooltip}
                  removeFindDomNode
                >
                  <Label color={card.badgeColor}>{card.badge}</Label>
                </Popover>
              </div>
            </SplitItem>
          )}
          {card.badge && !card.badgeTooltip && (
            <SplitItem>
              <Label color={card.badgeColor}>{card.badge}</Label>
            </SplitItem>
          )}
        </Split>
        {showActions && (
          <CardActions>
            {itemActions && itemActions.length && (
              <TypedActions
                actions={itemActions}
                position={DropdownPosition.right}
                selectedItem={item}
              />
            )}
            {showSelect && (
              <Checkbox
                isChecked={isSelected?.(item)}
                onChange={onSelectClick}
                // aria-label="card checkbox example"
                id="check-1"
                // name="check1"
              />
            )}
          </CardActions>
        )}
      </CardHeader>
      {card.cardBody}
      {card.labels && (
        <CardFooter>
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'end',
              gap: 16,
            }}
          >
            <div style={{ flexGrow: 1 }}>
              {card.labels && (
                <LabelGroup>
                  {card.labels.map((item) => (
                    <Label key={item.label} color={item.color}>
                      <Truncate content={item.label} style={{ minWidth: 0 }} />
                    </Label>
                  ))}
                </LabelGroup>
              )}
            </div>
          </div>
        </CardFooter>
      )}
      {card.alertTitle && (
        <Alert title={card.alertTitle} isInline variant={card.alertVariant}>
          {card.alertContent}
        </Alert>
      )}
    </Card>
  )
}

export function useColumnsToTableCardFn<T extends object>(
  columns: ITableColumn<T>[],
  keyFn: (item: T) => string | number
): (item: T) => IPageTableCard {
  const cardData = useMemo(() => {
    let cols = columns.filter((column) => column.card !== 'hidden')
    const nameColumn = cols.find((column) => column.primary) ?? cols[0]
    cols = cols.filter((column) => column !== nameColumn)
    const descriptionColumn = cols.find((column) => column.card === 'description')
    if (descriptionColumn) {
      cols = cols.filter((column) => column !== descriptionColumn)
    }
    return {
      nameColumn: nameColumn,
      descriptionColumn: descriptionColumn,
      columns: cols,
    }
  }, [columns])

  return useMemo<(item: T) => IPageTableCard>(() => {
    return (item: T) => {
      const pageTableCard: IPageTableCard = {
        id: keyFn(item),
        title: cardData.nameColumn?.cell(item),
        description: cardData.descriptionColumn?.cell(item),
        cardBody: (
          <CardBody>
            <DescriptionList isCompact>
              {cardData.columns.map((column) => (
                <Detail key={column.id} label={column.hideLabel ? undefined : column.header}>
                  {column.cell(item)}
                </Detail>
              ))}
            </DescriptionList>
          </CardBody>
        ),
      }
      return pageTableCard
    }
  }, [cardData.columns, cardData.descriptionColumn, cardData.nameColumn, keyFn])
}
