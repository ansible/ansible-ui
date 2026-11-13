import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  OPTION_RENDER_BATCH_SIZE,
  useAutomationDashboardProgressiveOptions,
} from './useAutomationDashboardProgressiveOptions';

/** More options than one batch. */
const options = Array.from({ length: OPTION_RENDER_BATCH_SIZE + 10 }, (_, index) => index);

/** A menu with a list whose height reads are counted. */
function renderProgressiveOptions(height = 1000) {
  const menu = document.createElement('div');
  const list = document.createElement('ul');
  menu.append(list);
  const heightReads = vi.spyOn(list, 'offsetHeight', 'get').mockReturnValue(height);
  const rendered = renderHook(() =>
    useAutomationDashboardProgressiveOptions(options, 'key', { current: menu })
  );
  return { ...rendered, heightReads };
}

describe('useAutomationDashboardProgressiveOptions', () => {
  afterEach(() => vi.restoreAllMocks());

  it('reads the height of the list only when the scroll position changed', () => {
    const { result, heightReads } = renderProgressiveOptions();

    // The scroll container also reports on every render with the same position.
    act(() => result.current.onScroll({ bottom: 300 }));
    act(() => result.current.onScroll({ bottom: 300 }));
    expect(heightReads).toHaveBeenCalledTimes(1);

    act(() => result.current.onScroll({ bottom: 400 }));
    expect(heightReads).toHaveBeenCalledTimes(2);
  });

  it('renders the next batch near the end of the list', () => {
    const { result } = renderProgressiveOptions();

    act(() => result.current.onScroll({ bottom: 950 }));

    expect(result.current.renderedOptions).toHaveLength(options.length);
  });

  it('does not read the height when every option is rendered', () => {
    const { result, heightReads } = renderProgressiveOptions();
    act(() => result.current.onScroll({ bottom: 950 }));
    heightReads.mockClear();

    act(() => result.current.onScroll({ bottom: 990 }));

    expect(heightReads).not.toHaveBeenCalled();
  });
});
