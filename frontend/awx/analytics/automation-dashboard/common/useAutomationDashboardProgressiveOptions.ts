import {
  KeyboardEvent,
  RefObject,
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

/** The options rendered at first and added each time the list is scrolled near its end. */
export const OPTION_RENDER_BATCH_SIZE = 200;

/** How close (in pixels) to the end of the rendered options scrolling renders the next batch. */
const SCROLL_THRESHOLD = 100;

/** The focusable part of a rendered option. */
const OPTION_SELECTOR = 'ul li input, ul li button';

/**
 * Renders the options of the dashboard multi-select in batches: a bulk action may load
 * thousands of options, and rendering all of them makes the select slow. The next batch is
 * rendered when the list is scrolled near its end, or when ArrowDown is pressed on the last
 * rendered option (it then moves to the next one). End on an option renders every option and
 * moves to the last one, as it does in a list rendered at once. The rendered options stay normal DOM
 * elements, so the PatternFly keyboard navigation and the menu's Tab stops keep working.
 *
 * @param options The options to render, in order.
 * @param resetKey Renders only the first batch again when it changes (e.g. the search).
 * @param menuRef The menu that contains the option list.
 */
export function useAutomationDashboardProgressiveOptions<T>(
  options: T[],
  resetKey: string,
  menuRef: RefObject<HTMLElement>
) {
  const [limit, setLimit] = useState(OPTION_RENDER_BATCH_SIZE);
  // Resets during the render, so the whole list is never rendered for a new search.
  const [limitResetKey, setLimitResetKey] = useState(resetKey);
  if (limitResetKey !== resetKey) {
    setLimitResetKey(resetKey);
    setLimit(OPTION_RENDER_BATCH_SIZE);
  }
  const hasMore = options.length > limit;
  const renderedOptions = useMemo(
    () => (hasMore ? options.slice(0, limit) : options),
    [options, limit, hasMore]
  );
  const showMore = useCallback(() => setLimit((current) => current + OPTION_RENDER_BATCH_SIZE), []);

  /** For the `Scrollable` around the list: renders the next batch near the end of the list. */
  // The scroll container also reports on every render (not only when scrolled): the height of
  // the list is read (a layout) only when its scroll position changed and more can be rendered.
  const lastBottomRef = useRef<number>();
  const onScroll = useCallback(
    ({ bottom }: { bottom: number }) => {
      if (!hasMore || bottom === lastBottomRef.current) return;
      const listHeight = menuRef.current?.querySelector('ul')?.offsetHeight ?? 0;
      // A list without a height is not laid out (e.g. not shown yet): checked again later.
      if (listHeight === 0) return;
      lastBottomRef.current = bottom;
      if (bottom >= listHeight - SCROLL_THRESHOLD) showMore();
    },
    [hasMore, menuRef, showMore]
  );

  /** The index of the option to focus once the next batch is rendered. */
  const focusIndexRef = useRef<number>();
  /**
   * For the menu: ArrowDown on the last rendered option renders the next batch and moves on;
   * End on an option renders every option and moves to the last one.
   */
  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      if ((event.key !== 'ArrowDown' && event.key !== 'End') || !hasMore) return;
      const active = document.activeElement;
      if (!active) return;
      const rendered: Element[] = [...(menuRef.current?.querySelectorAll(OPTION_SELECTOR) ?? [])];
      const index = rendered.indexOf(active);
      if (index === -1 || (event.key === 'ArrowDown' && index !== rendered.length - 1)) return;
      // The PatternFly menu would move the focus to the first or the last rendered option.
      event.preventDefault();
      event.stopPropagation();
      if (event.key === 'End') {
        focusIndexRef.current = options.length - 1;
        setLimit(options.length);
        return;
      }
      focusIndexRef.current = rendered.length;
      showMore();
    },
    [hasMore, menuRef, options.length, showMore]
  );
  useLayoutEffect(() => {
    const index = focusIndexRef.current;
    if (index === undefined) return;
    focusIndexRef.current = undefined;
    menuRef.current?.querySelectorAll<HTMLElement>(OPTION_SELECTOR)[index]?.focus();
  }, [menuRef, renderedOptions]);

  return { renderedOptions, onScroll, onKeyDown };
}
