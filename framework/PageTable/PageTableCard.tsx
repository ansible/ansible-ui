/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-empty-function */
import {
  Alert,
  Card,
  CardFooter,
  CardHeader,
  CardTitle,
  Content,
  DescriptionList,
  FlexItem,
  Label,
  LabelGroup,
  Popover,
  Truncate,
} from '@patternfly/react-core';
import { ReactNode, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { IPageAction } from '../PageActions/PageAction';
import { PageActions } from '../PageActions/PageActions';
import { PageDetail } from '../PageDetails/PageDetail';
import { IconWrapper } from '../components/IconWrapper';
import { Scrollable } from '../components/Scrollable';
import { LabelColor } from '../components/pfcolors';
import {
  CellFn,
  ITableColumn,
  ITableColumnTypeCount,
  ITableColumnTypeLabels,
  TableColumnCell,
} from './PageTableColumn';

export const Small = styled.small`
  opacity: 0.7;
`;
export interface IPageTableCard {
  id: string | number;
  icon?: ReactNode;
  title: ReactNode;
  iconAboveTitle?: boolean;
  subtitle?: ReactNode;
  cardBody: ReactNode;
  labels?: {
    label: string;
    color?: LabelColor;
    icon?: ReactNode;
    variant?: 'outline' | 'filled' | undefined;
  }[]; // TODO - disable/enable auto generated filters
  badge?: string;
  badgeColor?: LabelColor;
  badgeTooltip?: string;
  badgeTooltipTitle?: string;
  alertTitle?: string;
  alertContent?: ReactNode;
  alertVariant?: 'success' | 'danger' | 'warning' | 'info' | 'custom';
}

const CardHeaderDiv = styled.div`
  display: flex;
  flex-wrap: nowrap;
  max-width: 100%;
`;

const CardIconDiv = styled.div`
  margin-bottom: 16px;
`;

const CardTopDiv = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
  max-width: 100%;
`;

const CardDiv = styled.div`
  max-width: 100%;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const CardFooterDiv = styled.div`
  display: flex;
  flex-direction: row;
  align-items: end;
  gap: 16px;
  flex-wrap: wrap;
`;

const CardFooterLabelsDiv = styled.div`
  flex-grow: 1;
`;

export const PageDetailDiv = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 8px;
  flex-wrap: wrap;
`;

export const ColumnsDiv = styled.div`
  display: flex;
  gap: 6px;
  align-items: baseline;
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

  return (
    <Card
      id={`card-${card.id}`}
      ouiaId={card.id as string}
      key={card.id ?? card.title}
      isLarge
      isSelectable={showSelect}
      isSelected={isItemSelected}
      isClickable={showSelect}
      style={{
        transition: 'box-shadow 0.25s',
        cursor: 'default',
        maxWidth: '100%',
      }}
      // variant="secondary"
    >
      <CardHeader
        selectableActions={
          showSelect
            ? {
                selectableActionId: `card-${card.id}-checkbox`,
                onChange: onSelectClick,
              }
            : undefined
        }
        style={{ display: 'flex', flexWrap: 'nowrap', maxWidth: '100%' }}
      >
        <CardHeaderDiv>
          <CardTopDiv>
            {card.iconAboveTitle
              ? null
              : card.icon && <IconWrapper size="xl">{card.icon}</IconWrapper>}
            <CardDiv>
              {card.iconAboveTitle ? (
                <CardIconDiv>
                  {card.icon && <IconWrapper size="xl">{card.icon}</IconWrapper>}
                </CardIconDiv>
              ) : null}
              <CardTitle>{card.title}</CardTitle>
              {card.subtitle ? (
                <Content component="small" style={{ opacity: 0.7 }}>
                  {card.subtitle}
                </Content>
              ) : (
                defaultCardSubtitle && (
                  <Content component="small" style={{ opacity: 0.7 }}>
                    {defaultCardSubtitle}
                  </Content>
                )
              )}
            </CardDiv>
          </CardTopDiv>
          {card.badge && card.badgeTooltip && (
            <FlexItem>
              {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
              <div onClick={(e) => e.stopPropagation()}>
                <Popover headerContent={card.badgeTooltipTitle} bodyContent={card.badgeTooltip}>
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
      </CardHeader>
      <div
        style={{
          overflow: 'hidden',
          display: 'flex',
          paddingBottom: 16,
          flexGrow: 1,
        }}
      >
        <Scrollable>{card.cardBody}</Scrollable>
      </div>
      {card.labels || (itemActions && itemActions.length) ? (
        <CardFooter>
          <CardFooterDiv>
            <CardFooterLabelsDiv>
              {card.labels && (
                <LabelGroup numLabels={999}>
                  {card.labels.map((item) => (
                    <Label
                      key={item.label}
                      color={item.color}
                      icon={item.icon}
                      variant={item.variant}
                    >
                      <Truncate content={item.label} style={{ minWidth: 0 }} />
                    </Label>
                  ))}
                </LabelGroup>
              )}
            </CardFooterLabelsDiv>
            {itemActions && itemActions.length ? (
              <div
                style={{ marginRight: -16, alignSelf: 'end', justifySelf: 'flex-end', flexGrow: 1 }}
              >
                <PageActions
                  actions={itemActions}
                  position={'right'}
                  selectedItem={item}
                  iconOnly
                />
              </div>
            ) : null}
          </CardFooterDiv>
        </CardFooter>
      ) : null}
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
      if (column.card === 'hidden') continue;
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
      let hasDescription = !!descriptionColumn;
      if (descriptionColumn?.value && !descriptionColumn.value(item)) {
        hasDescription = false;
      }

      const visibleCardColumns = cardColumns.filter(
        (column) => !column.value || column.value(item)
      );

      const to = nameColumn && 'to' in nameColumn ? nameColumn.to : undefined;
      let value: CellFn<T, ReactNode> | undefined =
        nameColumn && 'value' in nameColumn ? nameColumn.value : undefined;
      if (!value) {
        value = nameColumn && 'cell' in nameColumn ? nameColumn.cell : undefined;
      }
      const cardTitle = value?.(item) ?? '';

      const titleUrl = to?.(item);
      const titleContent =
        typeof cardTitle === 'string'
          ? cardTitle.split('/').map((part, i) => (
              <span key={`${i}-${part}`}>
                {i > 0 && <br />}
                {part}
              </span>
            ))
          : cardTitle;

      const pageTableCard: IPageTableCard = {
        id: keyFn(item),
        icon: nameColumn?.icon?.(item),
        title: titleUrl ? (
          <Link to={titleUrl} style={{ whiteSpace: 'normal', textWrap: 'balance' }}>
            {titleContent}
          </Link>
        ) : (
          <span style={{ whiteSpace: 'normal', textWrap: 'balance' }}>{titleContent}</span>
        ),
        subtitle: subtitleColumn && (!subtitleColumn.value || subtitleColumn.value(item)) && (
          <TableColumnCell column={subtitleColumn} item={item} />
        ),
        cardBody: (
          <DescriptionList isCompact style={{ paddingLeft: 32, paddingRight: 32 }}>
            {hasDescription && descriptionColumn && (
              <PageDetail key={descriptionColumn.id ?? descriptionColumn.header}>
                {descriptionColumn.type === 'description' ? (
                  <div>{descriptionColumn.value(item)}</div>
                ) : (
                  <TableColumnCell column={descriptionColumn} item={item} />
                )}
              </PageDetail>
            )}
            {visibleCardColumns.map((column) => (
              <PageDetail key={column.id ?? column.header} label={column.header}>
                <TableColumnCell column={column} item={item} />
              </PageDetail>
            ))}
            {countColumns.length > 0 && (
              <PageDetail key="count-columns">
                <PageDetailDiv>
                  {countColumns.map((column, i) => (
                    <ColumnsDiv key={i}>
                      <TableColumnCell column={column} item={item} />
                      <Small>{column.header}</Small>
                    </ColumnsDiv>
                  ))}
                </PageDetailDiv>
              </PageDetail>
            )}
          </DescriptionList>
        ),
        labels: labelColumn && labelColumn.value(item)?.map((label) => ({ label })),
      };
      if (!hasDescription && visibleCardColumns.length === 0 && countColumns.length === 0) {
        pageTableCard.cardBody = <div style={{ flexGrow: 1 }} />;
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
