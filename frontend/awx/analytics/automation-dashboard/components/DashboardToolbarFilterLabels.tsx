import {
  Label,
  LabelGroup,
  ToolbarContentContext,
  ToolbarContext,
  ToolbarItem,
} from '@patternfly/react-core';
import { ReactNode, useContext, useEffect, useId } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

export interface DashboardToolbarFilterLabel {
  /** The filter value. */
  key: string;
  /** The shown name, e.g. an element that loads it. */
  node: ReactNode;
}

/**
 * The chips of a toolbar filter, as PatternFly `ToolbarFilter` renders them (in the toolbar's
 * label container, counted for "Clear all filters"), without the filter input. Each close button
 * is named by the chip's rendered text ("Close <name>"): `ToolbarFilter` names it
 * `Close ${children}`, which is "Close [object Object]" for a name that is an element, e.g. one
 * that is still loading.
 */
export function DashboardToolbarFilterLabels(
  props: Readonly<{
    /** The filter key, also the category the toolbar counts the chips by. */
    categoryKey: string;
    /** The filter name, shown in front of the chips. */
    categoryName: string;
    labels: DashboardToolbarFilterLabel[];
    onDelete: (value: string) => void;
    onDeleteAll: () => void;
  }>
) {
  const { t } = useTranslation();
  const { categoryKey, categoryName, labels, onDelete, onDeleteAll } = props;
  const { isExpanded, labelGroupContentRef, updateNumberFilters } = useContext(ToolbarContext);
  const { labelContainerRef } = useContext(ToolbarContentContext);
  const idPrefix = useId();

  // The toolbar shows "Clear all filters" and the collapsed count from these numbers. A changed
  // count re-renders the toolbar, so chips shown before its containers existed (its first render)
  // are rendered again into them.
  useEffect(() => {
    updateNumberFilters(categoryKey, labels.length);
  }, [updateNumberFilters, categoryKey, labels.length]);

  if (labels.length === 0) return null;
  const container = isExpanded
    ? (labelContainerRef?.current as HTMLElement | null | undefined)
    : labelGroupContentRef?.current?.firstElementChild;
  if (!container) return null;

  return createPortal(
    <ToolbarItem variant="label-group">
      <LabelGroup categoryName={categoryName} isClosable onClick={onDeleteAll}>
        {labels.map((label, index) => {
          const buttonId = `${idPrefix}-close-${index}`;
          const textId = `${idPrefix}-text-${index}`;
          return (
            <Label
              key={label.key}
              onClose={() => onDelete(label.key)}
              closeBtnAriaLabel={t('Close')}
              // The name is "Close" and the chip's rendered text, also when that text loads later.
              closeBtnProps={{ id: buttonId, 'aria-labelledby': `${buttonId} ${textId}` }}
            >
              <span id={textId}>{label.node}</span>
            </Label>
          );
        })}
      </LabelGroup>
    </ToolbarItem>,
    container
  );
}
