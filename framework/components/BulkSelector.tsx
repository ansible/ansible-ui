import {
  Dropdown,
  DropdownItem,
  DropdownToggle,
  DropdownToggleCheckbox,
} from '@patternfly/react-core/deprecated';
import { useCallback, useMemo, useState } from 'react';
import { useFrameworkTranslations } from '../useFrameworkTranslations';
import { useBreakpoint } from './useBreakPoint';

export interface BulkSelectorProps<T> {
  itemCount?: number;
  pageItems?: T[];
  selectedItems?: T[];
  selectItems?: (items: T[]) => void;
  unselectAll?: () => void;
  keyFn: (item: T) => string | number;
  selectNoneText?: string;
  /** Optional: Max selections permitted in a table. The bulk selector is disabled based on this value.
   */
  maxSelections?: number;
}

export function BulkSelector<T extends object>(props: BulkSelectorProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const isSmallOrLarger = useBreakpoint('sm');
  const [translations] = useFrameworkTranslations();

  const { pageItems, selectedItems, selectItems, unselectAll, maxSelections } = props;

  const allPageItemsSelected =
    props.itemCount !== undefined &&
    props.itemCount > 0 &&
    pageItems &&
    pageItems.length > 0 &&
    (pageItems ?? []).every((item) => selectedItems?.includes(item));

  const onToggleCheckbox = useCallback(() => {
    if (allPageItemsSelected) {
      unselectAll?.();
    } else {
      selectItems?.(pageItems ?? []);
    }
  }, [allPageItemsSelected, unselectAll, selectItems, pageItems]);

  const toggleText = useMemo(() => {
    if (isSmallOrLarger) {
      if (selectedItems && selectedItems.length > 0) {
        return `${selectedItems.length} selected`;
      }
      return '';
    } else {
      if (selectedItems && selectedItems.length > 0) {
        return `${selectedItems.length}`;
      }
      return '';
    }
  }, [isSmallOrLarger, selectedItems]);

  const unselectedPageItems = useMemo(
    () => pageItems?.filter((item) => !selectedItems?.includes(item)),
    [pageItems, selectedItems]
  );

  /** Disable bulk selection if max number of allowed selections has been specified and
   * bulk selection on the page will cause the number of selections to exceed the max allowed
   * selections.
   */
  const disableBulkSelector = useMemo(
    () =>
      Boolean(
        maxSelections &&
          selectedItems &&
          unselectedPageItems &&
          !allPageItemsSelected &&
          selectedItems?.length + unselectedPageItems.length > maxSelections
      ),
    [allPageItemsSelected, maxSelections, selectedItems, unselectedPageItems]
  );

  const toggle = useMemo(() => {
    const selectedCount = selectedItems ? selectedItems.length : 0;
    return (
      <DropdownToggle
        splitButtonItems={[
          <DropdownToggleCheckbox
            id="select-all"
            ouiaId={'select-all'}
            key="select-all"
            data-cy="select-all"
            aria-label="Select all"
            isChecked={allPageItemsSelected ? true : selectedCount > 0 ? null : false}
            onChange={onToggleCheckbox}
          >
            {toggleText}
          </DropdownToggleCheckbox>,
        ]}
        onToggle={(_event, isOpen) => setIsOpen(isOpen)}
        isDisabled={disableBulkSelector}
      />
    );
  }, [selectedItems, allPageItemsSelected, onToggleCheckbox, toggleText, disableBulkSelector]);

  const selectNoneDropdownItem = useMemo(() => {
    return (
      <DropdownItem
        id="select-none"
        ouiaId={'select-none'}
        key="select-none"
        onClick={() => {
          unselectAll?.();
          setIsOpen(false);
        }}
      >
        {props.selectNoneText ?? translations.selectNone}
      </DropdownItem>
    );
  }, [props.selectNoneText, translations.selectNone, unselectAll]);

  const selectPageDropdownItem = useMemo(() => {
    return (
      <DropdownItem
        id="select-page"
        ouiaId={'select-page'}
        key="select-page"
        onClick={() => {
          selectItems?.(pageItems ?? []);
          setIsOpen(false);
        }}
      >
        {`Select ${pageItems?.length ?? 0} page items`}
      </DropdownItem>
    );
  }, [selectItems, pageItems]);

  const dropdownItems = useMemo(() => {
    const hasSelectedItems = selectedItems && selectedItems.length > 0;

    if (hasSelectedItems) {
      return [selectNoneDropdownItem, selectPageDropdownItem];
    } else {
      return [selectPageDropdownItem];
    }
  }, [selectNoneDropdownItem, selectPageDropdownItem, selectedItems]);

  return (
    // Negative margin is needed to align the bulk select with table checkboxes
    <div style={{ marginLeft: -8 }}>
      <Dropdown
        isOpen={isOpen}
        toggle={toggle}
        dropdownItems={dropdownItems}
        // ZIndex 400 is needed for PF table stick headers
        style={{ zIndex: 400 }}
      />
    </div>
  );
}
