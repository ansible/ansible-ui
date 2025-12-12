import {
  Dropdown,
  DropdownItem,
  DropdownList,
  MenuToggle,
  MenuToggleCheckbox,
  MenuToggleElement,
} from '@patternfly/react-core';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
        return t('{{count}} selected', { count: selectedItems.length });
      }
      return '';
    } else {
      if (selectedItems && selectedItems.length > 0) {
        return `${selectedItems.length}`;
      }
      return '';
    }
  }, [isSmallOrLarger, selectedItems, t]);

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

  const toggle = useCallback(
    (toggleRef: React.Ref<MenuToggleElement>) => {
      const selectedCount = selectedItems ? selectedItems.length : 0;
      return (
        <MenuToggle
          splitButtonItems={[
            <MenuToggleCheckbox
              id="select-all"
              data-cy="select-all"
              data-testid="select-all"
              ouiaId={'select-all'}
              key="select-all"
              aria-label={t('Select all')}
              isChecked={allPageItemsSelected ? true : selectedCount > 0 ? null : false}
              onChange={onToggleCheckbox}
            >
              {toggleText}
            </MenuToggleCheckbox>,
          ]}
          onClick={() => setIsOpen(!isOpen)}
          isDisabled={disableBulkSelector}
          ref={toggleRef}
        />
      );
    },
    [
      selectedItems,
      allPageItemsSelected,
      onToggleCheckbox,
      toggleText,
      disableBulkSelector,
      isOpen,
      t,
    ]
  );

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
        {t('Select {{count}} page items', { count: pageItems?.length ?? 0 })}
      </DropdownItem>
    );
  }, [selectItems, pageItems, t]);

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
    <div>
      <Dropdown
        style={{ zIndex: 400 }}
        toggle={toggle}
        isOpen={isOpen}
        onOpenChange={(open) => setIsOpen(open)}
      >
        <DropdownList>{dropdownItems}</DropdownList>
      </Dropdown>
    </div>
  );
}
