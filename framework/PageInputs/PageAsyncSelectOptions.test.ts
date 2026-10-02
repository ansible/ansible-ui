import { afterEach, describe, expect, it, vi } from 'vitest';
import { deferPageSelect, mergePageSelectOptions } from './PageAsyncSelectOptions';

describe('PageAsyncSelectOptions', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('should merge unique options and sort case-insensitively', () => {
    const options = mergePageSelectOptions(
      [{ value: 1, label: 'Same' }],
      [
        { value: 1, label: 'Same' },
        { value: 2, label: 'same' },
        { value: 3, label: 'Other' },
      ],
      true
    );

    expect(options).toEqual([
      { value: 3, label: 'Other' },
      { value: 1, label: 'Same' },
      { value: 2, label: 'same' },
    ]);
  });

  it('should defer selecting an option', () => {
    vi.useFakeTimers();
    const onSelect = vi.fn();

    deferPageSelect(onSelect, 42);

    expect(onSelect).not.toHaveBeenCalled();
    vi.runAllTimers();
    expect(onSelect).toHaveBeenCalledWith(42);
  });
});
