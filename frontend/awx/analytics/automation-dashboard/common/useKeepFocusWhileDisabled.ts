import { useLayoutEffect, useRef } from 'react';

/**
 * Keeps the focus of a control that gets disabled (a disabled control drops the focus to the
 * page): while `isDisabled`, the focus moves from the element with `elementId` to the one with
 * `fallbackId`, and back once it is enabled again, if the focus is still on the fallback.
 */
export function useKeepFocusWhileDisabled(
  isDisabled: boolean,
  elementId: string,
  fallbackId: string
) {
  const hasMovedFocusRef = useRef(false);
  useLayoutEffect(() => {
    const activeId = document.activeElement?.id;
    if (isDisabled) {
      if (activeId !== elementId) return;
      hasMovedFocusRef.current = true;
      document.getElementById(fallbackId)?.focus();
      return;
    }
    if (!hasMovedFocusRef.current) return;
    hasMovedFocusRef.current = false;
    if (activeId === fallbackId) document.getElementById(elementId)?.focus();
  }, [isDisabled, elementId, fallbackId]);
}
