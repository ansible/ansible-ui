import {
  Button,
  Split,
  ToolbarGroup,
  ToolbarItem,
  ToolbarToggleGroup,
} from '@patternfly/react-core';
import {
  SortAlphaDownAltIcon,
  SortAlphaUpIcon,
  SortAmountDownIcon,
  SortAmountUpIcon,
  SortNumericDownAltIcon,
  SortNumericUpIcon,
} from '@patternfly/react-icons';
import { useCallback, useMemo } from 'react';
import { PageSingleSelect } from '../PageInputs/PageSingleSelect';
import { ITableColumn } from '../PageTable/PageTableColumn';
import { useTranslation } from 'react-i18next';
export type PageToolbarSortProps = {
  sort?: string;
  setSort?: (sort: string) => void;
  sortDirection?: 'asc' | 'desc';
  setSortDirection?: (sortDirection: 'asc' | 'desc') => void;
  sortOptions?: PageTableSortOption[];
};

export interface PageTableSortOption {
  label: string;
  value: string;
  type?: 'text' | 'number' | undefined;
  defaultDirection?: 'asc' | 'desc';
}

export function PageToolbarSort(props: PageToolbarSortProps) {
  const { sort, setSort, sortDirection, setSortDirection, sortOptions } = props;

  const sortOption = sortOptions?.find((sortOption) => sortOption.value === sort);
  const sortType = sortOption ? sortOption.type : undefined;

  const { t } = useTranslation();
  const sortDirectionIcon = useMemo(() => {
    switch (sortType) {
      case 'text':
        switch (sortDirection) {
          case 'asc':
            return <SortAlphaUpIcon />;
          case 'desc':
            return <SortAlphaDownAltIcon />;
        }
        break;
      case 'number':
        switch (sortDirection) {
          case 'asc':
            return <SortNumericUpIcon />;
          case 'desc':
            return <SortNumericDownAltIcon />;
        }
        break;
      default:
        switch (sortDirection) {
          case 'asc':
            return <SortAmountUpIcon />;
          case 'desc':
            return <SortAmountDownIcon />;
        }
        break;
    }
    return <></>;
  }, [sortDirection, sortType]);

  if (!sortOptions || sortOptions.length <= 0) return <></>;

  return (
    <ToolbarToggleGroup breakpoint="md" toggleIcon={undefined}>
      <ToolbarGroup variant="filter-group">
        <ToolbarItem variant="label">{t('Sort')}</ToolbarItem>
        <ToolbarItem>
          <Split>
            <ToolbarSortSelect
              sortOptions={sortOptions}
              sort={sort}
              setSort={setSort}
              setSortDirection={setSortDirection}
            />
            <Button
              variant="control"
              icon={sortDirectionIcon}
              onClick={() => {
                if (sortDirection === 'asc') setSortDirection?.('desc');
                else setSortDirection?.('asc');
              }}
            />
          </Split>
        </ToolbarItem>
      </ToolbarGroup>
    </ToolbarToggleGroup>
  );
}

function ToolbarSortSelect(props: {
  sort?: string;
  setSort?: (sort: string) => void;
  setSortDirection?: (sortDirection: 'asc' | 'desc') => void;
  sortOptions: PageTableSortOption[];
}) {
  const { sortOptions, sort, setSort, setSortDirection } = props;
  const onSelect = useCallback(
    (value: string | undefined) => {
      if (value) {
        const sortOption = sortOptions.find((option) => option.value === value);
        if (sortOption && sort !== value && sortOption.defaultDirection) {
          setSortDirection?.(sortOption.defaultDirection);
        }
        setSort?.(value);
      }
    },
    [sortOptions, setSort, setSortDirection, sort]
  );
  return (
    <PageSingleSelect
      placeholder=""
      value={sort}
      onSelect={onSelect}
      options={sortOptions.map((option) => ({
        label: option.label,
        value: option.value,
      }))}
    />
  );
}

export function usePageToolbarSortOptionsFromColumns<T extends object>(
  tableColumns: ITableColumn<T>[]
) {
  const sortOptions = useMemo(() => {
    const sortOptions: PageTableSortOption[] = [];
    for (const column of tableColumns) {
      if (column.sort) {
        if (column.defaultSort) {
          // Assumes the default sort is a text column
          sortOptions.push({
            label: column.header,
            value: column.sort,
            type: 'text',
            defaultDirection: column.defaultSortDirection,
          });
          continue;
        }

        switch (column.type) {
          case 'count':
            sortOptions.push({
              label: column.header,
              value: column.sort,
              type: 'number',
              defaultDirection: column.defaultSortDirection,
            });
            break;
          case 'text':
            sortOptions.push({
              label: column.header,
              value: column.sort,
              type: 'text',
              defaultDirection: column.defaultSortDirection,
            });
            break;
          default:
            sortOptions.push({
              label: column.header,
              value: column.sort,
              defaultDirection: column.defaultSortDirection,
            });
            break;
        }
      }
    }
    return sortOptions;
  }, [tableColumns]);
  return sortOptions;
}
