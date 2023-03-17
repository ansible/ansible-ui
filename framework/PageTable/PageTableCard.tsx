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
  FlexItem,
  Label,
  LabelGroup,
  Popover,
  Text,
  Truncate,
} from '@patternfly/react-core';
import { ReactNode, useCallback, useMemo } from 'react';
import { IPageAction } from '../PageActions/PageAction';
import { PageActions } from '../PageActions/PageActions';
import { PageDetail } from '../PageDetails/PageDetail';
import { IconWrapper } from '../components/IconWrapper';
import { LabelColor } from '../components/pfcolors';
import {
  ITableColumn,
  ITableColumnTypeCount,
  ITableColumnTypeLabels,
  TableColumnCell,
} from './PageTableColumn';
import styled from 'styled-components';

export interface IPageTableCard {
  id: string | number;
  icon?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  cardBody: ReactNode;
  labels?: { label: string; color?: LabelColor }[]; // TODO - disable/enable auto generated filters
  badge?: string;
  badgeColor?: LabelColor;
  badgeTooltip?: string;
  badgeTooltipTitle?: string;
  alertTitle?: string;
  alertContent?: ReactNode;
  alertVariant?: 'success' | 'danger' | 'warning' | 'info' | 'default';
}

const CardHeaderDiv = styled.div`
  display: 'flex';
  flex-wrap: 'nowrap';
  max-width: '100%';
`;

const CardTopDiv = styled.div`
  display: 'flex';
  flex-wrap: 'wrap';
  align-items: 'center';
  gap: 16;
  max-width: '100%';
`;

const CardDiv = styled.div`
  max=-idth: '100%';
`;

const CardFooterDiv = styled.div`
  display: 'flex';
  flex-direction: 'row';
  align-items: 'end';
  gap: 16;
`;

const CardFooterLabelsDiv = styled.div`
  flex-grow: 1;
`;

export function PageTableCard<T extends object>(props: {
  item: T;
  itemToCardFn: (item: T) => IPageTableCard;
  isSelected?: (item: T) => boolean;
  selectItem?: (item: T) => void;
  unselectItem?: (item: T) => void;
  itemActions?: IPageAction<T>[];
  showSelect?: boolean;
  defaultCardSubtitle?: ReactNode;
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
  } = props;

  const card = useMemo(() => itemToCardFn(item), [item, itemToCardFn]);

  const isItemSelected = !!isSelected?.(item);

  const onSelectClick = useCallback(() => {
    if (isSelected?.(item)) {
      unselectItem?.(item);
    } else {
      selectItem?.(item);
    }
  }, [isSelected, item, selectItem, unselectItem]);

  const showDropdown = itemActions !== undefined && itemActions.length > 0;
  const showActions = showSelect || showDropdown;

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
        maxWidth: '100%',
      }}
    >
      <CardHeader style={{ display: 'flex', flexWrap: 'nowrap', maxWidth: '100%' }}>
        <CardHeaderDiv>
          <CardTopDiv>
            {card.icon && <IconWrapper size="xl">{card.icon}</IconWrapper>}
            <CardDiv>
              <CardTitle>
                <Truncate content={card.title as string} />
              </CardTitle>
              {card.subtitle ? (
                <Text component="small" style={{ opacity: 0.7 }}>
                  {card.subtitle}
                </Text>
              ) : (
                defaultCardSubtitle && (
                  <Text component="small" style={{ opacity: 0.7 }}>
                    {defaultCardSubtitle}
                  </Text>
                )
              )}
            </CardDiv>
          </CardTopDiv>
          {card.badge && card.badgeTooltip && (
            <FlexItem>
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
            </FlexItem>
          )}
          {card.badge && !card.badgeTooltip && (
            <FlexItem>
              <Label color={card.badgeColor}>{card.badge}</Label>
            </FlexItem>
          )}
        </CardHeaderDiv>
        {showActions && (
          <CardActions>
            {itemActions && itemActions.length && (
              <PageActions
                actions={itemActions}
                position={DropdownPosition.right}
                selectedItem={item}
                iconOnly
                collapse="always"
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
          <CardFooterDiv>
            <CardFooterLabelsDiv>
              {card.labels && (
                <LabelGroup numLabels={999}>
                  {card.labels.map((item) => (
                    <Label key={item.label} color={item.color}>
                      <Truncate content={item.label} style={{ minWidth: 0 }} />
                    </Label>
                  ))}
                </LabelGroup>
              )}
            </CardFooterLabelsDiv>
          </CardFooterDiv>
        </CardFooter>
      )}
      {card.alertTitle && (
        <Alert title={card.alertTitle} isInline variant={card.alertVariant}>
          {card.alertContent}
        </Alert>
      )}
    </Card>
  );
}

export function useColumnsToTableCardFn<T extends object>(
  columns: ITableColumn<T>[],
  keyFn: (item: T) => string | number
): (item: T) => IPageTableCard {
  const data = useMemo(() => {
    let nameColumn: ITableColumn<T> | undefined;
    let subtitleColumn: ITableColumn<T> | undefined;
    let descriptionColumn: ITableColumn<T> | undefined;
    const countColumns: ITableColumnTypeCount<T>[] = [];
    let labelColumn: ITableColumnTypeLabels<T> | undefined;
    const cardColumns: ITableColumn<T>[] = [];

    for (const column of columns) {
      switch (column.type) {
        case 'description':
          if (!descriptionColumn) descriptionColumn = column;
          break;
        case 'labels':
          if (!labelColumn) labelColumn = column;
          break;
        case 'count':
          countColumns.push(column);
          break;
        default:
          switch (column.card) {
            case 'name':
              nameColumn = column;
              break;
            case 'subtitle':
              subtitleColumn = column;
              break;
            case 'description':
              descriptionColumn = column;
              break;
            case 'hidden':
              break;
            default:
              cardColumns.push(column);
              break;
          }
          break;
      }
    }
    return {
      nameColumn,
      subtitleColumn,
      descriptionColumn,
      countColumns,
      cardColumns,
      labelColumn,
    };
  }, [columns]);

  const { nameColumn, subtitleColumn, descriptionColumn, countColumns, cardColumns, labelColumn } =
    data;

  return useMemo<(item: T) => IPageTableCard>(() => {
    return (item: T) => {
      const hasDescription =
        descriptionColumn && (!descriptionColumn.value || descriptionColumn.value(item));

      const pageTableCard: IPageTableCard = {
        id: keyFn(item),
        icon: nameColumn?.icon?.(item),
        title: <TableColumnCell column={nameColumn} item={item} />,
        subtitle: subtitleColumn && (!subtitleColumn.value || subtitleColumn.value(item)) && (
          <TableColumnCell column={subtitleColumn} item={item} />
        ),
        cardBody: (
          <CardBody>
            <DescriptionList isCompact>
              {hasDescription && (
                <PageDetail key={descriptionColumn.id}>
                  {descriptionColumn.type === 'description' ? (
                    <div>{descriptionColumn.value(item)}</div>
                  ) : (
                    <TableColumnCell column={descriptionColumn} item={item} />
                  )}
                </PageDetail>
              )}
              {cardColumns
                .filter((column) => !column.value || column.value(item))
                .map((column) => (
                  <PageDetail key={column.id} label={column.header}>
                    <TableColumnCell column={column} item={item} />
                  </PageDetail>
                ))}
              {countColumns.length > 0 && (
                <PageDetail>
                  <div style={{ display: 'flex', gap: 16, marginTop: 8, flexWrap: 'wrap' }}>
                    {countColumns.map((column, i) => (
                      <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'baseline' }}>
                        <TableColumnCell column={column} item={item} />
                        <small style={{ opacity: 0.7 }}>{column.header}</small>
                      </div>
                    ))}
                  </div>
                </PageDetail>
              )}
            </DescriptionList>
          </CardBody>
        ),
        labels: labelColumn && labelColumn.value(item)?.map((label) => ({ label })),
      };
      if (!hasDescription && cardColumns.length === 0 && countColumns.length === 0) {
        pageTableCard.cardBody = undefined;
      }
      return pageTableCard;
    };
  }, [
    cardColumns,
    countColumns,
    descriptionColumn,
    labelColumn,
    nameColumn,
    subtitleColumn,
    keyFn,
  ]);
}
