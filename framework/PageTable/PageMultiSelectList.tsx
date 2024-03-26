import { Label, LabelGroup, Skeleton, Split, SplitItem } from '@patternfly/react-core';
import { IToolbarFilter } from '../PageToolbar/PageToolbarFilter';
import { IView } from '../useView';
import { ITableColumn, TableColumnCell } from './PageTableColumn';
import { ISelected } from './useTableItems';
import { useFrameworkTranslations } from '../useFrameworkTranslations';
import { PageTable } from './PageTable';

export type PageMultiSelectListProps<T extends object> = {
  labelForSelectedItems?: string;
  view: IView & ISelected<T> & { itemCount?: number; pageItems: T[] | undefined };
  tableColumns: ITableColumn<T>[];
  toolbarFilters: IToolbarFilter[];
  // onSelect: (items: T[]) => void;
  emptyStateTitle?: string;
  errorStateTitle?: string;
  defaultSort?: string;
  maxSelections?: number;
  isCompact?: boolean;
};

export function PageMultiSelectList<T extends object>(props: PageMultiSelectListProps<T>) {
  const { view, tableColumns, toolbarFilters, maxSelections, labelForSelectedItems, isCompact } =
    props;
  const [translations] = useFrameworkTranslations();

  if (view.itemCount === undefined) {
    return <Skeleton height="80px" />;
  }

  return (
    <>
      <Split hasGutter>
        <SplitItem style={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>
          {labelForSelectedItems ?? translations.selectedText}
        </SplitItem>
        {view.selectedItems.length > 0 ? (
          <LabelGroup>
            {view.selectedItems.map((item, i) => {
              if (tableColumns && tableColumns.length > 0) {
                return (
                  <Label key={i} onClose={() => view.unselectItem(item)}>
                    <TableColumnCell
                      item={item}
                      column={
                        tableColumns.find(
                          (column) => column.card === 'name' || column.list === 'name'
                        ) ?? tableColumns[0]
                      }
                    />
                  </Label>
                );
              }
              return <></>;
            })}
          </LabelGroup>
        ) : (
          <SplitItem style={{ fontStyle: 'italic' }}>{translations.noneSelectedText}</SplitItem>
        )}
      </Split>
      <PageTable<T>
        tableColumns={tableColumns}
        toolbarFilters={toolbarFilters}
        {...view}
        emptyStateTitle={props.emptyStateTitle ?? translations.noItemsFound}
        errorStateTitle={props.errorStateTitle ?? translations.errorText}
        showSelect
        disableCardView
        disableListView
        compact={isCompact}
        disableBodyPadding
        maxSelections={maxSelections}
      />
    </>
  );
}
